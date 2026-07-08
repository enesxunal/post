import type { SpecialDayCategory, VisualStyle } from "@/types/domain";

export const LAYOUT_VARIANTS = [
  "centered-hero-typography",
  "image-led-cinematic",
  "split-layout",
  "editorial-poster",
  "minimal-emblem",
  "diagonal-dynamic",
  "full-bleed-overlay",
  "object-focused-still-life",
  "pattern-based",
  "layered-card",
] as const;

export type LayoutVariant = (typeof LAYOUT_VARIANTS)[number];

export const TEXT_POSITIONS = [
  "center",
  "top",
  "bottom",
  "left",
  "right",
  "integrated",
] as const;

export type TextPosition = (typeof TEXT_POSITIONS)[number];

export const VISUAL_FOCUSES = [
  "symbolic-background",
  "hero-object",
  "typography-first",
  "atmospheric-scene",
  "brand-accent",
  "pattern-texture",
] as const;

export type VisualFocus = (typeof VISUAL_FOCUSES)[number];

export const TYPOGRAPHY_MOODS = [
  "bold-impact",
  "refined-elegant",
  "corporate-clean",
  "warm-friendly",
  "premium-editorial",
] as const;

export type TypographyMood = (typeof TYPOGRAPHY_MOODS)[number];

export const DENSITY_LEVELS = ["low", "medium", "high"] as const;

export type DensityLevel = (typeof DENSITY_LEVELS)[number];

export const COLOR_BALANCES = [
  "occasion-dominant",
  "brand-accent",
  "brand-dominant",
  "balanced",
] as const;

export type ColorBalance = (typeof COLOR_BALANCES)[number];

export const SECTOR_LAYER_INTENSITIES = ["subtle", "balanced", "hero"] as const;

export type SectorLayerIntensity = (typeof SECTOR_LAYER_INTENSITIES)[number];

export const SECTOR_INTEGRATION_STYLES = [
  "foreground-object",
  "background-atmosphere",
  "layered-scene",
  "editorial-product-scene",
  "minimal-symbolic",
  "lifestyle-environment",
  "abstract-brand-scene",
] as const;

export type SectorIntegrationStyle = (typeof SECTOR_INTEGRATION_STYLES)[number];

export type SectorLayer = {
  enabled: boolean;
  intensity: SectorLayerIntensity;
  elements: string[];
  integrationStyle: SectorIntegrationStyle;
};

export const LOGO_PLACEMENTS = [
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
  "bottom-center",
] as const;

export type LogoPlacement = (typeof LOGO_PLACEMENTS)[number];

export const LOGO_TREATMENTS = [
  "natural-corner",
  "badge",
  "card",
  "glass-surface",
  "minimal-mark",
] as const;

export type LogoTreatment = (typeof LOGO_TREATMENTS)[number];

export const BRAND_COLOR_USAGES = ["accent", "balanced", "dominant"] as const;

export type BrandColorUsage = (typeof BRAND_COLOR_USAGES)[number];

export type BrandIntegration = {
  logoPlacement: LogoPlacement;
  logoTreatment: LogoTreatment;
  colorUsage: BrandColorUsage;
};

export type ArtDirection = {
  layout: LayoutVariant;
  textPosition: TextPosition;
  visualFocus: VisualFocus;
  typographyMood: TypographyMood;
  density: DensityLevel;
  motifStrategy: string;
  colorBalance: ColorBalance;
  sectorLayer: SectorLayer;
  brandIntegration: BrandIntegration;
  antiRepeatNote?: string;
};

export type GeneratedDesignMetadata = {
  layout: string;
  textPosition: string;
  visualFocus: string;
  typographyMood: string;
  density: string;
  motifStrategy: string;
  colorBalance: string;
  sectorLayer?: SectorLayer;
  brandIntegration?: BrandIntegration;
};

export type BrandCreativeProfile = {
  brandName: string;
  sector: string;
  visualStyle: VisualStyle;
  primaryColor: string;
  /** Sektör native element havuzu (koleksiyon çeşitliliği için) */
  sectorElements?: string[];
  sectorNativeScene?: string;
};

export type CollectionDayInput = {
  dayId: string;
  category: SpecialDayCategory;
  variantIndex?: number;
};

export type CollectionPlan = ArtDirection[];
