import { NextResponse } from "next/server";

import { createGenerationJobs } from "@/lib/jobs";
import type { BrandContext } from "@/types/domain";

const demoContext: BrandContext = {
  brandName: "Marka Postlari",
  sector: "beauty",
  primaryColor: "#16A34A",
  brandColors: ["#16A34A", "#10B981"],
  visualStyle: "premium",
  selectedDayIds: ["new-year", "ramadan-feast", "29-ekim"],
  purchasedAddons: ["caption"],
};

export async function POST() {
  const jobs = createGenerationJobs(demoContext);
  return NextResponse.json({ jobs });
}
