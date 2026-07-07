import { composeImagePrompt } from "@/lib/ai/prompt-composer";
import {
  artDirectionToMetadata,
  assignArtDirectionForDay,
  buildBrandProfile,
  regenerateArtDirection,
  type ArtDirection,
} from "@/lib/ai/art-direction";
import { getPromptLibraryEntry } from "@/lib/ai/prompt-library";
import { generateImage, isPlaceholderImageUrl } from "@/lib/ai/image-provider";
import { applyHeadlineOverlay, useHeadlineOverlayForProvider } from "@/lib/ai/headline-pipeline";
import { applyLogoOverlay } from "@/lib/ai/logo-pipeline";
import {
  checkGeneratedImageQuality,
  isQualityCheckEnabled,
  shouldRetryQualityCheck,
} from "@/lib/ai/quality-checker";
import { JOB_STUCK_MINUTES, MAX_JOB_RETRIES } from "@/lib/config";
import { consumeRevisionCredit } from "@/lib/jobs";
import { projectToBrandContext } from "@/lib/generation/project-service";
import { resolveAspectRatio } from "@/lib/image-formats";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { scheduleQueueProcessing } from "@/lib/generation/schedule-queue";
import { persistGeneratedImage } from "@/lib/storage/generated-images";
import { getSpecialDayById } from "@/lib/special-days-data";
import { recordRevisionFeedback } from "@/lib/trend-brain/repository";
import { resolvePromptVersionRefs } from "@/lib/trend-brain/prompt-versions";
import type { SpecialDayCategory } from "@/types/domain";

type JobRow = {
  id: string;
  project_id: string;
  user_id: string;
  type: string;
  status: string;
  retry_count: number;
  art_direction: unknown;
};

function parseArtDirection(raw: unknown): ArtDirection | null {
  if (!raw || typeof raw !== "object") return null;
  const candidate = raw as ArtDirection;
  if (!candidate.layout || !candidate.textPosition) return null;
  return candidate;
}

