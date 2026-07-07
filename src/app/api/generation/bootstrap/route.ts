import { NextResponse } from "next/server";

import { getProjectStatus } from "@/lib/generation/project-service";
import {
  getLatestPaidOrderNeedingProject,
  provisionProjectForOrder,
} from "@/lib/orders/provision-project";
import { getSessionUser } from "@/lib/supabase/auth";

/** Ödeme onaylı ama proje oluşturulmamış hesapları otomatik tamamlar. */
export async function POST() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const pending = await getLatestPaidOrderNeedingProject(user.id);
  if (!pending) {
    return NextResponse.json({ provisioned: false });
  }

  try {
    const result = await provisionProjectForOrder(pending.orderId, user.id);
    const status = await getProjectStatus(result.projectId, user.id);
    return NextResponse.json({
      provisioned: true,
      projectId: result.projectId,
      ...status,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Proje oluşturulamadı";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
