import {
  buildAntiRepeatNote,
  filterLayoutsForAntiRepeat,
  filterMotifsForCategory,
  pickTextPosition,
} from "@/lib/ai/art-direction/anti-repeat";
import {
  getCategoryLayouts,
  LAYOUT_VISUAL_FOCUS,
} from "@/lib/ai/art-direction/layouts";
import type {
  ArtDirection,
  BrandCreativeProfile,
  CollectionDayInput,
  CollectionPlan,
  ColorBalance,
  DensityLevel,
  LayoutVariant,
  TypographyMood,
  VisualFocus,
} from "@/lib/ai/art-direction/types";
import type { SpecialDayCategory, VisualStyle } from "@/types/domain";

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

const MOTIF_BY_CATEGORY: Record<SpecialDayCategory, string[]> = {
  recommended: [
    "celebratory light accents",
    "warm seasonal details",
    "elegant festive texture",
  ],
  national: [
    "flag wave motion",
    "red-white symbolic background",
    "city lights and unity",
    "abstract republic pride",
    "historic silhouette respect",
  ],
  holiday: [
    "warm hospitality table",
    "golden celebration light",
    "family gathering mood",
    "elegant bayram pattern",
    "gift and sharing symbols",
  ],
  religious: [
    "soft crescent light",
    "quiet mosque silhouette",
    "candle and night glow",
    "geometric spiritual texture",
    "peaceful prayer atmosphere",
  ],
  friday: [
    "morning spiritual calm",
    "green-gold gentle accent",
    "minimal light rays",
    "quiet blessing mood",
    "simple elegant pattern",
  ],
  popular: [
    "thematic hero object",
    "emotional lifestyle scene",
    "playful seasonal props",
    "product-adjacent storytelling",
    "warm human connection",
  ],
  sectoral: [
    "sector-relevant still life",
    "professional service cue",
    "local business warmth",
    "industry symbol subtly",
    "trust-building detail",
  ],
  campaign: [
    "bold promotional energy",
    "offer-forward visual punch",
    "dynamic brand spotlight",
    "seasonal retail excitement",
    "clear call-to-action mood",
  ],
};

const STYLE_TYPOGRAPHY: Record<VisualStyle, TypographyMood[]> = {
  modern: ["corporate-clean", "bold-impact", "premium-editorial"],
  minimal: ["refined-elegant", "corporate-clean", "premium-editorial"],
  corporate: ["corporate-clean", "bold-impact", "refined-elegant"],
  friendly: ["warm-friendly", "bold-impact", "refined-elegant"],
  premium: ["premium-editorial", "refined-elegant", "bold-impact"],
  vibrant: ["bold-impact", "warm-friendly", "premium-editorial"],
};

function pickColorBalance(category: SpecialDayCategory, index: number): ColorBalance {
  switch (category) {
    case "national":
      return index % 4 === 0 ? "balanced" : "occasion-dominant";
    case "religious":
    case "friday":
      return index % 3 === 0 ? "brand-accent" : "occasion-dominant";
    case "campaign":
      return index % 2 === 0 ? "brand-dominant" : "balanced";
    case "holiday":
      return index % 2 === 0 ? "occasion-dominant" : "brand-accent";
    default:
      return index % 3 === 0 ? "brand-accent" : "balanced";
  }
}

function pickDensity(category: SpecialDayCategory, index: number): DensityLevel {
  if (category === "religious" || category === "friday") {
    return index % 3 === 0 ? "medium" : "low";
  }
  if (category === "campaign") {
    return index % 2 === 0 ? "high" : "medium";
  }
  return (["low", "medium", "high"] as const)[index % 3]!;
}

function pickTypography(
  visualStyle: VisualStyle,
  category: SpecialDayCategory,
  index: number,
  previous: ArtDirection[],
): TypographyMood {
  const pool = STYLE_TYPOGRAPHY[visualStyle];
  const seed = `${visualStyle}:${category}:${index}`;
  const recent = previous.slice(-3).map((d) => d.typographyMood);
  const fresh = pool.filter((m) => !recent.includes(m));
  const chosen = pickBySeed(fresh.length ? fresh : pool, seed, pool[0]!);
  return chosen;
}

function pickVisualFocus(
  layout: LayoutVariant,
  category: SpecialDayCategory,
  index: number,
  previous: ArtDirection[],
): VisualFocus {
  const base = LAYOUT_VISUAL_FOCUS[layout];
  const recent = previous.slice(-3).map((d) => d.visualFocus);
  if (!recent.includes(base)) return base;

  const alternates: VisualFocus[] =
    category === "religious" || category === "friday"
      ? ["symbolic-background", "atmospheric-scene", "pattern-texture"]
      : ["hero-object", "atmospheric-scene", "typography-first", "brand-accent"];

  const fresh = alternates.filter((f) => !recent.includes(f));
  return fresh[index % fresh.length] ?? base;
}

export function buildBrandProfile(input: {
  brandName: string;
  sector: string;
  visualStyle: VisualStyle;
  primaryColor: string;
}): BrandCreativeProfile {
  return {
    brandName: input.brandName,
    sector: input.sector,
    visualStyle: input.visualStyle,
    primaryColor: input.primaryColor,
  };
}

export function assignArtDirectionForDay(
  day: CollectionDayInput,
  index: number,
  previousDirections: ArtDirection[],
  brandProfile: BrandCreativeProfile,
): ArtDirection {
  const category = day.category;
  const seedBase = `${brandProfile.brandName}:${day.dayId}:${index}:${day.variantIndex ?? 0}`;

  const categoryLayouts = getCategoryLayouts(category);
  const allowedLayouts = filterLayoutsForAntiRepeat(previousDirections, categoryLayouts);
  const layout = pickBySeed(allowedLayouts, `${seedBase}:layout`, allowedLayouts[0]!);

  const textPosition = pickTextPosition(layout, index, previousDirections);
  const visualFocus = pickVisualFocus(layout, category, index, previousDirections);
  const typographyMood = pickTypography(brandProfile.visualStyle, category, index, previousDirections);
  const density = pickDensity(category, index);
  const colorBalance = pickColorBalance(category, index);

  const motifPool = filterMotifsForCategory(
    category,
    previousDirections,
    MOTIF_BY_CATEGORY[category],
  );
  const motifStrategy = pickBySeed(motifPool, `${seedBase}:motif`, motifPool[0]!);

  const antiRepeatNote = buildAntiRepeatNote(previousDirections);

  return {
    layout,
    textPosition,
    visualFocus,
    typographyMood,
    density,
    motifStrategy,
    colorBalance,
    ...(antiRepeatNote ? { antiRepeatNote } : {}),
  };
}

export function buildCollectionPlan(
  brandProfile: BrandCreativeProfile,
  days: CollectionDayInput[],
): CollectionPlan {
  const plan: ArtDirection[] = [];

  for (let index = 0; index < days.length; index += 1) {
    plan.push(assignArtDirectionForDay(days[index]!, index, plan, brandProfile));
  }

  return plan;
}

export function artDirectionToMetadata(
  direction: ArtDirection,
): import("@/lib/ai/art-direction/types").GeneratedDesignMetadata {
  return {
    layout: direction.layout,
    textPosition: direction.textPosition,
    visualFocus: direction.visualFocus,
    typographyMood: direction.typographyMood,
    density: direction.density,
    motifStrategy: direction.motifStrategy,
    colorBalance: direction.colorBalance,
  };
}
