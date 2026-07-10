import {
  buildFormatPromptLine,
  buildSafeZonePrompt,
  normalizePostFormat,
} from "@/lib/image-formats";
import { buildOccasionCreativeGuide } from "@/lib/ai/occasion-creative-guide";
import type { ArtDirection } from "@/lib/ai/art-direction";
import {
  artDirectionToPromptSentence,
  buildBrandIntegration,
  buildSectorLayer,
  defaultBrandIntegrationForCategory,
} from "@/lib/ai/art-direction";
import type { SectorKey } from "@/types/domain";
import {
  getSectorNativeProfile,
  mergeSectorAvoidList,
  mergeSectorElementPool,
} from "@/lib/ai/sector-native-profiles";
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
    description?: string;
    color: string;
    logoUsage: string;
  };
  sector: {
    name: string;
    nativeScene: string;
    elements: string[];
    avoid: string[];
    blendHint: string;
  };
  style: {
    name: string;
    designLanguage: string;
  };
  artDirection: {
    layout: string;
    textPosition: string;
    visualFocus: string;
    typographyMood: string;
    density: string;
    motifStrategy: string;
    colorBalance: string;
    sectorLayer: {
      enabled: boolean;
      intensity: "subtle" | "balanced" | "hero";
      elements: string[];
      integrationStyle: string;
    };
    brandIntegration: {
      logoPlacement: string;
      logoTreatment: string;
      colorUsage: "accent" | "balanced" | "dominant";
    };
  };
  text: {
    headline: string;
  };
  constraints: {
    avoid: string[];
  };
  backgroundOnly?: boolean;
  userDirection?: string;
  rawArtDirection?: ArtDirection;
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
  "occasion wallpaper with headline sticker",
  "corner logo pasted on flat background",
  "poust app UI",
  "saas product dashboard",
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
      return "occasion colors dominant, brand color accent";
    case "religious":
    case "holiday":
    case "friday":
      return "occasion mood dominant, brand color subtle accent";
    case "popular":
      return "balanced brand + occasion colors";
    case "sectoral":
      return "sector + brand dominant with occasion support";
    case "campaign":
      return "brand color dominant while honoring the occasion";
    default:
      return "blend brand color naturally without overpowering the special day";
  }
}

function colorBalancePhrase(balance: string, category: SpecialDayCategory): string {
  if (balance === "occasion-dominant") return getColorPriority(category);
  if (balance === "brand-dominant") return "brand color dominant, occasion mood supportive";
  if (balance === "brand-accent") return "occasion mood primary, brand color as gentle accent";
  return "balanced brand and occasion colors";
}

function pickEmotionalGoal(day: SpecialDay, seed: string): string {
  const guide = buildOccasionCreativeGuide(day);
  const fromGuide = pickBySeed(guide.moodKeywords, seed, "");
  if (fromGuide) {
    return shorten(`${guide.soul.split(".")[0]}. Tone: ${fromGuide}`, 140);
  }
  return firstSentence(day.culturalContext, 140) || "Warm, respectful and shareable.";
}

function pickCulturalSignal(day: SpecialDay, seed: string): string {
  const guide = buildOccasionCreativeGuide(day);
  return shorten(
    pickBySeed(guide.culturalElements, `${seed}:cultural`, day.culturalContext) ||
      firstSentence(day.culturalContext, 110),
    110,
  );
}

function pickPrimaryVisualIdea(day: SpecialDay, seed: string): string {
  const guide = buildOccasionCreativeGuide(day);
  const fromGuide = pickBySeed(guide.visualMetaphors, `${seed}:visual`, "");
  return shorten(fromGuide || firstSentence(day.visualDirection, 110) || day.name, 110);
}

function pickNativeScene(
  rule: SectorRule | undefined,
  sectorKey: SectorKey,
  seed: string,
): string {
  const profile = getSectorNativeProfile(sectorKey);
  if (rule?.visualCues?.trim()) {
    const element = pickBySeed(rule.suitableElements, `${seed}:scene`, "");
    const cue = firstSentence(rule.visualCues, 90);
    return shorten(
      [profile.nativeScene, cue, element ? `featuring ${element}` : ""].filter(Boolean).join(" — "),
      150,
    );
  }
  return profile.nativeScene;
}

