import { composeImagePrompt } from "@/lib/ai/prompt-composer";
import { getPromptLibraryEntry } from "@/lib/ai/prompt-library";
import { generateCaption } from "@/lib/ai/caption-provider";
import { generateImage, isPlaceholderImageUrl } from "@/lib/ai/image-provider";
import { applyLogoOverlay } from "@/lib/ai/logo-pipeline";
import {
  checkGeneratedImageQuality,
  shouldRetryQualityCheck,
} from "@/lib/ai/quality-checker";
import { MAX_JOB_RETRIES } from "@/lib/config";
import { consumeRevisionCredit } from "@/lib/jobs";
import { projectToBrandContext } from "@/lib/generation/project-service";
import { resolveAspectRatio } from "@/lib/image-formats";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { scheduleQueueProcessing } from "@/lib/generation/schedule-queue";

type JobRow = {
  id: string;
  project_id: string;
  user_id: string;
  type: string;
  status: string;
  retry_count: number;
};

function adminClient() {
  const client = createSupabaseAdminClient();
  if (!client) {
    throw new Error("SUPABASE_SECRET_KEY gerekli");
  }
  return client;
}

async function getReadClient() {
  return createSupabaseAdminClient() ?? (await createSupabaseServerClient());
}

function nowIso() {
  return new Date().toISOString();
}

export async function findProjectIdByOrderId(userId: string, orderId: string) {
  const supabase = await getReadClient();
  const { data } = await supabase
    .from("projects")
    .select("id, status")
    .eq("user_id", userId)
    .eq("package_type", `order:${orderId}`)
    .maybeSingle();

  return data;
}

export async function recoverStuckJobs(projectId: string) {
  const supabase = adminClient();
  const cutoff = new Date(Date.now() - 8 * 60 * 1000).toISOString();

  await supabase
    .from("generation_jobs")
    .update({
      status: "queued",
      error_message: "Zaman aşımı — otomatik yeniden denenecek",
      updated_at: nowIso(),
    })
    .eq("project_id", projectId)
    .in("status", ["generating_image", "generating_caption", "composing_prompt"])
    .lt("updated_at", cutoff);
}

async function pickNextJob(projectId: string): Promise<JobRow | null> {
  const supabase = adminClient();

  const { data: queued } = await supabase
    .from("generation_jobs")
    .select("id, project_id, user_id, type, status, retry_count")
    .eq("project_id", projectId)
    .eq("status", "queued")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (queued) return queued as JobRow;

  const { data: retryable } = await supabase
    .from("generation_jobs")
    .select("id, project_id, user_id, type, status, retry_count")
    .eq("project_id", projectId)
    .eq("status", "failed")
    .lt("retry_count", MAX_JOB_RETRIES)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return (retryable as JobRow | null) ?? null;
}

async function syncProjectStatus(projectId: string) {
  const supabase = adminClient();

  const { data: jobs } = await supabase
    .from("generation_jobs")
    .select("status")
    .eq("project_id", projectId);

  const list = jobs ?? [];
  const total = list.length;
  const ready = list.filter((j) => j.status === "ready").length;
  const failed = list.filter((j) => j.status === "failed").length;
  const pending = list.filter((j) =>
    ["queued", "generating_image", "generating_caption", "composing_prompt"].includes(j.status),
  ).length;

  if (pending > 0) {
    await supabase
      .from("projects")
      .update({ status: "generating", updated_at: nowIso() })
      .eq("id", projectId);
    return { ready, total, pending, done: false };
  }

  const finalStatus = ready > 0 ? "ready" : "failed";
  await supabase
    .from("projects")
    .update({ status: finalStatus, updated_at: nowIso() })
    .eq("id", projectId);

  return { ready, total, pending: 0, done: true, failed };
}

export async function getProjectStatusAdmin(projectId: string) {
  const supabase = adminClient();

  const { data: project } = await supabase
    .from("projects")
    .select("id, user_id, status, brand_name, generation_stopped_at")
    .eq("id", projectId)
    .maybeSingle();

  if (!project) return null;

  const { data: jobs } = await supabase
    .from("generation_jobs")
    .select("id, status, type, image_url, caption_text, error_message, retry_count")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  const list = jobs ?? [];
  const ready = list.filter((j) => j.status === "ready").length;
  const failed = list.filter((j) => j.status === "failed").length;
  const total = list.length;
  const queued = list.filter((j) => j.status === "queued").length;
  const inProgress = list.filter((j) =>
    ["generating_image", "generating_caption", "composing_prompt"].includes(j.status),
  ).length;

  const done =
    Boolean(project.generation_stopped_at) ||
    (ready + failed >= total && total > 0 && queued === 0 && inProgress === 0);

  return {
    projectId,
    brandName: project.brand_name,
    projectStatus: project.status,
    stopped: Boolean(project.generation_stopped_at),
    total,
    ready,
    failed,
    queued,
    inProgress,
    done,
    progress: total > 0 ? Math.round((ready / total) * 100) : 0,
    jobs: list,
  };
}

