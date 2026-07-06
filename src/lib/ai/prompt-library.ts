import { getSpecialDayFromStore } from "@/lib/special-days/repository";
import type { SpecialDay } from "@/types/domain";

export async function getPromptLibraryEntry(dayId: string): Promise<SpecialDay | undefined> {
  return getSpecialDayFromStore(dayId);
}