function pickDesignLanguage(rule: StyleRule | undefined, styleName: string): string {
  if (!rule) {
    const fallbacks: Record<string, string> = {
      Modern: "clean contemporary social-first layout, clear hierarchy, confident spacing",
      Minimal: "generous negative space, refined sparse composition, calm restrained detail",
      Kurumsal: "trustworthy structured grid, orderly corporate polish, formal balance",
      Samimi: "warm approachable local-business charm, soft hospitality, human scale",
      Premium: "agency-grade elegant finish, layered depth, high-perception editorial quality",
      Renkli: "vivid energetic dynamic contrast, scroll-stopping rhythm, bold accents",
    };
    return fallbacks[styleName] ?? "clean contemporary social-first design";
  }
  const parts = [
    firstSentence(rule.compositionHints, 70),
    firstSentence(rule.typographyHints, 60),
    firstSentence(rule.visualCues, 70),
  ].filter(Boolean);
  return shorten(parts.join("; ") || rule.promptModifier, 120);
}

function buildLogoUsage(input: CreativeBriefInput, placement: string, treatment: string): string {
  if (!input.logoUrl) {
    return "No logo provided — do not invent any logo or brand mark.";
  }
  return (
    `Do NOT draw logo/brand mark. Reserve a clean intentional area at ${placement.replace(/-/g, " ")} ` +
    `suited for a ${treatment.replace(/-/g, " ")} logo treatment — real logo is overlaid after generation.`
  );
}

const SECULAR_NATIONAL_DAY_IDS = new Set([
  "29-ekim",
  "30-agustos",
  "23-nisan",
  "19-mayis",
  "1-mayis",
  "15-temmuz",
  "10-kasim",
  "1-kasim",
]);

const RELIGIOUS_ARCHITECTURE_AVOID = [
  "mosque",
  "minaret",
  "cami",
  "mihrab",
  "Islamic prayer hall",
  "Ottoman skyline",
  "Blue Mosque",
  "Hagia Sophia silhouette",
  "religious architecture in window view",
  "dome and minaret skyline",
];

function buildAvoidList(
  day: SpecialDay,
  sectorKey: SectorKey,
  sectorRule: SectorRule | undefined,
  styleRule: StyleRule | undefined,
  hasLogo: boolean,
): string[] {
  const guide = buildOccasionCreativeGuide(day);
  const secularNational =
    day.category === "national" || SECULAR_NATIONAL_DAY_IDS.has(day.id);
  const seedAvoid = [
    ...(hasLogo
      ? ["AI-drawn logo", "watermark", "company name corner text", "duplicate logos"]
      : []),
    ...COMMERCIAL_DESIGN_AVOID,
    ...guide.avoid,
    ...(secularNational ? RELIGIOUS_ARCHITECTURE_AVOID : []),
    day.avoidRules,
    ...(sectorRule ? sectorAvoidList(sectorRule) : []),
    ...(styleRule ? styleAvoidList(styleRule) : []),
    "extra slogans",
    "misspelled Turkish",
    "clutter",
    "social media UI chrome",
  ]
    .filter(Boolean)
    .flatMap((item) => String(item).split(/[,;|]/))
    .map((item) => item.trim())
    .filter(Boolean);

  return mergeSectorAvoidList(sectorKey, seedAvoid)
    .slice(0, 14)
    .map((item) => shorten(item, 42));
}

