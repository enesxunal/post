import { appendSectorRuleSections, sectorAvoidList } from "@/lib/sectors/build-sector-prompt";
import { getSectorOptionsFromSeed } from "@/lib/sectors/seed-data";
import { appendStyleRuleSections, styleAvoidList } from "@/lib/styles/build-style-prompt";
import { resolveStyleName } from "@/lib/styles/seed-data";
import {
  appendOccasionGuideSections,
  occasionAvoidList,
} from "@/lib/ai/occasion-creative-guide";
import { buildFormatPromptLine, buildSafeZonePrompt } from "@/lib/image-formats";
import type {
  BrandContext,
  PostFormat,
  PromptBuildingBlocks,
  SectorRule,
  SpecialDay,
  StyleRule,
} from "@/types/domain";

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

export function pickHeadlineForBrand(day: SpecialDay, context: BrandContext): string {
  const pool = day.headlineAlternatives;
  if (!pool.length) return day.name;
  const idx = hashSeed(`${context.brandName}:${day.id}:${context.sector}`) % pool.length;
  return pool[idx]!;
}

function resolveSectorLabel(context: BrandContext): string {
  const sector = getSectorOptionsFromSeed().find((item) => item.key === context.sector);
  return sector?.label ?? context.customSector ?? context.sector;
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
    .replaceAll("{visual_style}", resolveStyleName(context.visualStyle))
    .replaceAll("{logo_url}", context.logoUrl ?? "müşteri logosu sağlanacak")
    .replaceAll("{selected_headline}", headline);
}

function appendBuildingBlocks(sections: string[], blocks?: PromptBuildingBlocks) {
  if (!blocks) return;

  if (blocks.eventBrief) {
    sections.push("", "=== EVENT MESSAGE PURPOSE ===", blocks.eventBrief);
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
    sections.push("", "=== OCCASION VISUAL RULES ===", ...blocks.visualRules.map((rule) => `- ${rule}`));
  }
}

function appendAvoidSection(
  sections: string[],
  day: SpecialDay,
  blocks: PromptBuildingBlocks | undefined,
  sectorRule: SectorRule | undefined,
  styleRule: StyleRule | undefined,
) {
  const avoidItems = [
    ...occasionAvoidList(day),
    ...(blocks?.avoid ?? []),
    day.avoidRules,
    ...(sectorRule ? sectorAvoidList(sectorRule) : []),
    ...(styleRule ? styleAvoidList(styleRule) : []),
    sectorRule?.key === "agency"
      ? ""
      : "tech grid floor, microchip, holographic UI, cyberpunk as main scene",
    "misspelled Turkish",
    "extra subtext sentences",
    "customer description on image",
    "distorted logo",
    "watermark",
    "clip art",
    "amatör çizim",
  ]
    .filter(Boolean)
    .flatMap((item) => item!.split(",").map((part) => part.trim()))
    .filter(Boolean);

  sections.push(
    "",
    "=== THINGS TO AVOID (layer 6 — hard constraints) ===",
    ...[...new Set(avoidItems)].map((item) => `- ${item}`),
  );

  return [...new Set(avoidItems)].join(", ");
}

export function composePrompt(
  day: SpecialDay,
  context: BrandContext,
  postFormat: PostFormat = context.postFormat ?? "square",
  sectorRule?: SectorRule,
  styleRule?: StyleRule,
): ComposePromptResult {
  const headline = pickHeadlineForBrand(day, context);
  const blocks = day.promptBuildingBlocks;
  const colors = brandColors(context);

  const sections: string[] = [
    "You are an award-winning Turkish social media art director who deeply understands Turkish culture and special days.",
    "Create ONE emotionally resonant, occasion-authentic branded post — NOT a soulless corporate tech template.",
    buildFormatPromptLine(postFormat),
    buildSafeZonePrompt("post", postFormat),
    "",
    "PROMPT LAYER ORDER (do not let style or sector erase the occasion):",
    "1) Special day cultural context & message purpose",
    "2) Brand sector visual rules",
    "3) Selected style design language",
    "4) Brand colors, description & logo usage",
    "5) On-image headline from the message pool",
    "6) Things to avoid",
  ];

  // Layer 1 — özel gün
  appendOccasionGuideSections(sections, day, context);

  if (day.masterPromptTemplate?.trim()) {
    sections.push("", fillMasterTemplate(day.masterPromptTemplate, context, headline));
  }

  sections.push(
    "",
    "=== LAYER 1: EVENT CULTURAL CONTEXT & MESSAGE PURPOSE ===",
    day.culturalContext,
    "",
    "Visual direction for this occasion:",
    day.visualDirection,
  );

  appendBuildingBlocks(sections, blocks);

  // Layer 2 — sektör
  if (sectorRule) {
    appendSectorRuleSections(sections, sectorRule, context);
  }

  // Layer 3 — stil
  if (styleRule) {
    appendStyleRuleSections(sections, styleRule, context);
  }

  // Layer 4 — marka
  sections.push(
    "",
    "=== LAYER 4: BRAND IDENTITY ===",
    `Brand: ${context.brandName}`,
    `Sector label: ${resolveSectorLabel(context)}`,
    `Brand description: ${context.brandDescription ?? "yerel KOBİ işletmesi"}`,
    `Brand colors (accents, blend with occasion + style): ${colors}`,
    "",
    context.logoUrl
      ? [
          "Logo usage:",
          "The customer logo will be placed automatically in the top-right corner AFTER generation.",
          "DO NOT draw, invent, approximate, or redraw any logo or brand mark.",
          "Leave a clean empty safe zone in the top-right (~20% width, ~15% height) without text or busy graphics.",
        ].join("\n")
      : "Logo: none provided — do not invent a logo.",
  );

  // Layer 5 — başlık / caption havuzu
  sections.push(
    "",
    "=== LAYER 5: ON-IMAGE HEADLINE (copy EXACTLY, perfect Turkish) ===",
    `"${headline}"`,
    `Alternative headlines (reference only): ${day.headlineAlternatives.join(" | ")}`,
    "",
    "Caption inspiration (NOT on image):",
    day.captionIdeas.slice(0, 3).join(" | "),
    "",
    "=== QUALITY BAR ===",
    "Premium Turkish KOBİ social media — warm, culturally aware, shareable.",
    "The same special day MUST look different across styles AND sectors.",
    "Modern ≠ minimal ≠ corporate ≠ friendly ≠ premium ≠ vibrant.",
  );

  const negativePrompt = appendAvoidSection(sections, day, blocks, sectorRule, styleRule);

  return {
    prompt: sections.filter(Boolean).join("\n"),
    headline,
    negativePrompt,
  };
}