async function loadProjectArtMemory(projectId: string, excludeJobId?: string) {
  const supabase = adminClient();
  const { data } = await supabase
    .from("generation_jobs")
    .select("id, art_direction, design_metadata, created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  return (data ?? [])
    .filter((row) => row.id !== excludeJobId)
    .map((row) => parseArtDirection(row.art_direction) ?? parseArtDirection(row.design_metadata))
    .filter((value): value is ArtDirection => Boolean(value));
}

async function ensureJobArtDirection(
  job: JobRow,
  project: {
    brand_name: string;
    sector: string;
    visual_style: string;
    primary_color: string;
  },
) {
  const existing = parseArtDirection(job.art_direction);
  if (existing) return existing;

  const memory = await loadProjectArtMemory(job.project_id, job.id);
  const day = getSpecialDayById(job.type);
  const category = (day?.category ?? "popular") as SpecialDayCategory;
  const brandProfile = buildBrandProfile({
    brandName: project.brand_name,
    sector: project.sector,
    visualStyle: project.visual_style as import("@/types/domain").VisualStyle,
    primaryColor: project.primary_color,
  });

  const artDirection = assignArtDirectionForDay(
    { dayId: job.type, category },
    memory.length,
    memory,
    brandProfile,
  );

  const supabase = adminClient();
  await supabase
    .from("generation_jobs")
    .update({ art_direction: artDirection, updated_at: nowIso() })
    .eq("id", job.id);

  return artDirection;
}

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
  const cutoff = new Date(Date.now() - JOB_STUCK_MINUTES * 60 * 1000).toISOString();

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
    .select("id, project_id, user_id, type, status, retry_count, art_direction")
    .eq("project_id", projectId)
    .eq("status", "queued")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (queued) return queued as JobRow;

  const { data: retryable } = await supabase
    .from("generation_jobs")
    .select("id, project_id, user_id, type, status, retry_count, art_direction")
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
  const draft = list.filter((j) => j.status === "draft").length;
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

  let finalStatus: "paid" | "ready" | "failed" = "paid";
  if (ready > 0) finalStatus = "ready";
  if (ready === 0 && failed > 0 && draft === 0) finalStatus = "failed";
  if (draft === total) finalStatus = "paid";

  await supabase
    .from("projects")
    .update({ status: finalStatus, updated_at: nowIso() })
    .eq("id", projectId);

  return { ready, total, pending: 0, done: draft === 0 && ready + failed >= total && total > 0, failed };
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
    .select("id, project_id, user_id, status, image_url, approved_at, type, art_direction, prompt_version_refs")
    .eq("id", jobId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!job) {
    throw new Error("Görsel bulunamadı");
  }

  if (job.approved_at) {
    throw new Error("Onaylanan post yeniden üretilemez");
  }

  const isUnproduced = job.status === "failed" || !job.image_url;
  const isRevision = job.status === "ready" && Boolean(job.image_url);

  if (!isUnproduced && !isRevision) {
    throw new Error("Bu görsel şu an yeniden üretilemez");
  }

  const { data: project } = await supabase
    .from("projects")
    .select("id, remaining_credits, bonus_credits_granted, brand_name, sector, visual_style, primary_color")
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
  const day = getSpecialDayById(job.type);
  const category = (day?.category ?? "popular") as SpecialDayCategory;
  const projectMemory = await loadProjectArtMemory(job.project_id, jobId);
  const brandProfile = buildBrandProfile({
    brandName: project.brand_name,
    sector: project.sector,
    visualStyle: project.visual_style as import("@/types/domain").VisualStyle,
    primaryColor: project.primary_color,
  });
  const nextArtDirection = regenerateArtDirection(
    parseArtDirection(job.art_direction),
    projectMemory,
    { dayId: job.type, category },
    brandProfile,
  );

  try {
    await recordRevisionFeedback({
      jobId: job.id,
      userId: job.user_id,
      projectId: job.project_id,
      dayId: job.type,
      sector: project.sector,
      style: project.visual_style,
      previousArtDirection: job.art_direction ?? null,
      previousPromptVersionRefs: job.prompt_version_refs ?? null,
    });
  } catch {
    // revision_feedback tablosu yoksa üretimi engelleme
  }

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
      art_direction: nextArtDirection,
      design_metadata: null,
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

/** Kullanıcı tek bir boş slot için üretim başlatır. */
export async function requestJobGeneration(jobId: string, userId: string) {
  const supabase = adminClient();

  const { data: job } = await supabase
    .from("generation_jobs")
    .select("id, project_id, user_id, status, image_url, approved_at")
    .eq("id", jobId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!job) {
    throw new Error("Post bulunamadı");
  }

  if (job.approved_at) {
    throw new Error("Onaylanan post tekrar üretilemez");
  }

  if (!["draft", "failed"].includes(job.status)) {
    throw new Error("Bu post zaten üretildi veya üretimde");
  }

  const { data: busy } = await supabase
    .from("generation_jobs")
    .select("id")
    .eq("project_id", job.project_id)
    .in("status", ["queued", "composing_prompt", "generating_image", "generating_caption"])
    .limit(1)
    .maybeSingle();

  if (busy) {
    throw new Error("Başka bir post üretiliyor. Bitmesini bekleyin.");
  }

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
      updated_at: nowIso(),
    })
    .eq("id", jobId);

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
      status: "draft",
      error_message: null,
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
    const artDirection = await ensureJobArtDirection(nextJob, project);
    const promptVersionRefs = await resolvePromptVersionRefs({
      dayId,
      sector: project.sector,
      style: project.visual_style,
    });
    const preview = await composeImagePrompt(context, dayId, { artDirection });

    await supabase
      .from("generation_jobs")
      .update({
        status: "generating_image",
        prompt: preview.prompt,
        art_direction: artDirection,
        prompt_version_refs: promptVersionRefs,
        updated_at: nowIso(),
      })
      .eq("id", nextJob.id);

    const image = await generateImage(preview.prompt, [], {
      aspectRatio: resolveAspectRatio(context.postFormat ?? "square"),
      headline: preview.headline,
    });

    if (isPlaceholderImageUrl(image.imageUrl)) {
      throw new Error("Görsel üretilemedi (placeholder döndü)");
    }

    let finalImageUrl = image.imageUrl;
    const headlineOverlay = useHeadlineOverlayForProvider(image.provider);

    if (headlineOverlay) {
      finalImageUrl = await applyHeadlineOverlay(finalImageUrl, preview.headline, {
        brandColor: context.primaryColor,
      });
    }

    if (context.logoUrl) {
      finalImageUrl = await applyLogoOverlay(
        finalImageUrl,
        context.logoUrl,
        context.logoAnalysis ?? undefined,
      );
    }

    if (isQualityCheckEnabled()) {
      await supabase
        .from("generation_jobs")
        .update({ status: "generating_caption", updated_at: nowIso() })
        .eq("id", nextJob.id);

      const day = await getPromptLibraryEntry(dayId);

      const quality = await checkGeneratedImageQuality({
        imageUrl: finalImageUrl,
        expectedHeadline: preview.headline,
        brandName: context.brandName,
        brandBrief: preview.brief,
        dayName: day?.name,
        dayCategory: day?.category,
        culturalContext: day?.culturalContext,
        logoComposited: Boolean(context.logoUrl),
        headlineOverlay,
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
    }

    const storedImageUrl = await persistGeneratedImage(
      finalImageUrl,
      projectId,
      nextJob.id,
      "feed",
    );

    await supabase
      .from("generation_jobs")
      .update({
        status: "ready",
        image_url: storedImageUrl,
        thumbnail_url: storedImageUrl,
        caption_text: null,
        hashtags: [],
        provider: image.provider,
        error_message: null,
        design_metadata: artDirectionToMetadata(artDirection),
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

  return { processed: true, status, shouldContinue: false };
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