export async function regenerateGenerationJob(jobId: string, userId: string) {
  const supabase = adminClient();

  const { data: job } = await supabase
    .from("generation_jobs")
    .select("id, project_id, user_id, status, image_url")
    .eq("id", jobId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!job) {
    throw new Error("Görsel bulunamadı");
  }

  const isUnproduced = job.status === "failed" || !job.image_url;
  const isRevision = job.status === "ready" && Boolean(job.image_url);

  if (!isUnproduced && !isRevision) {
    throw new Error("Bu görsel şu an yeniden üretilemez");
  }

  const { data: project } = await supabase
    .from("projects")
    .select("id, remaining_credits, bonus_credits_granted")
    .eq("id", job.project_id)
    .eq("user_id", userId)
    .maybeSingle();

  if (!project) {
    throw new Error("Proje bulunamadı");
  }

  if (isRevision) {
    const hasCredits =
      project.remaining_credits > 0 || !project.bonus_credits_granted;
    if (!hasCredits) {
      throw new Error("Revizyon hakkınız kalmadı");
    }

    const credit = consumeRevisionCredit(
      project.remaining_credits,
      project.bonus_credits_granted,
    );

    await supabase
      .from("projects")
      .update({
        remaining_credits: credit.remainingCredits,
        bonus_credits_granted: credit.bonusCreditsGranted,
        updated_at: nowIso(),
      })
      .eq("id", project.id);
  }

  const queueTime = new Date(0).toISOString();

  await supabase
    .from("projects")
    .update({
      generation_stopped_at: null,
      status: "generating",
      updated_at: nowIso(),
    })
    .eq("id", job.project_id);

  await supabase
    .from("generation_jobs")
    .update({
      status: "queued",
      retry_count: 0,
      image_url: null,
      thumbnail_url: null,
      caption_text: null,
      hashtags: [],
      error_message: null,
      approved_at: null,
      story_image_url: null,
      story_status: null,
      created_at: queueTime,
      updated_at: nowIso(),
    })
    .eq("id", jobId);

  await syncProjectStatus(job.project_id);
  scheduleQueueProcessing(job.project_id);

  const status = await getProjectStatusAdmin(job.project_id);
  if (!status) {
    throw new Error("Durum alınamadı");
  }

  return { ...status, focusJobId: jobId };
}

export async function stopProjectGeneration(projectId: string, userId: string) {
  const supabase = adminClient();

  const { data: project } = await supabase
    .from("projects")
    .select("id, user_id, generation_stopped_at")
    .eq("id", projectId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!project) {
    throw new Error("Proje bulunamadı");
  }

  if (project.generation_stopped_at) {
    return getProjectStatusAdmin(projectId);
  }

  const stoppedAt = nowIso();

  await supabase
    .from("projects")
    .update({ generation_stopped_at: stoppedAt, updated_at: stoppedAt })
    .eq("id", projectId);

  await supabase
    .from("generation_jobs")
    .update({
      status: "failed",
      error_message: "Üretim kullanıcı tarafından durduruldu",
      updated_at: stoppedAt,
    })
    .eq("project_id", projectId)
    .eq("status", "queued");

  await syncProjectStatus(projectId);

  return getProjectStatusAdmin(projectId);
}

export async function isProjectGenerationStopped(projectId: string) {
  const supabase = adminClient();
  const { data } = await supabase
    .from("projects")
    .select("generation_stopped_at")
    .eq("id", projectId)
    .maybeSingle();

  return Boolean(data?.generation_stopped_at);
}