function ensureArtDirection(input: CreativeBriefInput, seed: string): ArtDirection {
  if (input.artDirection?.sectorLayer && input.artDirection?.brandIntegration) {
    return input.artDirection;
  }

  const category = input.specialDay.category;
  const base = input.artDirection;
  const sectorLayer =
    base?.sectorLayer ??
    buildSectorLayer(
      {
        brandName: input.brandName,
        sector: input.sector,
        visualStyle: input.selectedStyle,
        primaryColor: input.brandColor,
        sectorElements: mergeSectorElementPool(
          input.sector,
          input.sectorRule?.suitableElements,
        ),
        sectorNativeScene:
          input.sectorRule?.visualCues?.trim() ||
          getSectorNativeProfile(input.sector).nativeScene,
      },
      category,
      0,
      [],
      input.specialDay.id,
    );

  const brandIntegration =
    base?.brandIntegration ??
    (base
      ? buildBrandIntegration(input.selectedStyle, base.colorBalance, 0, [], seed)
      : defaultBrandIntegrationForCategory(category));

  if (base) {
    return { ...base, sectorLayer, brandIntegration };
  }

  return {
    layout: "editorial-poster",
    textPosition: "center",
    visualFocus: "atmospheric-scene",
    typographyMood: "premium-editorial",
    density: "medium",
    motifStrategy: pickCulturalSignal(input.specialDay, seed),
    colorBalance:
      category === "campaign"
        ? "brand-dominant"
        : category === "national" || category === "religious" || category === "friday"
          ? "occasion-dominant"
          : "balanced",
    sectorLayer,
    brandIntegration,
  };
}

function brandDescriptionSnippet(description?: string): string | undefined {
  if (!description?.trim()) return undefined;
  return shorten(firstSentence(description, 90), 90);
}

function normalizeUserDirection(userNote?: string): string | undefined {
  if (!userNote?.trim()) return undefined;
  return shorten(userNote.trim(), 200);
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
  const userDirection = normalizeUserDirection(input.userNote);
  const art = ensureArtDirection(input, seed);
  const styleName = resolveStyleName(input.selectedStyle);

  const sectorProfile = getSectorNativeProfile(input.sector);
  const sectorElements =
    art.sectorLayer.elements.length > 0
      ? art.sectorLayer.elements
      : mergeSectorElementPool(input.sector, input.sectorRule?.suitableElements).slice(0, 3);

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
      description: brandDescriptionSnippet(input.brandDescription),
      color: input.brandColor,
      logoUsage: buildLogoUsage(
        input,
        art.brandIntegration.logoPlacement,
        art.brandIntegration.logoTreatment,
      ),
    },
    sector: {
      name: sectorLabel,
      nativeScene: pickNativeScene(input.sectorRule, input.sector, seed),
      elements: sectorElements,
      avoid: mergeSectorAvoidList(
        input.sector,
        input.sectorRule ? sectorAvoidList(input.sectorRule) : [],
      ).slice(0, 6),
      blendHint: sectorProfile.blendHint,
    },
    style: {
      name: styleName,
      designLanguage: pickDesignLanguage(input.styleRule, styleName),
    },
    artDirection: {
      layout: art.layout,
      textPosition: art.textPosition,
      visualFocus: art.visualFocus,
      typographyMood: art.typographyMood,
      density: art.density,
      motifStrategy: art.motifStrategy,
      colorBalance: art.colorBalance,
      sectorLayer: {
        enabled: art.sectorLayer.enabled,
        intensity: art.sectorLayer.intensity,
        elements: art.sectorLayer.elements,
        integrationStyle: art.sectorLayer.integrationStyle,
      },
      brandIntegration: {
        logoPlacement: art.brandIntegration.logoPlacement,
        logoTreatment: art.brandIntegration.logoTreatment,
        colorUsage: art.brandIntegration.colorUsage,
      },
    },
    text: { headline },
    constraints: {
      avoid: buildAvoidList(
        input.specialDay,
        input.sector,
        input.sectorRule,
        input.styleRule,
        hasLogo,
      ),
    },
    backgroundOnly,
    ...(userDirection ? { userDirection } : {}),
    rawArtDirection: art,
  };
}

function formatSize(postFormat?: PostFormat) {
  const normalized = normalizePostFormat(postFormat);
  return normalized === "portrait-1080x1350"
    ? "1080x1350 portrait (4:5)"
    : "1080x1080 square";
}

/**
 * Kısa, bilinçli final prompt (≈900–1400 karakter).
 * Formula: occasion + brand + sector-native + style + art direction + headline
 * — NOT decoration + headline + logo.
 */
