import { FRIDAY_DAY_ID, MAX_SELECTED_DAYS } from "@/lib/config";
import { getSpecialDayById } from "@/lib/special-days-data";
import type { SelectedDayEntry } from "@/types/domain";

export const MAX_FRIDAY_QUANTITY = 4;

export function countSelectedSlots(entries: SelectedDayEntry[]) {
  return entries.reduce((sum, entry) => sum + entry.quantity, 0);
}

export function getSelectedEntry(entries: SelectedDayEntry[], dayId: string) {
  return entries.find((entry) => entry.dayId === dayId);
}

export function isFridayDay(dayId: string) {
  return dayId === FRIDAY_DAY_ID;
}

/** Üretim işleri için seçimleri genişletir (cuma adedi kadar ayrı job). */
export function expandSelectedDaysForJobs(entries: SelectedDayEntry[]) {
  const jobs: { dayId: string; variantIndex?: number }[] = [];

  for (const entry of entries) {
    if (isFridayDay(entry.dayId)) {
      for (let index = 0; index < entry.quantity; index += 1) {
        jobs.push({ dayId: entry.dayId, variantIndex: index + 1 });
      }
      continue;
    }

    for (let index = 0; index < entry.quantity; index += 1) {
      jobs.push({ dayId: entry.dayId });
    }
  }

  return jobs;
}

export function formatSelectedDayLabel(entry: SelectedDayEntry) {
  const day = getSpecialDayById(entry.dayId);
  const name = day?.name ?? entry.dayId;

  if (isFridayDay(entry.dayId) && entry.quantity > 1) {
    return `${name} x${entry.quantity}`;
  }

  return name;
}

export function canAddQuantity(
  entries: SelectedDayEntry[],
  dayId: string,
  nextQuantity: number,
) {
  const current = getSelectedEntry(entries, dayId);
  const currentQty = current?.quantity ?? 0;
  const delta = nextQuantity - currentQty;
  if (delta <= 0) return true;

  const used = countSelectedSlots(entries);
  const maxForFriday = isFridayDay(dayId)
    ? Math.min(MAX_FRIDAY_QUANTITY, MAX_SELECTED_DAYS - used + currentQty)
    : MAX_SELECTED_DAYS - used + currentQty;

  return nextQuantity <= maxForFriday;
}

export function setDayQuantity(
  entries: SelectedDayEntry[],
  dayId: string,
  quantity: number,
) {
  const safeQty = Math.max(1, quantity);

  if (!canAddQuantity(entries, dayId, safeQty)) {
    return entries;
  }

  const existing = getSelectedEntry(entries, dayId);
  if (!existing) {
    return [...entries, { dayId, quantity: safeQty }];
  }

  return entries.map((entry) =>
    entry.dayId === dayId ? { ...entry, quantity: safeQty } : entry,
  );
}

export function toggleDayEntry(entries: SelectedDayEntry[], dayId: string) {
  if (getSelectedEntry(entries, dayId)) {
    return entries.filter((entry) => entry.dayId !== dayId);
  }

  if (countSelectedSlots(entries) >= MAX_SELECTED_DAYS) {
    return entries;
  }

  return [...entries, { dayId, quantity: 1 }];
}

export function entriesFromDayIds(dayIds: string[]): SelectedDayEntry[] {
  return dayIds.map((dayId) => ({ dayId, quantity: 1 }));
}

export function dayIdsFromEntries(entries: SelectedDayEntry[]) {
  return entries.map((entry) => entry.dayId);
}
