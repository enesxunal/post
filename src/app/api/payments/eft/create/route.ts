import { NextResponse } from "next/server";

import { createEftOrder } from "@/lib/orders/service";
import { requireSessionUser } from "@/lib/supabase/auth";
import { BASE_PACKAGE_PRICE } from "@/lib/config";

export async function POST(request: Request) {
  const user = await requireSessionUser("/login");

  const body = (await request.json().catch(() => ({}))) as {
    amount?: number;
    addons?: string[];
  };

  try {
    const order = await createEftOrder(
      {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
      body.amount ?? BASE_PACKAGE_PRICE,
      body.addons ?? [],
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
