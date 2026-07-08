import { generateCaption } from "@/lib/ai/caption-provider";
import { composeImagePrompt } from "@/lib/ai/prompt-composer";
import { regenerateImage } from "@/lib/ai/image-provider";
import {
  checkGeneratedImageQuality,
  isQualityCheckEnabled,
  shouldRetryQualityCheck,
} from "@/lib/ai/quality-checker";
import { buildFormatPromptLine, buildSafeZonePrompt, STORY_FORMAT } from "@/lib/image-formats";
import { projectToBrandContext } from "@/lib/generation/project-service";
import { persistGeneratedImage } from "@/lib/storage/generated-images";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function getClient() {
  return createSupabaseAdminClient() ?? (await createSupabaseServerClient());
}

export async function approvePostJob(jobId: string, userId: string) {
  const supabase = await getClient();

  const { data: job } = await supabase
    .from("generation_jobs")
    .select("id, status, project_id, user_id, type, image_url, approved_at")
    .eq("id", jobId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!job) {
    throw new Error("Post bulunamadı");
  }

  if (job.status !== "ready") {
    throw new Error("Sadece hazır postlar onaylanabilir");
  }

  if (job.approved_at) {
    return { ok: true, alreadyApproved: true };
  }

  const approvedAt = new Date().toISOString();

  const { error } = await supabase
    .from("generation_jobs")
    .update({ approved_at: approvedAt })
    .eq("id", jobId);

  if (error) {
    throw new Error(error.message);
  }

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", job.project_id)
    .single();

  if (!project) {
    throw new Error("Proje bulunamadı");
  }

  const context = projectToBrandContext(project);
  const dayId = job.type as string;
  let captionText: string | null = null;
  let hashtags: string[] = [];

  if (context.purchasedAddons.includes("caption")) {
    const caption = await generateCaption(context, dayId);
    captionText = caption?.caption ?? null;
    hashtags = caption?.hashtags ?? [];

    await supabase
      .from("generation_jobs")
      .update({
        caption_text: captionText,
        hashtags,
      })
      .eq("id", jobId);
  }

  let storyImageUrl: string | null = null;

  if (context.purchasedAddons.includes("story") && job.image_url) {
    const story = await generateStoryForJob(jobId, userId);
    storyImageUrl = story.storyImageUrl;
  }

  return {
    ok: true,
    captionText,
    hashtags,
    storyImageUrl,
  };
}

export async function generateStoryForJob(jobId: string, userId: string) {
  const supabase = await getClient();

  const { data: job } = await supabase
    .from("generation_jobs")
    .select("*")
    .eq("id", jobId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!job) {
    throw new Error("Post bulunamadı");
  }

  if (job.status !== "ready" || !job.image_url) {
    throw new Error("Önce post görseli hazır olmalı");
  }

  if (!job.approved_at) {
    throw new Error("Story üretmek için önce postu onaylayın");
  }

  if (job.story_status === "ready" && job.story_image_url) {
    return { storyImageUrl: job.story_image_url as string };
  }

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", job.project_id)
    .single();

  if (!project) {
    throw new Error("Proje bulunamadı");
  }

  const context = projectToBrandContext(project);
  if (!context.purchasedAddons.includes("story")) {
    throw new Error("Story paketi satın alınmamış");
  }

  await supabase
    .from("generation_jobs")
    .update({ story_status: "generating" })
    .eq("id", jobId);

  const preview = await composeImagePrompt(context, job.type as string);

  const storyPrompt = [
    "TASK: Convert the reference feed post into a premium Instagram Story (1080x1920, 9:16).",
    buildFormatPromptLine(context.postFormat ?? "square"),
    buildSafeZonePrompt("story"),
    STORY_FORMAT.size,
    `Preserve the same headline message: "${preview.headline}"`,
    `Brand: ${context.brandName}`,
    "Keep the same colors, mood, typography style and brand logo from the reference.",
    "Extend background naturally for vertical format — do NOT crop out the main message.",
    "Do not add new slogans or service text. Recompose vertically with agency quality.",
    preview.brief?.artDirection.layout
      ? `Keep composition DNA: ${preview.brief.artDirection.layout}, sector cues: ${preview.brief.sector.elements.join(", ")}.`
      : "",
    preview.brief?.backgroundOnly
      ? "Absolutely no text, letters, numbers, logos, URLs or UI in the image."
      : `ONLY the headline "${preview.headline}" may appear on the image.`,
  ]
    .filter(Boolean)
    .join("\n");

  const image = await regenerateImage(job.image_url as string, storyPrompt, {
    aspectRatio: STORY_FORMAT.aspectRatio,
  });

  if (isQualityCheckEnabled()) {
    const quality = await checkGeneratedImageQuality({
      imageUrl: image.imageUrl,
      expectedHeadline: preview.headline,
      brandName: context.brandName,
      brandBrief: preview.brief,
    });

    if (shouldRetryQualityCheck(quality)) {
      await supabase
        .from("generation_jobs")
        .update({ story_status: "failed" })
        .eq("id", jobId);
      throw new Error(`Story kalite kontrolü başarısız: ${quality.issues.join(", ")}`);
    }
  }

  const storedStoryUrl = await persistGeneratedImage(
    image.imageUrl,
    job.project_id as string,
    jobId,
    "story",
  );

  await supabase
    .from("generation_jobs")
    .update({
      story_image_url: storedStoryUrl,
      story_status: "ready",
    })
    .eq("id", jobId);

  return { storyImageUrl: storedStoryUrl };
}