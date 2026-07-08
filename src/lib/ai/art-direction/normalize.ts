import { defaultBrandIntegrationForCategory } from "@/lib/ai/art-direction/brand-integration";
import { DEFAULT_SECTOR_ELEMENTS } from "@/lib/ai/art-direction/sector-layer";
import type {
  ArtDirection,
  BrandIntegration,
  SectorLayer,
} from "@/lib/ai/art-direction/types";
import type { SpecialDayCategory } from "@/types/domain";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function parseSectorLayer(raw: unknown, sectorKey?: string): SectorLayer {
  if (isRecord(raw) && Array.isArray(raw.elements)) {
    return {
      enabled: raw.enabled !== false,
      intensity:
        raw.intensity === "subtle" || raw.intensity === "hero" || raw.intensity === "balanced"
          ? raw.intensity
          : "balanced",
      elements: raw.elements.filter((item): item is string => typeof item === "string").slice(0, 4),
      integrationStyle:
        typeof raw.integrationStyle === "string"
          ? (raw.integrationStyle as SectorLayer["integrationStyle"])
          : "layered-scene",
    };
  }

  const fallback = DEFAULT_SECTOR_ELEMENTS[sectorKey ?? "other"] ?? DEFAULT_SECTOR_ELEMENTS.other!;
  return {
    enabled: true,
    intensity: "balanced",
    elements: fallback.slice(0, 2),
    integrationStyle: "layered-scene",
  };
}

function parseBrandIntegration(
  raw: unknown,
  category: SpecialDayCategory = "popular",
): BrandIntegration {
  if (isRecord(raw) && typeof raw.logoPlacement === "string") {
    return {
      logoPlacement: raw.logoPlacement as BrandIntegration["logoPlacement"],
      logoTreatment:
        typeof raw.logoTreatment === "string"
          ? (raw.logoTreatment as BrandIntegration["logoTreatment"])
          : "natural-corner",
      colorUsage:
        raw.colorUsage === "accent" ||
        raw.colorUsage === "balanced" ||
        raw.colorUsage === "dominant"
          ? raw.colorUsage
          : "balanced",
    };
  }
  return defaultBrandIntegrationForCategory(category);
}

/** Eski job kayıtları sectorLayer/brandIntegration olmadan gelebilir — güvenli doldur. */
export function normalizeArtDirection(
  raw: unknown,
  options?: { sectorKey?: string; category?: SpecialDayCategory },
): ArtDirection | null {
  if (!isRecord(raw)) return null;
  if (typeof raw.layout !== "string" || typeof raw.textPosition !== "string") return null;

  return {
    layout: raw.layout as ArtDirection["layout"],
    textPosition: raw.textPosition as ArtDirection["textPosition"],
    visualFocus: (raw.visualFocus as ArtDirection["visualFocus"]) ?? "atmospheric-scene",
    typographyMood: (raw.typographyMood as ArtDirection["typographyMood"]) ?? "premium-editorial",
    density: (raw.density as ArtDirection["density"]) ?? "medium",
    motifStrategy: typeof raw.motifStrategy === "string" ? raw.motifStrategy : "elegant festive texture",
    colorBalance: (raw.colorBalance as ArtDirection["colorBalance"]) ?? "balanced",
    sectorLayer: parseSectorLayer(raw.sectorLayer, options?.sectorKey),
    brandIntegration: parseBrandIntegration(raw.brandIntegration, options?.category),
    ...(typeof raw.antiRepeatNote === "string" ? { antiRepeatNote: raw.antiRepeatNote } : {}),
  };
}
