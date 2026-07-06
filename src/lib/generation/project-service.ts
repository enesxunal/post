import type { OnboardingDraft } from "@/lib/onboarding/draft";
import { expandSelectedDaysForJobs } from "@/lib/selected-days";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureUserProfile } from "@/lib/supabase/profiles";
import type { AddonKey, BrandContext, PostFormat, SectorKey, VisualStyle } from "@/types/domain";

const META_SEPARATOR = "\n<!--POST_META:";

export function encodeProjectMeta(draft: OnboardingDraft) {
  const meta = {
    brandColors: draft.brandColors,
    purchasedAddons: draft.purchasedAddons,
    customSector: draft.customSector,
    selectedDays: draft.selectedDays,
    postFormat: draft.postFormat ?? "square",
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
      postFormat: "square" as PostFormat,
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
      postFormat?: PostFormat;
    };

    return {
      userDescription: userDescription.trim(),
      brandColors: parsed.brandColors ?? [],
      purchasedAddons: parsed.purchasedAddons ?? [],
      customSector: parsed.customSector,
      selectedDays: parsed.selectedDays ?? [],
      postFormat: (parsed.postFormat ?? "square") as PostFormat,
    };
  } catch {
    return {
      userDescription: brandDescription,
      brandColors: [],
      purchasedAddons: [],
      customSector: undefined,
      selectedDays: [],
      postFormat: "square" as PostFormat,
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
    postFormat: meta.postFormat,
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
    .select("id, user_id, status, brand_name, generation_stopped_at")
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

  const pending = list.filter((job) =>
    ["queued", "generating_image", "generating_caption", "composing_prompt"].includes(
      job.status,
    ),
  ).length;

  const stopped = Boolean(project.generation_stopped_at);
  const done = stopped || (pending === 0 && total > 0);

  return {
    projectId,
    brandName: project.brand_name,
    projectStatus: project.status,
    stopped,
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

export async function processNextProjectJob(projectId: string, userId: string) {
  const { processOneQueuedJob } = await import("@/lib/generation/queue-processor");
  const { scheduleQueueProcessing } = await import("@/lib/generation/schedule-queue");

  const status = await getProjectStatus(projectId, userId);
  if (!status) {
    throw new Error("Proje bulunamadı");
  }

  const result = await processOneQueuedJob(projectId);

  if (result.shouldContinue) {
    scheduleQueueProcessing(projectId);
  }

  return {
    processed: result.processed,
    status: result.status ?? (await getProjectStatus(projectId, userId)),
  };
}
