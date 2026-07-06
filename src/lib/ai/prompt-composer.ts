import { composePrompt } from "@/lib/ai/compose-prompt";
import { buildBrandCreativeBrief } from "@/lib/ai/brand-creative-director";
import { getPromptLibraryEntry } from "@/lib/ai/prompt-library";
import { isLeanGenerationMode } from "@/lib/generation/generation-mode";
import type { BrandContext, PromptPreview } from "@/types/domain";

export async function composeImagePrompt(
  context: BrandContext,
  dayId: string,
): Promise<PromptPreview> {
  const day = await getPromptLibraryEntry(dayId);
  const lean = isLeanGenerationMode();

  const dayContext = day
    ? {
        name: day.name,
        category: day.category,
        culturalContext: day.culturalContext,
        visualDirection: day.visualDirection,
        captionIdeas: day.captionIdeas,
        headlineAlternatives: day.headlineAlternatives,
        avoidRules: day.avoidRules,
      }
    : undefined;

  const brief = await buildBrandCreativeBrief(context, dayContext, {
    useGemini: !lean,
  });

  const composed = day
    ? composePrompt(day, context)
    : {
        headline: "Özel Gün",
        prompt: `Premium Turkish social post for ${context.brandName}.`,
        negativePrompt: "misspelled Turkish, distorted logo, watermark",
      };

  if (lean) {
    return {
      headline: composed.headline,
      prompt: composed.prompt,
      negativePrompt: composed.negativePrompt,
      brandBrief: brief,
    };
  }

  const prompt = [
    composed.prompt,
    "",
    "=== CREATIVE DIRECTOR LAYER (brand × special day harmony) ===",
    brief.dayHarmony,
    `Scene composition: ${brief.sceneComposition}`,
    `Sector × occasion blend: ${brief.sectorBlend}`,
    `Brand positioning: ${brief.positioning}`,
    `Tone: ${brief.toneOfVoice}`,
    brief.subtextOnImage
      ? `Optional secondary text (small): "${brief.subtextOnImage}"`
      : "No secondary text on image.",
    brief.onImageTextRules,
    brief.visualQuality,
    brief.visualDirection,
    "",
    "=== EXTRA FORBIDDEN ===",
    [...new Set([...brief.avoidOnImage])].join("; "),
  ].join("\n");

  return {
    headline: composed.headline,
    prompt,
    negativePrompt: [composed.negativePrompt, ...brief.avoidOnImage].filter(Boolean).join(", "),
    brandBrief: brief,
  };
}
