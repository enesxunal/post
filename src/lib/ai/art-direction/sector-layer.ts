import type {
  BrandCreativeProfile,
  SectorIntegrationStyle,
  SectorLayer,
  SectorLayerIntensity,
} from "@/lib/ai/art-direction/types";
import { SECTOR_INTEGRATION_STYLES } from "@/lib/ai/art-direction/types";
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

/** Sektöre göre varsayılan premium native element havuzları */
export const DEFAULT_SECTOR_ELEMENTS: Record<string, string[]> = {
  beauty: [
    "soft beauty textures",
    "elegant salon light",
    "skincare product reflection",
    "silk fabric fold",
    "premium feminine atmosphere",
    "clean mirror glow",
  ],
  cafe: [
    "warm table setting",
    "coffee steam",
    "dessert plate detail",
    "cozy hospitality light",
    "latte cup",
    "fresh bakery warmth",
  ],
  dental: [
    "bright hygienic clinic light",
    "soft white medical surfaces",
    "calm confidence atmosphere",
    "minimal clinical cleanliness",
    "gentle light reflections",
  ],
  "real-estate": [
    "modern city silhouette",
    "architectural lines",
    "warm window light",
    "home lifestyle hint",
    "confident corporate structure",
  ],
  agency: [
    "subtle glass UI cards",
    "content planning surfaces",
    "modern digital depth layers",
    "soft abstract brand panels",
    "premium startup atmosphere",
  ],
  education: [
    "clean notebook texture",
    "soft learning atmosphere",
    "academic calm light",
    "inspiring classroom warmth",
  ],
  boutique: [
    "fabric texture",
    "gift packaging",
    "retail display hint",
    "shopping bag silhouette",
    "chic product vignette",
  ],
  fitness: [
    "clean fitness object",
    "energetic motion hint",
    "studio lighting",
    "strong but premium athletic atmosphere",
  ],
  nutrition: [
    "fresh wellness produce",
    "natural food texture",
    "balanced lifestyle light",
    "clean green vitality",
  ],
  "auto-service": [
    "clean vehicle detail",
    "headlight reflection",
    "metallic surface texture",
    "trustworthy service atmosphere",
  ],
  veterinary: [
    "gentle pet care warmth",
    "soft clinic calm",
    "friendly trustworthy atmosphere",
  ],
  law: [
    "refined institutional texture",
    "classic corporate calm",
    "subtle trust symbols",
  ],
  accounting: [
    "clean desk atmosphere",
    "precise corporate order",
    "trustworthy finance calm",
  ],
  hotel: [
    "hospitality lounge light",
    "premium travel warmth",
    "welcoming lobby atmosphere",
  ],
  photography: [
    "studio softboxes glow",
    "editorial lens atmosphere",
    "creative depth of field",
  ],
  construction: [
    "architectural blueprint lines",
    "solid structure texture",
    "modern building silhouette",
  ],
  cleaning: [
    "fresh sparkling surfaces",
    "clean service atmosphere",
    "bright hygienic light",
  ],
  "flower-gift": [
    "floral bouquet detail",
    "gift wrap ribbon",
    "soft romantic texture",
  ],
  barber: [
    "barbershop mirror glow",
    "clean grooming tools",
    "classic masculine warmth",
  ],
  jewelry: [
    "metallic sparkle detail",
    "luxury velvet texture",
    "refined boutique display",
  ],
  ecommerce: [
    "unboxing product scene",
    "clean retail packaging",
    "modern shopping energy",
  ],
  other: [
    "local business warmth",
    "trustworthy service cue",
    "neighborhood brand atmosphere",
  ],
};

const INTEGRATION_BY_STYLE: Record<VisualStyle, SectorIntegrationStyle[]> = {
  modern: ["layered-scene", "abstract-brand-scene", "foreground-object", "lifestyle-environment"],
  minimal: ["minimal-symbolic", "background-atmosphere", "abstract-brand-scene"],
  corporate: ["layered-scene", "lifestyle-environment", "minimal-symbolic", "background-atmosphere"],
  friendly: ["lifestyle-environment", "foreground-object", "editorial-product-scene"],
  premium: ["editorial-product-scene", "layered-scene", "lifestyle-environment", "minimal-symbolic"],
  vibrant: ["foreground-object", "editorial-product-scene", "layered-scene"],
};

