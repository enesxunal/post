import { NextResponse } from "next/server";

import { processGenerationJob } from "@/lib/jobs";
import { TODO_LABELS } from "@/lib/config";
import type { BrandContext } from "@/types/domain";

const demoContext: BrandContext = {
  brandName: "Marka Postlari",
  sector: "beauty",
  primaryColor: "#16A34A",
  brandColors: ["#16A34A", "#10B981"],
  visualStyle: "premium",
  brandDescription: "Premium cilt bakimi hizmetleri sunan bir guzellik salonu.",
  selectedDayIds: ["29-ekim"],
  purchasedAddons: ["caption"],
};

export async function POST() {
  const result = await processGenerationJob(demoContext, "29-ekim");

  return NextResponse.json({
    ...result,
    notes: [TODO_LABELS.imageProvider, TODO_LABELS.cronWorker],
  });
}
