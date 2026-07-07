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

export type ArtDirection = {
  layout: LayoutVariant;
  textPosition: TextPosition;
  visualFocus: VisualFocus;
  typographyMood: TypographyMood;
  density: DensityLevel;
  motifStrategy: string;
  colorBalance: ColorBalance;
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
};

export type BrandCreativeProfile = {
  brandName: string;
  sector: string;
  visualStyle: VisualStyle;
  primaryColor: string;
};

export type CollectionDayInput = {
  dayId: string;
  category: SpecialDayCategory;
  variantIndex?: number;
};

export type CollectionPlan = ArtDirection[];