function intensityForCategory(category: SpecialDayCategory): SectorLayerIntensity {
  switch (category) {
    case "national":
    case "religious":
    case "friday":
      return "subtle";
    case "sectoral":
      return "hero";
    case "campaign":
      return "balanced";
    default:
      return "balanced";
  }
}

export function resolveSectorElementPool(
  brandProfile: BrandCreativeProfile,
): string[] {
  if (brandProfile.sectorElements?.length) {
    return brandProfile.sectorElements;
  }
  return DEFAULT_SECTOR_ELEMENTS[brandProfile.sector] ?? DEFAULT_SECTOR_ELEMENTS.other!;
}

export function filterSectorElementsForAntiRepeat(
  previous: Array<{ sectorLayer?: SectorLayer }>,
  pool: string[],
): string[] {
  const recent = previous.slice(-5);
  const used = new Set(
    recent.flatMap((d) => d.sectorLayer?.elements ?? []).map((e) => e.toLowerCase()),
  );
  const fresh = pool.filter((el) => !used.has(el.toLowerCase()));
  return fresh.length >= 2 ? fresh : pool;
}

export function filterIntegrationStylesForAntiRepeat(
  previous: Array<{ sectorLayer?: SectorLayer }>,
  candidates: SectorIntegrationStyle[],
): SectorIntegrationStyle[] {
  const recent = previous.slice(-3).map((d) => d.sectorLayer?.integrationStyle);
  const fresh = candidates.filter((style) => !recent.includes(style));
  return fresh.length ? fresh : candidates;
}

export function buildSectorLayer(
  brandProfile: BrandCreativeProfile,
  category: SpecialDayCategory,
  index: number,
  previous: Array<{ sectorLayer?: SectorLayer }>,
  dayId: string,
): SectorLayer {
  const seedBase = `${brandProfile.brandName}:${dayId}:${index}:sector`;
  const pool = filterSectorElementsForAntiRepeat(
    previous,
    resolveSectorElementPool(brandProfile),
  );

  const elementCount = category === "sectoral" ? 3 : 2;
  const elements: string[] = [];
  let working = [...pool];
  for (let i = 0; i < elementCount && working.length; i += 1) {
    const picked = pickBySeed(working, `${seedBase}:el:${i}`, working[0]!);
    elements.push(picked);
    working = working.filter((item) => item !== picked);
  }

  const stylePool = filterIntegrationStylesForAntiRepeat(
    previous,
    INTEGRATION_BY_STYLE[brandProfile.visualStyle] ?? [...SECTOR_INTEGRATION_STYLES],
  );
  const integrationStyle = pickBySeed(
    stylePool,
    `${seedBase}:integration`,
    stylePool[0]!,
  );

  return {
    enabled: true,
    intensity: intensityForCategory(category),
    elements,
    integrationStyle,
  };
}

export function sectorLayerToPromptPhrase(
  layer: SectorLayer,
  sectorLabel: string,
): string {
  if (!layer.enabled || !layer.elements.length) {
    return `Sector-native layer: keep a subtle ${sectorLabel} business atmosphere without inventing unrelated props.`;
  }

  const intensityNote =
    layer.intensity === "subtle"
      ? "Keep these cues subtle so the special day remains primary"
      : layer.intensity === "hero"
        ? "Make the sector identity clearly readable while still honoring the occasion"
        : "Balance sector cues with the occasion atmosphere";

  return (
    `Sector-native layer: integrate ${layer.elements.join(", ")} as natural parts of the scene ` +
    `using a ${layer.integrationStyle.replace(/-/g, " ")} approach for a ${sectorLabel} business. ` +
    `${intensityNote}. Do not let sector props overpower the special day.`
  );
}
