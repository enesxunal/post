import { NextResponse } from "next/server";

import { getProjectStatus } from "@/lib/generation/project-service";
import {
  getLatestPaidOrderNeedingProject,
  provisionProjectForOrder,
} from "@/lib/orders/provision-project";
import type { OnboardingDraft } from "@/lib/onboarding/draft";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/supabase/auth";

/** Ödenmiş ama kurulmamış siparişe onboarding bilgisini ekler (yeniden ödeme gerekmez). */
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const draft = (await request.json()) as OnboardingDraft;
  if (!draft.brandName || !draft.selectedDays?.length) {
    return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 });
  }

  const pending = await getLatestPaidOrderNeedingProject(user.id);
  if (!pending) {
    return NextResponse.json(
      { error: "Tamamlanacak ödenmiş sipariş bulunamadı." },
      { status: 404 },
    );
  }

  const supabase = createSupabaseAdminClient() ?? (await createSupabaseServerClient());
  await supabase
    .from("orders")
    .update({
      onboarding_draft: draft,
      addons: draft.purchasedAddons ?? [],
      updated_at: new Date().toISOString(),
    })
    .eq("id", pending.orderId)
    .eq("user_id", user.id);

  try {
    const result = await provisionProjectForOrder(pending.orderId, user.id);
    const status = await getProjectStatus(result.projectId, user.id);
    return NextResponse.json({
      orderId: pending.orderId,
      projectId: result.projectId,
      redirectUrl: `/orders/${pending.orderId}/basla`,
      ...status,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Kurulum tamamlanamadı";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
