import type { AddonKey, SelectedDayEntry, VisualStyle } from "@/types/domain";

const DRAFT_KEY = "post_onboarding_draft";

export interface OnboardingDraft {
  brandName: string;
  logoUrl?: string;
  brandColors: string[];
  sector: string;
  customSector?: string;
  brandDescription?: string;
  visualStyle: VisualStyle;
  selectedDays: SelectedDayEntry[];
  purchasedAddons: AddonKey[];
  orderId?: string;
  postFormat?: import("@/types/domain").PostFormat;
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
