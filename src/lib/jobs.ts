import { addDays, format } from "date-fns";

import { runGenerationPipeline } from "@/lib/ai/generation-pipeline";
import { BONUS_REVISION_CREDITS, INCLUDED_REVISION_CREDITS } from "@/lib/config";
import { expandSelectedDaysForJobs } from "@/lib/selected-days";
import type { BrandContext, SelectedDayEntry } from "@/types/domain";

export function createGenerationJobs(
  context: BrandContext,
  selectedDayEntries?: SelectedDayEntry[],
) {
  const jobs = selectedDayEntries
    ? expandSelectedDaysForJobs(selectedDayEntries)
    : context.selectedDayIds.map((dayId) => ({ dayId, variantIndex: undefined as number | undefined }));

  return jobs.map((job, index) => ({
    id: `job-${job.dayId}${job.variantIndex ? `-${job.variantIndex}` : ""}`,
    projectId: "project-demo",
    userId: "user-demo",
    specialDayId: job.dayId,
    variantIndex: job.variantIndex,
    type: "image",
    status: "queued",
    sortOrder: index + 1,
    scheduledFor: format(addDays(new Date(), index), "yyyy-MM-dd"),
  }));
}

export async function processGenerationJob(context: BrandContext, dayId: string) {
  return runGenerationPipeline(context, dayId);
}

export function consumeRevisionCredit(currentCredits: number, bonusAlreadyGranted: boolean) {
  if (currentCredits > 0) {
    return {
      remainingCredits: currentCredits - 1,
      bonusCreditsGranted: bonusAlreadyGranted,
      giftedBonus: 0,
    };
  }

  if (!bonusAlreadyGranted) {
    return {
      remainingCredits: BONUS_REVISION_CREDITS - 1,
      bonusCreditsGranted: true,
      giftedBonus: BONUS_REVISION_CREDITS,
    };
  }

  return {
    remainingCredits: 0,
    bonusCreditsGranted: true,
    giftedBonus: 0,
  };
}

export function createProjectDraft() {
  return {
    baseCredits: INCLUDED_REVISION_CREDITS,
    remainingCredits: INCLUDED_REVISION_CREDITS,
    bonusCreditsGranted: false,
    status: "draft",
  };
}
