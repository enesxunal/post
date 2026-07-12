import type { SpecialDay, SpecialDayCategory } from "@/types/domain";

/**
 * Başka özel gün kategorilerinden sızabilecek semboller.
 * Amaç: AI'nin Cuma/kandil/bayram görsellerini milli gün vb. ile karıştırmasını engellemek.
 */
const CROSS_CATEGORY_LEAKS: Record<SpecialDayCategory, string[]> = {
  national: [
    "mosque",
    "minaret",
    "cami",
    "Islamic dome skyline",
    "kandil lamp",
    "kandil night",
    "hilal as main hero",
    "Friday prayer scene",
    "bayram feast table",
    "Ramadan lantern",
    "religious geometric prayer motif as hero",
    "Ottoman tourist skyline",
  ],
  holiday: [
    "mosque as main subject",
    "kandil-only night scene",
    "Republic Day parade",
    "military march",
    "Children's Day school parade as wrong holiday",
  ],
  religious: [
    "Turkish flag as dominant hero",
    "Republic Day typography",
    "national parade",
    "Children's Day balloons",
    "Black Friday sale",
  ],
  friday: [
    "Turkish flag dominant",
    "national day parade",
    "bayram feast as main",
    "kandil night as main",
    "Christmas tree",
  ],
  recommended: [
    "wrong holiday symbols from another Turkish occasion",
    "mosque on non-religious posts",
    "national flag on personal romantic posts",
  ],
  popular: [
    "mosque unless the day is religious",
    "mixing two different Turkish holidays in one frame",
  ],
  sectoral: [
    "national flag overpowering profession day",
    "religious imagery on secular profession day",
  ],
  campaign: [
    "religious holiday symbols on retail campaign",
    "national memorial tone on promo sale",
  ],
};

const DAY_SPECIFIC_LEAKS: Partial<Record<string, string[]>> = {
  "29-ekim": [
    "mosque in window",
    "Blue Mosque",
    "Hagia Sophia",
    "Bosphorus mosque view",
    "Islamic architecture background",
  ],
  "friday-blessing": [
    "Turkish flag large",
    "Republic Day text",
    "bayram table",
  ],
};

export function buildOccasionIsolationPrompt(day: SpecialDay): string {
  return [
    `Occasion lock (critical): This design is ONLY for "${day.name}" (${day.category}).`,
    "Use visual vocabulary that belongs to THIS exact day — never blend symbols from other Turkish occasions (Cuma, kandil, bayram, yılbaşı, milli gün vb.).",
    "If the occasion is not religious, do not add mosque, minaret, hilal hero, or prayer aesthetics.",
    "If the occasion is not a national day, do not make Turkish flag or republic parade the hero.",
  ].join(" ");
}

export function getCrossOccasionAvoidList(day: SpecialDay): string[] {
  const fromCategory = CROSS_CATEGORY_LEAKS[day.category] ?? [];
  const fromDay = DAY_SPECIFIC_LEAKS[day.id] ?? DAY_SPECIFIC_LEAKS[day.slug] ?? [];
  return [...new Set([...fromCategory, ...fromDay])];
}
