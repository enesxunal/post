import { NextResponse } from "next/server";

import { getAppUrl } from "@/lib/config";
import { sendProjectReadyEmail } from "@/lib/email/send";

export async function POST() {
  const result = await sendProjectReadyEmail(
    "demo@example.com",
    `${getAppUrl()}/dashboard`,
  );

  return NextResponse.json(result);
}
