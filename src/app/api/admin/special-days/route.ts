import { NextResponse } from "next/server";

import { specialDays } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json({ data: specialDays });
}
