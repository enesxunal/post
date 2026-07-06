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
  const brief = await buildBrandCreativeBrief(context, day?.name);

  const headline =
    day?.headlineAlternatives[0] ?? `${day?.name ?? "Özel Gün"}`;

  const colors = (context.brandColors?.length ? context.brandColors : [context.primaryColor]).join(
    ", ",
  );

  const secondaryTextRule = brief.subtextOnImage
    ? `İkincil kısa metin (küçük puntoda, başlığın altında): "${brief.subtextOnImage}" — yazımı aynen koru.`
    : "İkincil metin, slogan, hizmet açıklaması veya tagline EKLEME. Sadece başlık + marka adı yeterli.";

  const postFormat: PostFormat = context.postFormat ?? "square";

  const prompt = [
    "TASK: Design a premium Turkish Instagram post for a real small business brand.",
    buildFormatPromptLine(postFormat),
    buildSafeZonePrompt("post", postFormat),
    "",
    "=== SPECIAL DAY ===",
    `Occasion: ${day?.name ?? "Turkish special day"}`,
    day?.promptTemplate,
    `Cultural context: ${day?.culturalContext ?? "Respectful Turkish cultural tone."}`,
    `Visual mood for this day: ${day?.visualDirection ?? "celebratory, clean, modern"}.`,
    "",
    "=== BRAND (interpret professionally — customer input may be rough) ===",
    `Brand name: ${context.brandName}`,
    `Professional positioning: ${brief.positioning}`,
    `Tone of voice: ${brief.toneOfVoice}`,
    `Sector visual language: ${sector?.promptModifier ?? context.customSector ?? "professional local business"}`,
    `Design style: ${style?.promptModifier ?? "clean modern premium"}`,
    `Brand colors (priority order): ${colors}`,
    "",
    "=== TYPOGRAPHY ON IMAGE (STRICT) ===",
    `PRIMARY HEADLINE — large, centered or top-third, perfect Turkish spelling: "${headline}"`,
    secondaryTextRule,
    brief.onImageTextRules,
    `Brand mark: "${context.brandName}" logo and name in bottom-left or bottom-right corner, small, clean, never distorted.`,
    "",
    "=== VISUAL QUALITY (MANDATORY) ===",
    brief.visualQuality,
    brief.visualDirection,
    sector?.visualCues ? `Sector cues: ${sector.visualCues}.` : null,
    "Use depth, subtle gradients, professional layout grid, premium stock-photo or high-end illustration quality.",
    "NOT clip art, NOT stick figures, NOT childish doodles, NOT flat icon-only compositions.",
    "NOT a plain background with one word — create a rich, agency-quality composition.",
    "",
    "=== FORBIDDEN ===",
    [...brief.avoidOnImage, day?.avoidRules, sector?.avoidRules].filter(Boolean).join("; "),
    "Misspelled Turkish; random English text; watermark; cluttered text blocks; service bullet lists.",
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
    "flat icon only",
    "misspelled Turkish text",
    "garbled letters",
    "unreadable typography",
    "distorted logo",
    "distorted flag",
    "extra slogan text",
    "service description paragraph",
    "low quality",
    "amateur design",
    "watermark",
  ]
    .filter(Boolean)
    .join(", ");

  return { headline, prompt, negativePrompt, brandBrief: brief };
}
