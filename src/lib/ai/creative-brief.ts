import { normalizePostFormat } from "@/lib/image-formats";
import { buildOccasionCreativeGuide } from "@/lib/ai/occasion-creative-guide";
import type { ArtDirection } from "@/lib/ai/art-direction";
import { artDirectionToPromptSentence } from "@/lib/ai/art-direction";
import type { LogoAnalysis } from "@/lib/ai/logo-analysis";
import { sectorAvoidList } from "@/lib/sectors/build-sector-prompt";
import { getSectorOptionsFromSeed } from "@/lib/sectors/seed-data";
import { styleAvoidList } from "@/lib/styles/build-style-prompt";
import { resolveStyleName } from "@/lib/styles/seed-data";
import type {
  BrandContext,
  PostFormat,
  SectorRule,
  SpecialDay,
  SpecialDayCategory,
  StyleRule,
} from "@/types/domain";

export type CreativeBrief = {
  occasion: {
    name: string;
    category: string;
    emotionalGoal: string;
    culturalSignal: string;
    primaryVisualIdea: string;
  };
  brand: {
    name: string;
    sector: string;
    sectorCue: string;
    description?: string;
    color: string;
    logoUsage: string;
  };
  style: {
    name: string;
    designLanguage: string;
  };
  composition: {
    layout: string;
    background: string;
    typography: string;
    logoPlacement: string;
  };
  text: {
    headline: string;
    strictTextRule: string;
  };
  constraints: {
    mustHave: string[];
    avoid: string[];
  };
  userDirection?: string;
  artDirection?: ArtDirection;
};

export type CreativeBriefInput = {
  brandName: string;
  brandDescription?: string;
  sector: BrandContext["sector"];
  customSector?: string;
  selectedStyle: BrandContext["visualStyle"];
  brandColor: string;
  brandColors?: string[];
  specialDay: SpecialDay;
  selectedHeadline?: string;
  logoUrl?: string;
  logoAnalysis?: LogoAnalysis | null;
  userNote?: string;
  postFormat?: PostFormat;
  sectorRule?: SectorRule;
  styleRule?: StyleRule;
  backgroundOnly?: boolean;
  artDirection?: ArtDirection;
};

const COMMERCIAL_DESIGN_AVOID = [
  "stock photo family",
  "family hugging",
  "multi-generation family portrait",
  "living room family scene",
  "black footer bar",
  "canva template",
  "generic greeting card",
  "photo with text strip at bottom",
  "amatör şablon",
  "clip art",
  "flat boring gradient only",
];

function hashSeed(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function pickBySeed<T>(items: T[], seed: string, fallback: T): T {
  if (!items.length) return fallback;
  return items[hashSeed(seed) % items.length]!;
}

function firstSentence(text: string, maxLen = 140): string {
  const trimmed = text.trim();
  if (!trimmed) return "";
  const sentence = trimmed.split(/(?<=[.!?])\s+/)[0] ?? trimmed;
  if (sentence.length <= maxLen) return sentence.replace(/\s+/g, " ");
  return `${sentence.slice(0, maxLen - 1).trim()}…`;
}

function shorten(text: string, maxLen: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLen) return clean;
  return `${clean.slice(0, maxLen - 1).trim()}…`;
}

export function pickHeadlineForBrand(day: SpecialDay, context: BrandContext): string {
  const pool = day.headlineAlternatives;
  if (!pool.length) return day.name;
  const idx = hashSeed(`${context.brandName}:${day.id}:${context.sector}`) % pool.length;
  return pool[idx]!;
}

function resolveSectorLabel(input: CreativeBriefInput): string {
  const sector = getSectorOptionsFromSeed().find((item) => item.key === input.sector);
  return sector?.label ?? input.customSector ?? input.sector;
}

export function getColorPriority(category: SpecialDayCategory): string {
  switch (category) {
    case "national":
      return "Occasion colors stay dominant; brand color is only a subtle accent.";
    case "religious":
    case "holiday":
      return "Respectful occasion mood stays dominant; brand color is a gentle supporting accent.";
    case "popular":
      return "Balance brand color with the occasion atmosphere.";
    case "sectoral":
      return "Sector identity and brand color shape the scene together with the occasion.";
    case "campaign":
      return "Brand color can be more prominent while still honoring the occasion.";
    default:
      return "Blend brand color naturally without overpowering the special day.";
  }
}

