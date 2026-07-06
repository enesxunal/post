import { NextResponse } from "next/server";

import { listSpecialDays } from "@/lib/special-days/repository";

export async function GET() {
  const data = await listSpecialDays();
  return NextResponse.json({ data });
}
