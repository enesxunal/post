import { NextResponse } from "next/server";

import { requireAdminUser } from "@/lib/admin/auth";
import { listPendingEftOrders } from "@/lib/orders/service";

export async function GET() {
  await requireAdminUser();

  try {
    const orders = await listPendingEftOrders();
    return NextResponse.json({ orders });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Liste alınamadı";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
