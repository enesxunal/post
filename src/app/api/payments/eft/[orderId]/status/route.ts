import { NextResponse } from "next/server";

import { getOrderForUser } from "@/lib/orders/service";
import { requireSessionUser } from "@/lib/supabase/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const user = await requireSessionUser("/login");
  const { orderId } = await params;

  const order = await getOrderForUser(orderId, user.id);

  if (!order) {
    return NextResponse.json({ error: "Sipariş bulunamadı" }, { status: 404 });
  }

  return NextResponse.json({
    orderId: order.id,
    status: order.status,
    amount: order.amount_total,
    paid: order.status === "paid",
    generatingUrl:
      order.status === "paid" ? `/orders/${order.id}/basla` : null,
  });
}
