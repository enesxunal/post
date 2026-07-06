import { sectorModifiers, sectors, styles } from "@/lib/mock-data";
import {
  appendOccasionGuideSections,
  occasionAvoidList,
} from "@/lib/ai/occasion-creative-guide";
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
      "=== BRAND PERSONALIZATION ===",
      "Different brands must look unique — BUT the special day identity always leads the composition.",
      ...blocks.brandPersonalizationRules.map((rule) => `- ${rule}`),
    );
  }

  if (blocks.visualRules.length) {
    sections.push("", "=== VISUAL RULES ===", ...blocks.visualRules.map((rule) => `- ${rule}`));
  }
}

/**
 * Özel gün veri seti + marka bağlamını tek final görsel promptta birleştirir.
 * Önce konunun ruhu, sonra marka aksanı — jenerik tech şablon yasak.
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
  const isTechHeavySector = context.sector === "agency";

  const sections: string[] = [
    "You are an award-winning Turkish social media art director who deeply understands Turkish culture and special days.",
    "Create ONE emotionally resonant, occasion-authentic branded post — NOT a soulless corporate tech template.",
    buildFormatPromptLine(postFormat),
    buildSafeZonePrompt("post", postFormat),
  ];

  appendOccasionGuideSections(sections, day, context);

  if (day.masterPromptTemplate?.trim()) {
    sections.push("", fillMasterTemplate(day.masterPromptTemplate, context, headline));
  }

  sections.push(
    "",
    "=== EVENT CULTURAL CONTEXT (read and embody) ===",
    day.culturalContext,
    "",
    "=== EVENT VISUAL DIRECTION ===",
    day.visualDirection,
  );

  appendBuildingBlocks(sections, blocks);

  sections.push(
    "",
    "=== ON-IMAGE HEADLINE (copy EXACTLY, perfect Turkish) ===",
    `"${headline}"`,
    `Alternative headlines (reference only): ${day.headlineAlternatives.join(" | ")}`,
    "",
    "=== BRAND ACCENT (secondary — do not dominate) ===",
    `Brand: ${context.brandName}`,
    `Sector: ${resolveSectorLabel(context)}`,
    isTechHeavySector
      ? "Tech/agency brand: use ONLY subtle color accents. NO chips, grids, holograms, or UI panels as main scene."
      : sector?.promptModifier
        ? `Sector language (accent only): ${sector.promptModifier}`
        : "",
    sector?.visualCues && !isTechHeavySector
      ? `Subtle sector cue (background detail only): ${sector.visualCues}`
      : "",
    `Brand colors as accents: ${colors}`,
    `Style preference (adapt to occasion): ${resolveStyleLabel(context)} — ${style?.promptModifier ?? ""}`,
    "",
    "=== LOGO ===",
    "Small, clean logo in corner. Never distort.",
    context.logoUrl ? `Logo: ${context.logoUrl}` : "",
    "",
    "=== CAPTION INSPIRATION (NOT on image) ===",
    day.captionIdeas.slice(0, 3).join(" | "),
    "",
    "=== QUALITY BAR ===",
    "Premium Turkish KOBİ social media — warm, culturally aware, shareable.",
    "Rich composition with emotional depth. Never clip art or amateur doodles.",
  );

  const avoidItems = [
    ...occasionAvoidList(day),
    ...(blocks?.avoid ?? []),
    day.avoidRules,
    sector?.avoidRules,
    isTechHeavySector ? "tech grid floor, microchip, holographic UI, cyberpunk" : "",
    "misspelled Turkish",
    "extra subtext sentences",
    "customer description on image",
    "distorted logo",
    "watermark",
  ]
    .filter(Boolean)
    .flatMap((item) => item!.split(",").map((part) => part.trim()))
    .filter(Boolean);

  return {
    prompt: sections.filter(Boolean).join("\n"),
    headline,
    negativePrompt: [...new Set(avoidItems)].join(", "),
  };
}
