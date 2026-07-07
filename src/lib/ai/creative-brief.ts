import { buildOccasionCreativeGuide } from "@/lib/ai/occasion-creative-guide";
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
};

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

function pickPrimaryVisualIdea(day: SpecialDay, seed: string): string {
  const guide = buildOccasionCreativeGuide(day);
  const fromGuide = pickBySeed(guide.visualMetaphors, `${seed}:visual`, "");
  if (fromGuide) return shorten(fromGuide, 120);
  return shorten(firstSentence(day.visualDirection, 120) || day.name, 120);
}

function pickSectorVisualCue(rule: SectorRule | undefined, seed: string): string {
  if (!rule) return "a local small-business touch";
  const element = pickBySeed(rule.suitableElements, `${seed}:sector-el`, "");
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
): string {
  const format =
    postFormat === "landscape-1350x1080"
      ? "1350x1080 landscape feed layout"
      : "1080x1080 square layout";
  const styleLayout = styleRule
    ? shorten(firstSentence(styleRule.compositionHints, 80), 80)
    : "centered premium layout";
  const overlayNote = backgroundOnly
    ? "Leave the top 22% and top-right corner clean for headline and logo overlay."
    : "Strong readable Turkish headline with safe margins.";
  return `${format}; ${styleLayout}; ${overlayNote}`;
}

function buildLogoUsage(input: CreativeBriefInput): string {
  if (!input.logoUrl) {
    return "No logo provided — do not invent any logo or brand mark.";
  }
  return (
    input.logoAnalysis?.usageNote ??
    "Use the provided logo small in the top-right, keep it readable, undistorted and proportional."
  );
}

function buildMustHave(day: SpecialDay, category: SpecialDayCategory): string[] {
  const guide = buildOccasionCreativeGuide(day);
  const items = [
    category === "national" ? "clear national-day identity" : "",
    guide.culturalElements[0] ? shorten(guide.culturalElements[0], 60) : "",
    "premium small-business social media finish",
  ].filter(Boolean);
  return items.slice(0, 3);
}

function buildAvoidList(
  day: SpecialDay,
  sectorRule?: SectorRule,
  styleRule?: StyleRule,
  userNote?: string,
): string[] {
  const guide = buildOccasionCreativeGuide(day);
  const raw = [
    ...guide.avoid,
    day.avoidRules,
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
  return prioritized.slice(0, 5).map((item) => shorten(item, 48));
}

function brandDescriptionSnippet(description?: string): string | undefined {
  if (!description?.trim()) return undefined;
  return shorten(firstSentence(description, 100), 100);
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
  const logoUsage = buildLogoUsage(input);
  const logoPlacement = input.logoAnalysis?.bestPlacement ?? "top-right";

  return {
    occasion: {
      name: input.specialDay.name,
      category: input.specialDay.category,
      emotionalGoal: pickEmotionalGoal(input.specialDay, seed),
      culturalSignal: pickCulturalSignal(input.specialDay, seed),
      primaryVisualIdea: pickPrimaryVisualIdea(input.specialDay, seed),
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
      layout: pickLayout(input.styleRule, input.postFormat ?? "square", backgroundOnly),
      background: pickBackground(input.specialDay, input.styleRule, seed),
      typography: backgroundOnly
        ? "No typography in image — headline added separately."
        : `Render ONE large, bold, perfectly spelled Turkish headline: "${headline}". High contrast, mobile-readable, top-center.`,
      logoPlacement: input.logoUrl
        ? `Logo reserved for ${logoPlacement} overlay after generation.`
        : "No logo placement needed.",
    },
    text: {
      headline,
      strictTextRule: backgroundOnly
        ? "Absolutely no text, letters, numbers, logos, URLs or UI in the image."
        : `ONLY the headline "${headline}" may appear on the image.`,
    },
    constraints: {
      mustHave: buildMustHave(input.specialDay, input.specialDay.category),
      avoid: buildAvoidList(
        input.specialDay,
        input.sectorRule,
        input.styleRule,
        input.userNote,
      ),
    },
  };
}

function formatSize(postFormat?: PostFormat) {
  return postFormat === "landscape-1350x1080"
    ? "1350x1080 Instagram landscape feed post"
    : "1080x1080 Instagram square post";
}

/** Tek parça, kısa art director brief — max ~1300 karakter. */
export function writeImagePrompt(brief: CreativeBrief, postFormat?: PostFormat): string {
  const sizeLabel = formatSize(postFormat);
  const backgroundOnly = brief.text.strictTextRule.includes("no text");

  const brandDesc = brief.brand.description
    ? ` ${brief.brand.description}.`
    : "";

  const colorRule = getColorPriority(brief.occasion.category as SpecialDayCategory);

  const parts = [
    backgroundOnly
      ? `Create a ${sizeLabel} BACKGROUND ONLY for ${brief.occasion.name} for the Turkish brand "${brief.brand.name}", a ${brief.brand.sector} business.${brandDesc}`
      : `Create a ${sizeLabel} for ${brief.occasion.name} for the Turkish brand "${brief.brand.name}", a ${brief.brand.sector} business.${brandDesc}`,
    "",
    `Occasion mood: ${brief.occasion.emotionalGoal} The viewer should instantly understand the special day through ${brief.occasion.primaryVisualIdea}.`,
    "",
    `Design style: ${brief.style.name} — ${brief.style.designLanguage}. Brand adaptation: use brand color ${brief.brand.color}. ${colorRule} Match the brand's sector with a ${brief.brand.sectorCue}.`,
    "",
    `Logo: ${brief.brand.logoUsage}`,
    "",
    `Composition: ${brief.composition.layout} ${brief.composition.background}. ${brief.composition.typography}`,
    "",
    backgroundOnly
      ? `${brief.text.strictTextRule} Leave clean space for headline and logo overlay.`
      : `On-image text: render ONLY "${brief.text.headline}" in perfect Turkish (ğ ü ş ı ö ç). Large, bold, readable headline — no other words, slogans, URLs or footer.`,
    "",
    backgroundOnly
      ? `Avoid: ${brief.constraints.avoid.join(", ")}.`
      : `Avoid: extra text beyond the headline, ${brief.constraints.avoid.join(", ")}.`,
    "",
    "No extra text, no fake slogans, no misspelled Turkish, no clutter.",
  ];

  let prompt = parts.join("\n").replace(/\n{3,}/g, "\n\n").trim();

  if (prompt.length > 1300) {
    prompt = `${prompt.slice(0, 1297).trim()}…`;
  }

  return prompt;
}

export function briefToNegativePrompt(brief: CreativeBrief): string {
  return brief.constraints.avoid.join(", ");
}
