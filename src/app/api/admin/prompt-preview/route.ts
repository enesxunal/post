import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin/auth";
import { composeImagePrompt } from "@/lib/ai/prompt-composer";
import type { BrandContext } from "@/types/domain";

export async function POST(request: Request) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    brandName?: string;
    dayId?: string;
  };

  const context: BrandContext = {
    brandName: body.brandName ?? "Örnek Marka",
    sector: "cafe",
    primaryColor: "#10B981",
    brandColors: ["#10B981", "#16A34A"],
    visualStyle: "modern",
    selectedDayIds: [body.dayId ?? "new-year"],
    purchasedAddons: ["caption"],
  };

  const preview = await composeImagePrompt(context, body.dayId ?? "new-year");
  return NextResponse.json(preview);
}
