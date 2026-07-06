import { composeImagePrompt } from "@/lib/ai/prompt-composer";
import { generateCaption } from "@/lib/ai/caption-provider";
import { generateImage } from "@/lib/ai/image-provider";
import type { BrandContext } from "@/types/domain";

export async function runGenerationPipeline(context: BrandContext, dayId: string) {
  const preview = await composeImagePrompt(context, dayId);
  const image = await generateImage(preview.prompt, context.logoUrl ? [context.logoUrl] : []);
  const caption = context.purchasedAddons.includes("caption")
    ? await generateCaption(context, dayId)
    : null;

  return {
    status: "ready" as const,
    prompt: preview.prompt,
    imageUrl: image.imageUrl,
    thumbnailUrl: image.thumbnailUrl,
    caption,
  };
}
