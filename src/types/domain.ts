export type VisualStyle =
  | "modern"
  | "minimal"
  | "corporate"
  | "friendly"
  | "premium"
  | "vibrant";

export type SectorKey =
  | "beauty"
  | "cafe"
  | "dental"
  | "real-estate"
  | "education"
  | "boutique"
  | "auto-service"
  | "fitness"
  | "nutrition"
  | "agency"
  | "veterinary"
  | "law"
  | "accounting"
  | "hotel"
  | "photography"
  | "construction"
  | "cleaning"
  | "flower-gift"
  | "barber"
  | "jewelry"
  | "ecommerce"
  | "other";

export type SpecialDayCategory =
  | "recommended"
  | "national"
  | "holiday"
  | "religious"
  | "friday"
  | "popular"
  | "sectoral"
  | "campaign";

export type DayType = "fixed" | "movable" | "manual";

export type JobStatus =
  | "draft"
  | "queued"
  | "composing_prompt"
  | "generating_image"
  | "generating_caption"
  | "ready"
  | "failed";

export type AddonKey = "caption" | "story" | "calendar";

export type PostFormat = "square" | "landscape-1350x1080";

export interface SelectedDayEntry {
  dayId: string;
  /** Cuma mesajları için 1-4; diğer günlerde varsayılan 1. */
  quantity: number;
}

export interface AddonOption {
  key: AddonKey;
  label: string;
  description: string;
  price: number;
}

export interface PromptBuildingBlocks {
  eventBrief: string;
  brandPersonalizationRules: string[];
  visualRules: string[];
  avoid: string[];
}

export interface SpecialDay {
  id: string;
  name: string;
  slug: string;
  category: SpecialDayCategory;
  dateType: DayType;
  dateValue: string;
  importance: "high" | "medium" | "low";
  culturalContext: string;
  popularUsages: string[];
  headlineAlternatives: string[];
  captionIdeas: string[];
  visualDirection: string;
  avoidRules: string;
  promptTemplate: string;
  promptBuildingBlocks?: PromptBuildingBlocks;
  masterPromptTemplate?: string;
  isDefaultSelected: boolean;
}

export interface SectorRule {
  key: SectorKey;
  name: string;
  description: string;
  visualCues: string;
  toneHints: string;
  compositionHints: string;
  colorHints: string;
  suitableElements: string[];
  avoidRules: string[];
  promptModifier: string;
}

/** @deprecated SectorRule kullanın */
export interface SectorModifier {
  key: SectorKey;
  name: string;
  description: string;
  visualCues: string;
  toneHints: string;
  avoidRules: string;
  promptModifier: string;
}

export interface StyleRule {
  key: VisualStyle;
  name: string;
  description: string;
  visualCues: string;
  typographyHints: string;
  compositionHints: string;
  colorHints: string;
  bestFor: string[];
  avoidRules: string[];
  promptModifier: string;
}

/** Onboarding kartları — sadece isim + kısa açıklama */
export interface StyleOption {
  key: VisualStyle;
  name: string;
  description: string;
}

/** @deprecated StyleRule / StyleOption kullanın */
export interface StyleModifier {
  key: VisualStyle;
  name: string;
  description: string;
  promptModifier: string;
}

export interface BrandContext {
  brandName: string;
  sector: SectorKey;
  customSector?: string;
  brandDescription?: string;
  /** İlk renk; geriye dönük uyumluluk için ana renk. */
  primaryColor: string;
  /** Seçim sırasına göre marka renkleri (en fazla 3). */
  brandColors: string[];
  visualStyle: VisualStyle;
  logoUrl?: string;
  logoAnalysis?: import("@/lib/ai/logo-analysis").LogoAnalysis;
  selectedDayIds: string[];
  purchasedAddons: AddonKey[];
  postFormat?: PostFormat;
}

export interface PromptPreview {
  headline: string;
  prompt: string;
  negativePrompt: string;
  brief?: import("@/lib/ai/creative-brief").CreativeBrief;
  /** @deprecated brief kullanın */
  brandBrief?: import("@/lib/ai/brand-creative-director").BrandCreativeBrief;
}

export interface ProjectRecord {
  id: string;
  brandName: string;
  primaryColor: string;
  visualStyle: VisualStyle;
  remainingCredits: number;
  bonusCreditsGranted: boolean;
}
