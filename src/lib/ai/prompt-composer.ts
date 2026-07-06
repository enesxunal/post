import { sectorModifiers, styles } from "@/lib/mock-data";
import { buildBrandCreativeBrief } from "@/lib/ai/brand-creative-director";
import { getPromptLibraryEntry } from "@/lib/ai/prompt-library";
import { buildFormatPromptLine, buildSafeZonePrompt } from "@/lib/image-formats";
import type { BrandContext, PostFormat, PromptPreview } from "@/types/domain";

export async function composeImagePrompt(
  context: BrandContext,
  dayId: string,
): Promise<PromptPreview> {
  const day = await getPromptLibraryEntry(dayId);
  const sector = sectorModifiers.find((item) => item.key === context.sector);
  const style = styles.find((item) => item.key === context.visualStyle);

  const brief = await buildBrandCreativeBrief(
    context,
    day
      ? {
          name: day.name,
          category: day.category,
          culturalContext: day.culturalContext,
          visualDirection: day.visualDirection,
          captionIdeas: day.captionIdeas,
          headlineAlternatives: day.headlineAlternatives,
          avoidRules: day.avoidRules,
        }
      : undefined,
  );

  const headline = day?.headlineAlternatives[0] ?? day?.name ?? "Özel Gün";

  const colors = (context.brandColors?.length ? context.brandColors : [context.primaryColor]).join(
    ", ",
  );

  const secondaryTextRule = brief.subtextOnImage
    ? `SECONDARY TEXT (small, below headline): "${brief.subtextOnImage}" — exact Turkish spelling.`
    : "NO secondary text, NO service description, NO customer raw sentence on the image.";

  const postFormat: PostFormat = context.postFormat ?? "square";

  const prompt = [
    "You are an award-winning Turkish social media art director. Create ONE premium Instagram post.",
    buildFormatPromptLine(postFormat),
    buildSafeZonePrompt("post", postFormat),
    "",
    "=== CREATIVE DIRECTOR BRIEF (brand + special day harmonized) ===",
    brief.dayHarmony,
    `Scene: ${brief.sceneComposition}`,
    `Sector × occasion blend: ${brief.sectorBlend}`,
    "",
    "=== BRAND ===",
    `Name: ${context.brandName}`,
    `Positioning: ${brief.positioning}`,
    `Tone: ${brief.toneOfVoice}`,
    `Sector language: ${sector?.promptModifier ?? context.customSector ?? "professional KOBİ"}`,
    `Design style: ${style?.promptModifier ?? "clean modern premium"}`,
    `Colors (priority): ${colors}`,
    sector?.visualCues ? `Sector visual cues: ${sector.visualCues}` : null,
    "",
    "=== SPECIAL DAY ===",
    `Occasion: ${day?.name ?? "Turkish special day"}`,
    `Category: ${day?.category ?? "celebration"}`,
    `Cultural context: ${day?.culturalContext ?? "Respectful Turkish tone"}`,
    `Day visual direction: ${day?.visualDirection ?? "celebratory, modern"}`,
    day?.captionIdeas?.length
      ? `Caption inspiration (NOT on image): ${day.captionIdeas.slice(0, 2).join(" | ")}`
      : null,
    "",
    "=== ON-IMAGE TEXT (STRICT) ===",
    `PRIMARY HEADLINE — large, perfect Turkish: "${headline}"`,
    secondaryTextRule,
    brief.onImageTextRules,
    `Brand mark: "${context.brandName}" logo + name, bottom corner, small, never distorted.`,
    "",
    "=== QUALITY BAR ===",
    brief.visualQuality,
    brief.visualDirection,
    "Layered depth, premium typography, rich composition — never clip art, stick figures, or amateur doodles.",
    "Never paste the customer's raw description as visible text on the image.",
    "",
    "=== FORBIDDEN ===",
    [...new Set([...brief.avoidOnImage, day?.avoidRules, sector?.avoidRules].filter(Boolean))].join(
      "; ",
    ),
  ]
    .filter(Boolean)
    .join("\n");

  const negativePrompt = [
    day?.avoidRules,
    sector?.avoidRules,
    ...brief.avoidOnImage,
    "clip art",
    "stick figures",
    "childish doodle",
    "simple line drawing",
    "misspelled Turkish",
    "customer description as text",
    "service list on image",
    "distorted logo",
    "amateur design",
    "flat empty background",
    "watermark",
  ]
    .filter(Boolean)
    .join(", ");

  return { headline, prompt, negativePrompt, brandBrief: brief };
}
