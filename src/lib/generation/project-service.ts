import type { OnboardingDraft } from "@/lib/onboarding/draft";
import { expandSelectedDaysForJobs } from "@/lib/selected-days";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureUserProfile } from "@/lib/supabase/profiles";
import type { AddonKey, BrandContext, SectorKey, VisualStyle } from "@/types/domain";

const META_SEPARATOR = "\n<!--POST_META:";

export function encodeProjectMeta(draft: OnboardingDraft) {
  const meta = {
    brandColors: draft.brandColors,
    purchasedAddons: draft.purchasedAddons,
    customSector: draft.customSector,
    selectedDays: draft.selectedDays,
  };
  const userText = draft.brandDescription?.trim() ?? "";
  return `${userText}${META_SEPARATOR}${JSON.stringify(meta)}-->`;
}

export function decodeProjectMeta(brandDescription: string | null) {
  if (!brandDescription?.includes(META_SEPARATOR)) {
    return {
      userDescription: brandDescription ?? "",
      brandColors: [] as string[],
      purchasedAddons: [] as AddonKey[],
      customSector: undefined as string | undefined,
      selectedDays: [] as OnboardingDraft["selectedDays"],
    };
  }

  const [userDescription, metaPart] = brandDescription.split(META_SEPARATOR);
  const json = metaPart?.replace(/-->$/, "") ?? "{}";

  try {
    const parsed = JSON.parse(json) as {
      brandColors?: string[];
      purchasedAddons?: AddonKey[];
      customSector?: string;
      selectedDays?: OnboardingDraft["selectedDays"];
    };

    return {
      userDescription: userDescription.trim(),
      brandColors: parsed.brandColors ?? [],
      purchasedAddons: parsed.purchasedAddons ?? [],
      customSector: parsed.customSector,
      selectedDays: parsed.selectedDays ?? [],
    };
  } catch {
    return {
      userDescription: brandDescription,
      brandColors: [],
      purchasedAddons: [],
      customSector: undefined,
      selectedDays: [],
    };
  }
}

export function projectToBrandContext(project: {
  brand_name: string;
  brand_description: string | null;
  sector: string;
  primary_color: string;
  visual_style: string;
  logo_url: string | null;
}): BrandContext {
  const meta = decodeProjectMeta(project.brand_description);

  return {
    brandName: project.brand_name,
    sector: project.sector as SectorKey,
    customSector: meta.customSector,
    brandDescription: meta.userDescription,
    primaryColor: project.primary_color,
    brandColors: meta.brandColors.length
      ? meta.brandColors
      : [project.primary_color],
    visualStyle: project.visual_style as VisualStyle,
    logoUrl: project.logo_url ?? undefined,
    selectedDayIds: meta.selectedDays.map((day) => day.dayId),
    purchasedAddons: meta.purchasedAddons,
  };
}

async function getWritableClient() {
  const admin = createSupabaseAdminClient();
  if (admin) return admin;
  return createSupabaseServerClient();
}

export async function createProjectWithJobs(
  user: { id: string; email: string; fullName?: string },
  draft: OnboardingDraft,
  orderId?: string,
) {
  await ensureUserProfile(user);
  const userId = user.id;
  const supabase = await getWritableClient();
  const primaryColor = draft.brandColors[0] ?? "#16A34A";
  const expandedDays = expandSelectedDaysForJobs(draft.selectedDays);

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      user_id: userId,
      brand_name: draft.brandName,
      brand_description: encodeProjectMeta(draft),
      sector: draft.sector,
      custom_sector: draft.customSector ?? null,
      primary_color: primaryColor,
      visual_style: draft.visualStyle,
      logo_url: draft.logoUrl ?? null,
      package_type: orderId ? `order:${orderId}` : "base",
      status: "generating",
    })
    .select("id")
    .single();

  if (projectError || !project) {
    throw new Error(projectError?.message ?? "Proje oluşturulamadı");
  }

  const jobsPayload = expandedDays.map((day) => ({
    project_id: project.id,
    user_id: userId,
    type: day.dayId,
    status: "queued" as const,
    provider: "gemini",
  }));

  const { error: jobsError } = await supabase.from("generation_jobs").insert(jobsPayload);

  if (jobsError) {
    throw new Error(jobsError.message);
  }

  return {
    projectId: project.id as string,
    totalJobs: expandedDays.length,
  };
}

export async function getProjectStatus(projectId: string, userId: string) {
  const supabase = await getWritableClient();

  const { data: project } = await supabase
    .from("projects")
    .select("id, user_id, status, brand_name")
    .eq("id", projectId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!project) {
    return null;
  }

  const { data: jobs } = await supabase
    .from("generation_jobs")
    .select("id, status, type, image_url, caption_text, error_message")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  const list = jobs ?? [];
  const ready = list.filter((job) => job.status === "ready").length;
  const failed = list.filter((job) => job.status === "failed").length;
  const total = list.length;
  const queued = list.filter(
    (job) => job.status === "queued" || job.status === "composing_prompt",
  ).length;
  const inProgress = list.filter(
    (job) =>
      job.status === "generating_image" || job.status === "generating_caption",
  ).length;

  const done = ready + failed >= total && total > 0;

  return {
    projectId,
    brandName: project.brand_name,
    projectStatus: project.status,
    total,
    ready,
    failed,
    queued,
    inProgress,
    done,
    progress: total > 0 ? Math.round(((ready + failed) / total) * 100) : 0,
    jobs: list,
  };
}

export async function processNextProjectJob(projectId: string, userId: string) {
  const supabase = await getWritableClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!project) {
    throw new Error("Proje bulunamadı");
  }

  const { data: nextJob } = await supabase
    .from("generation_jobs")
    .select("*")
    .eq("project_id", projectId)
    .eq("user_id", userId)
    .in("status", ["queued", "failed"])
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!nextJob) {
    const status = await getProjectStatus(projectId, userId);
    if (status?.done) {
      await supabase
        .from("projects")
        .update({ status: status.failed > 0 && status.ready === 0 ? "failed" : "ready" })
        .eq("id", projectId);
    }
    return { processed: false, status };
  }

  await supabase
    .from("generation_jobs")
    .update({ status: "generating_image", error_message: null })
    .eq("id", nextJob.id);

  const context = projectToBrandContext(project);
  const dayId = nextJob.type;

  try {
    const { runGenerationPipeline } = await import("@/lib/ai/generation-pipeline");
    const result = await runGenerationPipeline(context, dayId);

    await supabase
      .from("generation_jobs")
      .update({
        status: "ready",
        prompt: result.prompt,
        image_url: result.imageUrl,
        thumbnail_url: result.thumbnailUrl,
        caption_text: result.caption?.caption ?? null,
        hashtags: result.caption?.hashtags ?? [],
        provider: "gemini",
      })
      .eq("id", nextJob.id);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Üretim hatası";
    await supabase
      .from("generation_jobs")
      .update({ status: "failed", error_message: message })
      .eq("id", nextJob.id);
  }

  const status = await getProjectStatus(projectId, userId);
  return { processed: true, status };
}
