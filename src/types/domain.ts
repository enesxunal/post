export type VisualStyle =
  | "modern"
  | "minimal"
  | "corporate"
  | "friendly"
  | "premium"
  | "colorful";

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
  | "queued"
  | "composing_prompt"
  | "generating_image"
  | "generating_caption"
  | "ready"
  | "failed";

export type AddonKey = "caption" | "story" | "calendar";

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
  isDefaultSelected: boolean;
}

export interface SectorModifier {
  key: SectorKey;
  name: string;
  description: string;
  visualCues: string;
  toneHints: string;
  avoidRules: string;
  promptModifier: string;
}

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
  selectedDayIds: string[];
  purchasedAddons: AddonKey[];
}

export interface PromptPreview {
  headline: string;
  prompt: string;
  negativePrompt: string;
}

export interface ProjectRecord {
  id: string;
  brandName: string;
  primaryColor: string;
  visualStyle: VisualStyle;
  remainingCredits: number;
  bonusCreditsGranted: boolean;
}
