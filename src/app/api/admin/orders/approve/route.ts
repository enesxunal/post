import { NextResponse } from "next/server";

import { requireAdminUser } from "@/lib/admin/auth";
import { approveEftOrder } from "@/lib/orders/service";

export async function POST(request: Request) {
  await requireAdminUser();

  const body = (await request.json()) as { orderId?: string };

  if (!body.orderId) {
    return NextResponse.json({ error: "orderId gerekli" }, { status: 400 });
  }

  try {
    const order = await approveEftOrder(body.orderId);
    return NextResponse.json({
      success: true,
      orderId: order.id,
      status: order.status,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Onay başarısız";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
