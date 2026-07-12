import type {
  BrandCreativeProfile,
  SectorIntegrationStyle,
  SectorLayer,
  SectorLayerIntensity,
} from "@/lib/ai/art-direction/types";
import { SECTOR_INTEGRATION_STYLES } from "@/lib/ai/art-direction/types";
import {
  mergeSectorElementPool,
  SECTOR_NATIVE_PROFILES,
} from "@/lib/ai/sector-native-profiles";
import type { SectorKey, SpecialDayCategory, VisualStyle } from "@/types/domain";

const NATIONAL_RISKY_ELEMENT = /skyline|city lights|window view|bosphorus|istanbul|mosque|minaret|dome silhouette/i;

export function filterSectorElementsForOccasion(
  pool: string[],
  category: SpecialDayCategory,
): string[] {
  if (category !== "national") return pool;
  const filtered = pool.filter((el) => !NATIONAL_RISKY_ELEMENT.test(el));
  return filtered.length >= 2 ? filtered : pool;
}

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

/** Geriye dönük uyumluluk */
export const DEFAULT_SECTOR_ELEMENTS: Record<string, string[]> = Object.fromEntries(
  Object.entries(SECTOR_NATIVE_PROFILES).map(([key, profile]) => [key, profile.elements]),
);

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
  return mergeSectorElementPool(
    brandProfile.sector as SectorKey,
    brandProfile.sectorElements,
  );
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
  const pool = filterSectorElementsForOccasion(
    filterSectorElementsForAntiRepeat(
      previous,
      resolveSectorElementPool(brandProfile),
    ),
    category,
  );

  const elementCount =
    category === "sectoral" ? 3 : category === "national" || category === "religious" ? 2 : 3;
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
    `Sector-native layer: integrate ${layer.elements.join(", ")} as natural parts of a ${sectorLabel} scene ` +
    `using a ${layer.integrationStyle.replace(/-/g, " ")} approach. ` +
    `${intensityNote}. Build a sector-native branded scene — not occasion wallpaper with a headline sticker.`
  );
}