export function writeImagePrompt(brief: CreativeBrief, postFormat?: PostFormat): string {
  const sizeLabel = formatSize(postFormat);
  const colorRule = colorBalancePhrase(
    brief.artDirection.colorBalance,
    brief.occasion.category as SpecialDayCategory,
  );

  const sectorElements =
    brief.artDirection.sectorLayer.elements.length > 0
      ? brief.artDirection.sectorLayer.elements.slice(0, 4).join(", ")
      : brief.sector.elements.slice(0, 4).join(", ");

  const integration = brief.artDirection.sectorLayer.integrationStyle.replace(/-/g, " ");
  const placement = brief.artDirection.brandIntegration.logoPlacement.replace(/-/g, " ");

  const parts: string[] = [
    buildFormatPromptLine(postFormat),
    buildSafeZonePrompt("post", postFormat),
    `Create a ${sizeLabel} premium branded Instagram post for ${brief.brand.name}, a ${brief.sector.name} business, for ${brief.occasion.name}.`,
    `Occasion-first rule: ${brief.occasion.name} identity must be obvious — use ONLY symbols and atmosphere that belong to THIS specific day. Never borrow religious imagery (mosque, minaret) for secular national days like Republic Day.`,
    `This must NOT look like a generic holiday greeting card. It should feel art-directed and custom-made for this brand and sector — a sector-native branded scene, not occasion wallpaper with a headline sticker.`,
    `Occasion layer: ${brief.occasion.emotionalGoal}, shown through ${brief.occasion.culturalSignal} / ${brief.occasion.primaryVisualIdea}.`,
    `Sector-native layer: integrate ${sectorElements || brief.sector.nativeScene} as natural parts of the scene, with ${integration}. ${brief.sector.blendHint} These elements should make the design feel specific to a ${brief.sector.name} business without overpowering the special day.`,
    `Style layer: ${brief.style.name} — ${brief.style.designLanguage}. Style shapes layout density and typography character; it is not just a color filter.`,
    `Brand layer: use brand color ${brief.brand.color} with ${colorRule}. ${brief.brand.logoUsage}`,
    `Composition: ${brief.artDirection.layout.replace(/-/g, " ")}, text ${brief.artDirection.textPosition}, ${brief.artDirection.typographyMood.replace(/-/g, " ")}, ${brief.artDirection.density} density, premium agency-quality finish, mobile-readable Turkish headline.`,
  ];

  if (brief.userDirection) {
    parts.push(`Revision note from user: ${brief.userDirection}`);
  }

  if (brief.backgroundOnly) {
    parts.push(
      `No text in the image — leave clean space for headline overlay and logo at ${placement}.`,
    );
  } else {
    parts.push(`Text on image: ONLY "${brief.text.headline}".`);
  }

  parts.push(
    `Avoid: ${brief.constraints.avoid.slice(0, 8).join(", ")}.`,
  );

  let prompt = parts.join("\n\n").replace(/\n{3,}/g, "\n\n").trim();

  if (prompt.length < 900) {
    const enrichment = [
      `Scene identity: ${brief.sector.nativeScene}.`,
      brief.brand.description ? `Brand note: ${brief.brand.description}.` : "",
      `Motif: ${brief.artDirection.motifStrategy}. Focus: ${brief.artDirection.visualFocus.replace(/-/g, " ")}.`,
      `Quality bar: this special day should feel staged for ${brief.brand.name} in the ${brief.sector.name} sector — never a stock celebration template.`,
      brief.rawArtDirection
        ? artDirectionToPromptSentence(brief.rawArtDirection, brief.sector.name)
        : "",
    ]
      .filter(Boolean)
      .join(" ");
    prompt = `${prompt}\n\n${enrichment}`.trim();
  }

  if (prompt.length > 1400) {
    prompt = `${prompt.slice(0, 1397).trim()}…`;
  }

  return prompt;
}

export function briefToNegativePrompt(brief: CreativeBrief): string {
  return brief.constraints.avoid.join(", ");
}
