import type { SectorKey } from "@/types/domain";

/** Seed JSON anahtarları → onboarding / proje sektör anahtarları */
export const SECTOR_KEY_FROM_SEED: Record<string, SectorKey> = {
  beauty_salon: "beauty",
  cafe_restaurant: "cafe",
  dental_clinic: "dental",
  real_estate: "real-estate",
  digital_agency: "agency",
  education: "education",
  boutique_store: "boutique",
  fitness_gym: "fitness",
  dietitian_health: "nutrition",
  auto_service: "auto-service",
  veterinary: "veterinary",
  law_office: "law",
  accounting_finance: "accounting",
  hotel_tourism: "hotel",
  photography_studio: "photography",
  construction_architecture: "construction",
  cleaning_services: "cleaning",
  flower_gift: "flower-gift",
  barber_hairdresser: "barber",
  jewelry_accessories: "jewelry",
  ecommerce: "ecommerce",
  local_service: "other",
};

export function normalizeSectorKey(raw: string): SectorKey {
  if (raw in SECTOR_KEY_FROM_SEED) {
    return SECTOR_KEY_FROM_SEED[raw]!;
  }
  return raw as SectorKey;
}
