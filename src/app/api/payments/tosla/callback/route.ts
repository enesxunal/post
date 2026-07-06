import { NextResponse } from "next/server";

import {
  getToslaEnvironment,
  isToslaConfigured,
} from "@/lib/payments/tosla-config";
import {
  handlePaymentFailure,
  handlePaymentSuccess,
  parseToslaCallbackPayload,
  verifyPaymentCallback,
} from "@/lib/payments/tosla";

const appUrl = () => process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  let payload;

  if (contentType.includes("application/json")) {
    const json = (await request.json()) as Record<string, string>;
    payload = parseToslaCallbackPayload(
      new URLSearchParams(Object.entries(json).map(([k, v]) => [k, String(v)])),
    );
  } else {
    const formData = await request.formData();
    payload = parseToslaCallbackPayload(formData);
  }

  const verification = verifyPaymentCallback(payload);
  const orderId = verification.orderId ?? payload.OrderId ?? "unknown";

  if (!verification.valid || !verification.paid) {
    const failure = await handlePaymentFailure(orderId, verification.reason);
    return NextResponse.redirect(
      `${appUrl()}/cancel?orderId=${encodeURIComponent(orderId)}&message=${encodeURIComponent(failure.message ?? "")}`,
      { status: 303 },
    );
  }

  await handlePaymentSuccess(orderId);

  return NextResponse.redirect(
    `${appUrl()}/success?orderId=${encodeURIComponent(orderId)}`,
    { status: 303 },
  );
}

export async function GET() {
  return NextResponse.json({
    toslaConfigured: isToslaConfigured(),
    environment: getToslaEnvironment(),
    callbackPath: "/api/payments/tosla/callback",
  });
}
