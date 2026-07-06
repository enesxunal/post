import { specialDaysCatalog } from "@/lib/special-days-data";

export function getPromptLibraryEntry(dayId: string) {
  return specialDaysCatalog.find((item) => item.id === dayId);
}
