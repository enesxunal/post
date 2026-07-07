import type { AddonKey, SelectedDayEntry, VisualStyle } from "@/types/domain";
import type { LogoAnalysis } from "@/lib/ai/logo-analysis";

const DRAFT_KEY = "post_onboarding_draft";

export type OnboardingFormMode = "basic" | "detailed";

export type DayCustomization = {
  headline?: string;
  visualDirection?: string;
  captionNote?: string;
};

export interface OnboardingDraft {
  brandName: string;
  logoUrl?: string;
  logoAnalysis?: LogoAnalysis;
  /** Detaylı modda kullanıcı seçer; basic modda varsayılan bottom-right */
  logoPlacement?: LogoAnalysis["bestPlacement"];
  brandColors: string[];
  sector: string;
  customSector?: string;
  brandDescription?: string;
  visualStyle: VisualStyle;
  /** Detaylı mod: stil promptuna eklenecek notlar */
  styleCustomNotes?: string;
  /** Detaylı mod: gün bazlı özelleştirmeler */
  dayCustomizations?: Record<string, DayCustomization>;
  selectedDays: SelectedDayEntry[];
  purchasedAddons: AddonKey[];
  orderId?: string;
  postFormat?: import("@/types/domain").PostFormat;
  formMode?: OnboardingFormMode;
}

export function saveOnboardingDraft(draft: OnboardingDraft) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function loadOnboardingDraft(): OnboardingDraft | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(DRAFT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as OnboardingDraft;
  } catch {
    return null;
  }
}

export function clearOnboardingDraft() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(DRAFT_KEY);
}
