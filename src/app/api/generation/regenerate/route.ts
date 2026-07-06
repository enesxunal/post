import { NextResponse } from "next/server";

import { consumeRevisionCredit } from "@/lib/jobs";

export async function POST() {
  const result = consumeRevisionCredit(0, false);
  return NextResponse.json(result);
}