function pickEmotionalGoal(day: SpecialDay, seed: string): string {
  const guide = buildOccasionCreativeGuide(day);
  const fromGuide = pickBySeed(guide.moodKeywords, seed, "");
  if (fromGuide) {
    return shorten(`${guide.soul.split(".")[0]}. Tone: ${fromGuide}`, 160);
  }
  return firstSentence(day.culturalContext, 160) || "Warm, respectful and shareable.";
}

function pickCulturalSignal(day: SpecialDay, seed: string): string {
  const guide = buildOccasionCreativeGuide(day);
  return shorten(
    pickBySeed(guide.culturalElements, `${seed}:cultural`, day.culturalContext) ||
      firstSentence(day.culturalContext, 120),
    120,
  );
}

function pickPrimaryVisualIdea(
  day: SpecialDay,
  seed: string,
  sectorRule?: SectorRule,
): string {
  const guide = buildOccasionCreativeGuide(day);
  const fromGuide = pickBySeed(guide.visualMetaphors, `${seed}:visual`, "");
  const occasionPart =
    fromGuide || shorten(firstSentence(day.visualDirection, 120) || day.name, 120);

  const isCelebration =
    day.category === "holiday" || day.category === "religious" || day.category === "friday";

  if (sectorRule && isCelebration) {
    const element = pickBySeed(sectorRule.suitableElements, `${seed}:blend`, "");
    return shorten(
      `Premium brand graphic for ${sectorRule.name}: ${occasionPart}. ` +
        `Blend ${day.name} motifs with business atmosphere` +
        `${element ? ` (${element})` : ""}. ` +
        `Commercial Instagram post to customers — NOT a family stock photo.`,
      200,
    );
  }

  return shorten(occasionPart, 120);
}

function pickSectorVisualCue(rule: SectorRule | undefined, seed: string): string {
  if (!rule) return "a distinctive local small-business identity";
  const element = pickBySeed(rule.suitableElements, `${seed}:sector-el`, "");
  const modifier = shorten(firstSentence(rule.promptModifier, 100), 100);
  if (element && modifier) {
    return shorten(`${modifier} Accent: ${element}.`, 140);
  }
  if (element) return shorten(element, 90);
  return shorten(firstSentence(rule.visualCues, 90) || rule.name, 90);
}

function pickDesignLanguage(rule: StyleRule | undefined): string {
  if (!rule) return "clean, contemporary and social-first";
  return shorten(
    firstSentence(rule.visualCues, 100) ||
      firstSentence(rule.description, 100) ||
      rule.promptModifier,
    100,
  );
}

function pickBackground(day: SpecialDay, styleRule: StyleRule | undefined, seed: string): string {
  const guide = buildOccasionCreativeGuide(day);
  const idea = pickBySeed(guide.compositionIdeas, `${seed}:bg`, day.visualDirection);
  const styleHint = styleRule ? shorten(firstSentence(styleRule.compositionHints, 60), 60) : "";
  return shorten([idea, styleHint].filter(Boolean).join("; "), 140);
}

function pickLayout(
  styleRule: StyleRule | undefined,
  postFormat: PostFormat,
  backgroundOnly: boolean,
  hasLogo: boolean,
  artDirection?: ArtDirection,
  sectorRule?: SectorRule,
): string {
  const normalized = normalizePostFormat(postFormat);
  const format =
    normalized === "portrait-1080x1350"
      ? "1080x1350 PORTRAIT vertical feed layout (4:5, taller than wide — NOT landscape)"
      : "1080x1080 square layout";
  const styleLayout = artDirection
    ? `${artDirection.layout.replace(/-/g, " ")}; text at ${artDirection.textPosition}`
    : styleRule
      ? shorten(firstSentence(styleRule.compositionHints, 80), 80)
      : "editorial poster layout with layered depth";
  const sectorLayout = sectorRule
    ? shorten(firstSentence(sectorRule.compositionHints, 70), 70)
    : "";
  const cornerNote = hasLogo
    ? "Keep one clean area for automatic logo overlay. Do NOT draw brand name or watermark."
    : backgroundOnly
      ? "Leave top and lower edge clean for headline and logo overlay."
      : "Professional typographic hierarchy — no photo+footer-bar template.";
  return [format, styleLayout, sectorLayout, cornerNote].filter(Boolean).join("; ");
}

function buildTypographyLine(
  headline: string,
  backgroundOnly: boolean,
  artDirection?: ArtDirection,
): string {
  if (backgroundOnly) {
    return "No typography in image — headline added separately.";
  }

  if (artDirection) {
    return (
      `Render ONE perfectly spelled Turkish headline: "${headline}". ` +
      `Place text at ${artDirection.textPosition} with ${artDirection.typographyMood.replace(/-/g, " ")} styling. ` +
      "High contrast, mobile-readable."
    );
  }

  return `Render ONE large, bold, perfectly spelled Turkish headline: "${headline}". High contrast, mobile-readable, top-center.`;
}

