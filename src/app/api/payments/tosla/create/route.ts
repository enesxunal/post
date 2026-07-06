import { NextResponse } from "next/server";

import { createPaymentSession } from "@/lib/payments/tosla";

export async function POST() {
  const session = await createPaymentSession({
    orderId: "demo-order",
    amount: 299,
    currency: "TRY",
    successUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/success`,
    cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/cancel`,
  });

  return NextResponse.json(session);
}
