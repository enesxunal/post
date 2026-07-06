import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin/auth";
import { listPendingEftOrders } from "@/lib/orders/service";

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  try {
    const orders = await listPendingEftOrders();
    return NextResponse.json({ orders });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Liste alınamadı";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