function buildLogoUsage(input: CreativeBriefInput): string {
  if (!input.logoUrl) {
    return "No logo provided — do not invent any logo or brand mark.";
  }
  return "Do NOT draw any logo, brand mark, watermark or company name. Leave one clean corner — real logo is placed automatically after generation.";
}

function buildMustHave(day: SpecialDay, category: SpecialDayCategory): string[] {
  const guide = buildOccasionCreativeGuide(day);
  const items = [
    "professional graphic designer quality — layered brand social media design",
    "clear business-to-customer occasion post (not personal greeting card)",
    category === "national" ? "clear national-day identity" : "",
    guide.culturalElements[0] ? shorten(guide.culturalElements[0], 60) : "",
  ].filter(Boolean);
  return items.slice(0, 4);
}

function buildAvoidList(
  day: SpecialDay,
  sectorRule?: SectorRule,
  styleRule?: StyleRule,
  userNote?: string,
  hasLogo?: boolean,
): string[] {
  const guide = buildOccasionCreativeGuide(day);
  const raw = [
    ...(hasLogo
      ? [
          "any logo or brand mark drawn by AI",
          "duplicate logos",
          "watermark",
          "company name in corner",
        ]
      : []),
    ...guide.avoid,
    day.avoidRules,
    ...COMMERCIAL_DESIGN_AVOID,
    ...(sectorRule ? sectorAvoidList(sectorRule) : []),
    ...(styleRule ? styleAvoidList(styleRule) : []),
    ...(day.promptBuildingBlocks?.avoid ?? []),
    "extra text",
    "fake slogans",
    "misspelled Turkish",
    "distorted flag",
    "generic tech template",
    "clutter",
    "footer bar",
    "social media UI",
    userNote ? "" : "",
  ]
    .filter(Boolean)
    .flatMap((item) => item!.split(/[,;|]/))
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  const unique = [...new Set(raw)];
  const seed = `${day.id}:${sectorRule?.key ?? "x"}:${styleRule?.key ?? "x"}`;
  const prioritized = unique.sort(
    (a, b) => (hashSeed(`${seed}:${a}`) % 100) - (hashSeed(`${seed}:${b}`) % 100),
  );
  return prioritized.slice(0, 8).map((item) => shorten(item, 48));
}

function brandDescriptionSnippet(description?: string): string | undefined {
  if (!description?.trim()) return undefined;
  return shorten(firstSentence(description, 100), 100);
}

function normalizeUserDirection(userNote?: string): string | undefined {
  if (!userNote?.trim()) return undefined;
  return shorten(userNote.trim(), 220);
}

export function buildCreativeBrief(input: CreativeBriefInput): CreativeBrief {
  const seed = `${input.brandName}:${input.specialDay.id}:${input.sector}:${input.selectedStyle}:${input.brandColor}`;
  const sectorLabel = resolveSectorLabel(input);
  const headline =
    input.selectedHeadline?.trim() ||
    pickHeadlineForBrand(input.specialDay, {
      brandName: input.brandName,
      sector: input.sector,
      customSector: input.customSector,
      primaryColor: input.brandColor,
      brandColors: input.brandColors ?? [input.brandColor],
      visualStyle: input.selectedStyle,
      selectedDayIds: [],
      purchasedAddons: [],
    });

  const backgroundOnly = input.backgroundOnly ?? false;
  const hasLogo = Boolean(input.logoUrl);
  const logoUsage = buildLogoUsage(input);
  const userDirection = normalizeUserDirection(input.userNote);

  return {
    occasion: {
      name: input.specialDay.name,
      category: input.specialDay.category,
      emotionalGoal: pickEmotionalGoal(input.specialDay, seed),
      culturalSignal: pickCulturalSignal(input.specialDay, seed),
      primaryVisualIdea: pickPrimaryVisualIdea(input.specialDay, seed, input.sectorRule),
    },
    brand: {
      name: input.brandName,
      sector: sectorLabel,
      sectorCue: pickSectorVisualCue(input.sectorRule, seed),
      description: brandDescriptionSnippet(input.brandDescription),
      color: input.brandColor,
      logoUsage,
    },
    style: {
      name: resolveStyleName(input.selectedStyle),
      designLanguage: pickDesignLanguage(input.styleRule),
    },
    composition: {
      layout: pickLayout(
        input.styleRule,
        input.postFormat ?? "square",
        backgroundOnly,
        hasLogo,
        input.artDirection,
        input.sectorRule,
      ),
      background: pickBackground(input.specialDay, input.styleRule, seed),
      typography: buildTypographyLine(headline, backgroundOnly, input.artDirection),
      logoPlacement: input.logoUrl
        ? "Real logo placed automatically on the cleanest area after generation."
        : "No logo placement needed.",
    },
    text: {
      headline,
      strictTextRule: backgroundOnly
        ? "Absolutely no text, letters, numbers, logos, URLs or UI in the image."
        : hasLogo
          ? `ONLY the headline "${headline}" may appear — no logo, no brand mark, no watermark.`
          : `ONLY the headline "${headline}" may appear on the image.`,
    },
    constraints: {
      mustHave: buildMustHave(input.specialDay, input.specialDay.category),
      avoid: buildAvoidList(
        input.specialDay,
        input.sectorRule,
        input.styleRule,
        input.userNote,
        hasLogo,
      ),
    },
    ...(userDirection ? { userDirection } : {}),
    ...(input.artDirection ? { artDirection: input.artDirection } : {}),
  };
}

