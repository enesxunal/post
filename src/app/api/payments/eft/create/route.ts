import { NextResponse } from "next/server";

import { calculatePackageTotal } from "@/lib/checkout/calculate-total";
import { createEftOrder } from "@/lib/orders/service";
import type { OnboardingDraft } from "@/lib/onboarding/draft";
import { requireSessionUser } from "@/lib/supabase/auth";
import type { AddonKey } from "@/types/domain";

export async function POST(request: Request) {
  const user = await requireSessionUser("/login");

  const body = (await request.json().catch(() => ({}))) as {
    amount?: number;
    addons?: AddonKey[];
    draft?: OnboardingDraft;
  };

  const draft = body.draft;
  const addons = body.addons?.length ? body.addons : (draft?.purchasedAddons ?? []);
  const amount = calculatePackageTotal(addons);

  try {
    const order = await createEftOrder(
      {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
      amount,
      addons,
      draft,
    );

    return NextResponse.json({
      orderId: order.id,
      status: order.status,
      redirectUrl: `/payment/eft/${order.id}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "EFT siparişi oluşturulamadı";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
