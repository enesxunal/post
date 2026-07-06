import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

import { BASE_PACKAGE_PRICE } from "@/lib/config";
import { createToslaOrder } from "@/lib/orders/service";
import { createPaymentSession } from "@/lib/payments/tosla";
import { getToslaEnvironment, isToslaConfigured } from "@/lib/payments/tosla-config";
import { requireSessionUser } from "@/lib/supabase/auth";

export async function POST(request: Request) {
  const user = await requireSessionUser("/login");

  const body = (await request.json().catch(() => ({}))) as {
    orderId?: string;
    amount?: number;
    description?: string;
  };

  const orderId = body.orderId ?? `order_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
  const amount = body.amount ?? BASE_PACKAGE_PRICE;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  await createToslaOrder(user.id, amount, orderId);

  try {
    const session = await createPaymentSession({
      orderId,
      amount,
      currency: "TRY",
      successUrl: `${appUrl}/success`,
      cancelUrl: `${appUrl}/cancel`,
      description: body.description,
    });

    return NextResponse.json(session);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Ödeme oturumu oluşturulamadı";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function GET() {
  return NextResponse.json({
    toslaConfigured: isToslaConfigured(),
    environment: getToslaEnvironment(),
  });
}