function formatSize(postFormat?: PostFormat) {
  const normalized = normalizePostFormat(postFormat);
  return normalized === "portrait-1080x1350"
    ? "1080x1350 Instagram PORTRAIT vertical feed post (4:5)"
    : "1080x1080 Instagram square post";
}

/** Tek parça art director brief — görsel kalitesi için yeterli detay. */
export function writeImagePrompt(brief: CreativeBrief, postFormat?: PostFormat): string {
  const sizeLabel = formatSize(postFormat);
  const backgroundOnly = brief.text.strictTextRule.includes("no text");

  const brandDesc = brief.brand.description
    ? ` ${brief.brand.description}.`
    : "";

  const colorRule = getColorPriority(brief.occasion.category as SpecialDayCategory);

  const parts = [
    `DESIGN BRIEF: Premium Turkish small-business Instagram ${sizeLabel}.`,
    `Commissioned from a senior graphic designer — polished brand social media creative, NOT a Canva drag-and-drop template.`,
    "",
    `BUSINESS POST: "${brief.brand.name}" (${brief.brand.sector}) publishes this ${brief.occasion.name} graphic TO CUSTOMERS on Instagram.`,
    `Purpose: commercial brand marketing and holiday greeting — NOT a personal family card, NOT stock lifestyle photography.${brandDesc}`,
    "",
    `VISUAL CONCEPT: ${brief.occasion.primaryVisualIdea}`,
    `Mood: ${brief.occasion.emotionalGoal} Cultural signal: ${brief.occasion.culturalSignal}.`,
    "",
    `SECTOR IDENTITY: Design must feel specific to a ${brief.brand.sector} business — ${brief.brand.sectorCue}.`,
    `The customer should think "this is MY store/brand's post" — not a generic holiday image.`,
    "",
    brief.userDirection ? `REVISION NOTE FROM USER: ${brief.userDirection}` : "",
    brief.userDirection ? "" : "",
    `STYLE: ${brief.style.name} — ${brief.style.designLanguage}.`,
    `Brand color ${brief.brand.color} integrated into the design. ${colorRule}`,
    "",
    `COMPOSITION: ${brief.composition.layout}`,
    `Background/scene: ${brief.composition.background}.`,
    brief.artDirection ? artDirectionToPromptSentence(brief.artDirection) : "",
    "",
    `LOGO: ${brief.brand.logoUsage}`,
    "",
    `MUST INCLUDE: ${brief.constraints.mustHave.join("; ")}.`,
    "",
    backgroundOnly
      ? `${brief.text.strictTextRule} Leave clean space for headline and logo overlay.`
      : `TYPOGRAPHY: ${brief.composition.typography}`,
    backgroundOnly
      ? ""
      : `On-image text: render ONLY "${brief.text.headline}" in perfect Turkish (ğ ü ş ı ö ç). Professional typographic hierarchy — no footer bar, no extra slogans.`,
    "",
    `STRICTLY AVOID: ${brief.constraints.avoid.join(", ")}.`,
    "",
    "No stock family photos, no black footer text strip, no watermark, no misspelled Turkish.",
  ];

  let prompt = parts
    .filter((line) => line !== "")
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (prompt.length > 2200) {
    prompt = `${prompt.slice(0, 2197).trim()}…`;
  }

  return prompt;
}

export function briefToNegativePrompt(brief: CreativeBrief): string {
  return brief.constraints.avoid.join(", ");
}
