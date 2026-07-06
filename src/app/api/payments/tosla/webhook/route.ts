import { NextResponse } from "next/server";

import { verifyPaymentWebhook } from "@/lib/payments/tosla";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const verification = await verifyPaymentWebhook(rawBody);

  return NextResponse.json(verification);
}
