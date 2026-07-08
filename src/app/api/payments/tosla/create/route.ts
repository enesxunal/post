import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

import { calculatePackageTotal } from "@/lib/checkout/calculate-total";
import { getAppUrl } from "@/lib/config";
import { createToslaOrder } from "@/lib/orders/service";
import { createPaymentSession } from "@/lib/payments/tosla";
import { getToslaEnvironment, isToslaConfigured } from "@/lib/payments/tosla-config";
import type { OnboardingDraft } from "@/lib/onboarding/draft";
import { requireSessionUser } from "@/lib/supabase/auth";
import type { AddonKey } from "@/types/domain";

export async function POST(request: Request) {
  const user = await requireSessionUser("/login");

  const body = (await request.json().catch(() => ({}))) as {
    orderId?: string;
    amount?: number;
    addons?: AddonKey[];
    draft?: OnboardingDraft;
    description?: string;
  };

  const orderId = body.orderId ?? `order_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
  const draft = body.draft;
  const addons = body.addons?.length ? body.addons : (draft?.purchasedAddons ?? []);
  const amount = calculatePackageTotal(addons);
  const appUrl = getAppUrl();

  const internalOrder = await createToslaOrder(
    {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
    },
    amount,
    orderId,
    addons,
    draft,
  );

  try {
    const session = await createPaymentSession({
      orderId,
      amount,
      currency: "TRY",
      successUrl: `${appUrl}/success`,
      cancelUrl: `${appUrl}/cancel`,
      description: body.description,
    });

    return NextResponse.json({
      ...session,
      internalOrderId: internalOrder?.id ?? null,
    });
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
