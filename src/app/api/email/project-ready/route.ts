import { NextResponse } from "next/server";

import { sendProjectReadyEmail } from "@/lib/email/send";

export async function POST() {
  const result = await sendProjectReadyEmail(
    "demo@example.com",
    `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/dashboard`,
  );

  return NextResponse.json(result);
}