export async function processOneQueuedJob(projectId: string) {
  const supabase = adminClient();

  if (await isProjectGenerationStopped(projectId)) {
    await supabase
      .from("generation_jobs")
      .update({
        status: "failed",
        error_message: "Üretim kullanıcı tarafından durduruldu",
        updated_at: nowIso(),
      })
      .eq("project_id", projectId)
      .eq("status", "queued");

    const status = await getProjectStatusAdmin(projectId);
    return { processed: false, reason: "stopped", status, shouldContinue: false };
  }

  await recoverStuckJobs(projectId);

  const { data: inFlight } = await supabase
    .from("generation_jobs")
    .select("id")
    .eq("project_id", projectId)
    .in("status", ["generating_image", "generating_caption", "composing_prompt"])
    .limit(1)
    .maybeSingle();

  if (inFlight) {
    const status = await getProjectStatusAdmin(projectId);
    return { processed: false, reason: "busy", status, shouldContinue: true };
  }

  const nextJob = await pickNextJob(projectId);
  if (!nextJob) {
    const status = await syncProjectStatus(projectId);
    const fullStatus = await getProjectStatusAdmin(projectId);
    return {
      processed: false,
      reason: "idle",
      status: fullStatus,
      shouldContinue: false,
      ...status,
    };
  }

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (!project) {
    throw new Error("Proje bulunamadı");
  }

  if (project.generation_stopped_at) {
    const status = await getProjectStatusAdmin(projectId);
    return { processed: false, reason: "stopped", status, shouldContinue: false };
  }

  await supabase
    .from("projects")
    .update({ status: "generating", updated_at: nowIso() })
    .eq("id", projectId);

  await supabase
    .from("generation_jobs")
    .update({ status: "composing_prompt", error_message: null, updated_at: nowIso() })
    .eq("id", nextJob.id);

  const context = projectToBrandContext(project);
  const dayId = nextJob.type;

  try {
    const preview = await composeImagePrompt(context, dayId);

    await supabase
      .from("generation_jobs")
      .update({ status: "generating_image", prompt: preview.prompt, updated_at: nowIso() })
      .eq("id", nextJob.id);

    const image = await generateImage(preview.prompt, [], {
      aspectRatio: resolveAspectRatio(context.postFormat ?? "square"),
    });

    if (isPlaceholderImageUrl(image.imageUrl)) {
      throw new Error("Görsel üretilemedi (placeholder döndü)");
    }

    const finalImageUrl = context.logoUrl
      ? await applyLogoOverlay(image.imageUrl, context.logoUrl)
      : image.imageUrl;

    await supabase
      .from("generation_jobs")
      .update({ status: "generating_caption", updated_at: nowIso() })
      .eq("id", nextJob.id);

    const day = await getPromptLibraryEntry(dayId);

    const quality = await checkGeneratedImageQuality({
      imageUrl: finalImageUrl,
      expectedHeadline: preview.headline,
      brandName: context.brandName,
      brandBrief: preview.brandBrief,
      dayName: day?.name,
      dayCategory: day?.category,
      culturalContext: day?.culturalContext,
      logoComposited: Boolean(context.logoUrl),
    });

    if (shouldRetryQualityCheck(quality)) {
      const nextRetry = (nextJob.retry_count ?? 0) + 1;
      if (nextRetry >= MAX_JOB_RETRIES) {
        await supabase
          .from("generation_jobs")
          .update({
            status: "failed",
            retry_count: nextRetry,
            error_message: `Kalite kontrolü: ${quality.issues.join(", ") || "Görsel uygun değil"}`,
            updated_at: nowIso(),
          })
          .eq("id", nextJob.id);
      } else {
        await supabase
          .from("generation_jobs")
          .update({
            status: "queued",
            retry_count: nextRetry,
            image_url: null,
            thumbnail_url: null,
            error_message: `Kalite kontrolü yeniden denenecek: ${quality.issues.join(", ")}`,
            updated_at: nowIso(),
          })
          .eq("id", nextJob.id);
      }

      const status = await getProjectStatusAdmin(projectId);
      return { processed: true, qualityRejected: true, status, shouldContinue: true };
    }

    const caption = context.purchasedAddons.includes("caption")
      ? await generateCaption(context, dayId)
      : null;

    await supabase
      .from("generation_jobs")
      .update({
        status: "ready",
        image_url: finalImageUrl,
        thumbnail_url: finalImageUrl,
        caption_text: caption?.caption ?? null,
        hashtags: caption?.hashtags ?? [],
        provider: image.provider,
        error_message: null,
        updated_at: nowIso(),
      })
      .eq("id", nextJob.id);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Üretim hatası";
    const nextRetry = (nextJob.retry_count ?? 0) + 1;

    if (nextRetry >= MAX_JOB_RETRIES) {
      await supabase
        .from("generation_jobs")
        .update({
          status: "failed",
          retry_count: nextRetry,
          error_message: message,
          updated_at: nowIso(),
        })
        .eq("id", nextJob.id);
    } else {
      await supabase
        .from("generation_jobs")
        .update({
          status: "queued",
          retry_count: nextRetry,
          error_message: `${message} — yeniden denenecek`,
          updated_at: nowIso(),
        })
        .eq("id", nextJob.id);
    }
  }

  const status = await getProjectStatusAdmin(projectId);
  const hasMore =
    (status?.queued ?? 0) > 0 ||
    (status?.jobs?.some(
      (j) => j.status === "failed" && (j.retry_count ?? 0) < MAX_JOB_RETRIES,
    ) ??
      false);

  return { processed: true, status, shouldContinue: hasMore };
}

export async function resumeAllStuckProjects() {
  const supabase = adminClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("id")
    .eq("status", "generating");

  let resumed = 0;
  for (const project of projects ?? []) {
    const { data: row } = await supabase
      .from("projects")
      .select("generation_stopped_at")
      .eq("id", project.id)
      .maybeSingle();

    if (row?.generation_stopped_at) continue;

    await recoverStuckJobs(project.id);
    const status = await getProjectStatusAdmin(project.id);
    if ((status?.queued ?? 0) > 0 || (status?.inProgress ?? 0) > 0) {
      scheduleQueueProcessing(project.id);
      resumed += 1;
    }
  }

  return { resumed, total: projects?.length ?? 0 };
}
