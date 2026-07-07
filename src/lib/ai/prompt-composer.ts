import {
  briefToNegativePrompt,
  buildCreativeBrief,
  writeImagePrompt,
} from "@/lib/ai/creative-brief";
import { isIdeogramConfigured } from "@/lib/ai/ideogram-config";
import { getPromptLibraryEntry } from "@/lib/ai/prompt-library";
import { isOpenAIConfigured, isOpenAITextFreeMode } from "@/lib/ai/openai-config";
import { getStyleRule } from "@/lib/styles/repository";
import { getSectorRule } from "@/lib/sectors/repository";
import type { BrandContext, PromptPreview } from "@/types/domain";
import type { ArtDirection } from "@/lib/ai/art-direction";

export type { CreativeBrief } from "@/lib/ai/creative-brief";
export { pickHeadlineForBrand } from "@/lib/ai/creative-brief";

export type ComposeImagePromptOptions = {
  artDirection?: ArtDirection;
  selectedHeadline?: string;
  userNote?: string;
};

function usesTextFreeBackground(): boolean {
  if (process.env.HEADLINE_OVERLAY === "true") return true;
  if (process.env.HEADLINE_OVERLAY === "false") return false;
  const provider = process.env.IMAGE_PROVIDER?.trim();
  if (provider === "openai") return isOpenAITextFreeMode();
  if (provider === "ideogram") return process.env.IDEOGRAM_TEXT_FREE === "true";
  if (!provider) {
    if (isOpenAIConfigured()) return isOpenAITextFreeMode();
    if (isIdeogramConfigured()) return process.env.IDEOGRAM_TEXT_FREE === "true";
  }
  return false;
}

export async function composeImagePrompt(
  context: BrandContext,
  dayId: string,
  options?: ComposeImagePromptOptions,
): Promise<PromptPreview> {
  const day = await getPromptLibraryEntry(dayId);
  const sectorRule = await getSectorRule(context.sector);
  const styleRule = await getStyleRule(context.visualStyle);
  const backgroundOnly = usesTextFreeBackground();
  const dayCustom = context.dayCustomizations?.[dayId];
  const customHeadline = options?.selectedHeadline ?? dayCustom?.headline;
  const userNote = [
    options?.userNote,
    context.styleCustomNotes,
    dayCustom?.visualDirection ? `Visual direction: ${dayCustom.visualDirection}` : "",
    dayCustom?.captionNote ? `Caption tone: ${dayCustom.captionNote}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (!day) {
    const fallbackBrief = buildCreativeBrief({
      brandName: context.brandName,
      brandDescription: context.brandDescription,
      sector: context.sector,
      customSector: context.customSector,
      selectedStyle: context.visualStyle,
      brandColor: context.primaryColor,
      brandColors: context.brandColors,
      specialDay: {
        id: dayId,
        name: "Özel Gün",
        slug: dayId,
        category: "popular",
        dateType: "fixed",
        dateValue: "",
        importance: "medium",
        culturalContext: "",
        popularUsages: [],
        headlineAlternatives: ["Özel Gün"],
        captionIdeas: [],
        visualDirection: "",
        avoidRules: "",
        promptTemplate: "",
        isDefaultSelected: false,
      },
      logoUrl: context.logoUrl,
      logoAnalysis: context.logoAnalysis,
      postFormat: context.postFormat,
      sectorRule,
      styleRule,
      backgroundOnly,
      artDirection: options?.artDirection,
      selectedHeadline: customHeadline,
      userNote,
    });

    return {
      headline: fallbackBrief.text.headline,
      prompt: writeImagePrompt(fallbackBrief, context.postFormat),
      negativePrompt: briefToNegativePrompt(fallbackBrief),
      brief: fallbackBrief,
    };
  }

  const brief = buildCreativeBrief({
    brandName: context.brandName,
    brandDescription: context.brandDescription,
    sector: context.sector,
    customSector: context.customSector,
    selectedStyle: context.visualStyle,
    brandColor: context.primaryColor,
    brandColors: context.brandColors,
    specialDay: day,
    logoUrl: context.logoUrl,
    logoAnalysis: context.logoAnalysis,
    postFormat: context.postFormat,
    sectorRule,
    styleRule,
    backgroundOnly,
    artDirection: options?.artDirection,
    selectedHeadline: customHeadline,
    userNote,
  });

  return {
    headline: brief.text.headline,
    prompt: writeImagePrompt(brief, context.postFormat),
    negativePrompt: briefToNegativePrompt(brief),
    brief,
  };
}
