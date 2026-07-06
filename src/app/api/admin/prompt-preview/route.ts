import { NextResponse } from "next/server";

import { composeImagePrompt } from "@/lib/ai/prompt-composer";
import type { BrandContext } from "@/types/domain";

export async function POST() {
  const context: BrandContext = {
    brandName: "Marka Postlari",
    sector: "cafe",
    primaryColor: "#10B981",
    brandColors: ["#10B981", "#16A34A"],
    visualStyle: "modern",
    selectedDayIds: ["new-year"],
    purchasedAddons: ["caption"],
  };

  return NextResponse.json(composeImagePrompt(context, "new-year"));
}
