import { sectorModifiers, sectors, styles } from "@/lib/mock-data";
import { buildFormatPromptLine, buildSafeZonePrompt } from "@/lib/image-formats";
import type { BrandContext, PostFormat, PromptBuildingBlocks, SpecialDay } from "@/types/domain";

export type ComposePromptResult = {
  prompt: string;
  headline: string;
  negativePrompt: string;
};

function hashSeed(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** Aynı gün, farklı marka → farklı başlık alternatifi. */
export function pickHeadlineForBrand(day: SpecialDay, context: BrandContext): string {
  const pool = day.headlineAlternatives;
  if (!pool.length) return day.name;
  const idx = hashSeed(`${context.brandName}:${day.id}:${context.sector}`) % pool.length;
  return pool[idx]!;
}

function resolveSectorLabel(context: BrandContext): string {
  const sector = sectors.find((item) => item.key === context.sector);
  return sector?.label ?? context.customSector ?? context.sector;
}

function resolveStyleLabel(context: BrandContext): string {
  const style = styles.find((item) => item.key === context.visualStyle);
  return style?.name ?? context.visualStyle;
}

function brandColors(context: BrandContext): string {
  return (context.brandColors?.length ? context.brandColors : [context.primaryColor]).join(", ");
}

function fillMasterTemplate(
  template: string,
  context: BrandContext,
  headline: string,
): string {
  return template
    .replaceAll("{brand_name}", context.brandName)
    .replaceAll("{sector}", resolveSectorLabel(context))
    .replaceAll("{brand_description}", context.brandDescription ?? "yerel KOBİ işletmesi")
    .replaceAll("{primary_color}", brandColors(context))
    .replaceAll("{visual_style}", resolveStyleLabel(context))
    .replaceAll("{logo_url}", context.logoUrl ?? "müşteri logosu sağlanacak")
    .replaceAll("{selected_headline}", headline);
}

function appendBuildingBlocks(sections: string[], blocks?: PromptBuildingBlocks) {
  if (!blocks) return;

  if (blocks.eventBrief) {
    sections.push("", "=== EVENT BRIEF ===", blocks.eventBrief);
  }

  if (blocks.brandPersonalizationRules.length) {
    sections.push(
      "",
      "=== BRAND PERSONALIZATION (each brand must look unique) ===",
      ...blocks.brandPersonalizationRules.map((rule) => `- ${rule}`),
    );
  }

  if (blocks.visualRules.length) {
    sections.push("", "=== VISUAL RULES ===", ...blocks.visualRules.map((rule) => `- ${rule}`));
  }
}

/**
 * Özel gün veri seti + marka bağlamını tek final görsel promptta birleştirir.
 * Aynı özel günü seçen farklı markalar farklı kompozisyon ve başlık alır.
 */
export function composePrompt(
  day: SpecialDay,
  context: BrandContext,
  postFormat: PostFormat = context.postFormat ?? "square",
): ComposePromptResult {
  const headline = pickHeadlineForBrand(day, context);
  const sector = sectorModifiers.find((item) => item.key === context.sector);
  const style = styles.find((item) => item.key === context.visualStyle);
  const blocks = day.promptBuildingBlocks;
  const colors = brandColors(context);

  const sections: string[] = [
    "You are an award-winning Turkish social media art director. Create ONE premium branded post.",
    buildFormatPromptLine(postFormat),
    buildSafeZonePrompt("post", postFormat),
  ];

  if (day.masterPromptTemplate?.trim()) {
    sections.push("", fillMasterTemplate(day.masterPromptTemplate, context, headline));
  } else {
    sections.push(
      "",
      `Create a custom Turkish social media post for: ${day.name}`,
      `Brand: ${context.brandName}`,
      `Sector: ${resolveSectorLabel(context)}`,
      `Brand description: ${context.brandDescription ?? "yerel KOBİ işletmesi"}`,
      `Primary brand color: ${colors}`,
      `Visual style: ${resolveStyleLabel(context)}`,
      `Logo: ${context.logoUrl ?? "müşteri logosu sağlanacak"}`,
    );
  }

  sections.push(
    "",
    "=== EVENT CULTURAL CONTEXT ===",
    day.culturalContext,
    "",
    "=== EVENT VISUAL DIRECTION ===",
    day.visualDirection,
  );

  appendBuildingBlocks(sections, blocks);

  sections.push(
    "",
    "=== ON-IMAGE HEADLINE (exact Turkish spelling) ===",
    `"${headline}"`,
    `Headline pool (tone reference; pick similar if needed): ${day.headlineAlternatives.join(" | ")}`,
    "",
    "=== BRAND SECTOR & DESCRIPTION ===",
    `Sector: ${resolveSectorLabel(context)}`,
    sector?.promptModifier ? `Sector language: ${sector.promptModifier}` : "",
    sector?.visualCues ? `Sector visual cues: ${sector.visualCues}` : "",
    `Brand description (brief only — do NOT paste as visible text): ${context.brandDescription ?? "yerel işletme"}`,
    "",
    "=== BRAND COLOR & STYLE ===",
    `Primary colors (balanced, not overwhelming): ${colors}`,
    `Visual style: ${resolveStyleLabel(context)}`,
    style?.promptModifier ? `Style direction: ${style.promptModifier}` : "",
    "",
    "=== LOGO USAGE RULES ===",
    "Place the uploaded brand logo cleanly and proportionally in the composition.",
    "Preserve the logo exactly — do NOT redraw, translate, bend, blur, crop or distort it.",
    context.logoUrl ? `Logo reference: ${context.logoUrl}` : "",
    "",
    "=== CAPTION INSPIRATION (NOT on image) ===",
    day.captionIdeas.slice(0, 3).join(" | ") || "Warm professional Turkish caption tone.",
    "",
    "=== QUALITY BAR ===",
    "Premium agency-made Turkish KOBİ social media design.",
    "Rich layered composition — never clip art, stick figures or amateur doodles.",
    "Each brand must feel custom-made; avoid generic holiday templates.",
  );

  const avoidItems = [
    ...(blocks?.avoid ?? []),
    day.avoidRules,
    sector?.avoidRules,
    "misspelled Turkish",
    "customer description as visible text",
    "generic identical template for all brands",
    "distorted logo",
    "watermark",
  ]
    .filter(Boolean)
    .flatMap((item) => item!.split(",").map((part) => part.trim()))
    .filter(Boolean);

  const negativePrompt = [...new Set(avoidItems)].join(", ");

  return {
    prompt: sections.filter(Boolean).join("\n"),
    headline,
    negativePrompt,
  };
}
