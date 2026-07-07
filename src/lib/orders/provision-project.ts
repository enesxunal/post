import type { OnboardingDraft } from "@/lib/onboarding/draft";
import {
  createProjectWithJobs,
} from "@/lib/generation/project-service";
import { findProjectIdByOrderId } from "@/lib/generation/queue-processor";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AddonKey } from "@/types/domain";

async function getClient() {
  return createSupabaseAdminClient() ?? (await createSupabaseServerClient());
}

type OrderRow = {
  id: string;
  user_id: string;
  status: string;
  onboarding_draft: OnboardingDraft | null;
  addons: AddonKey[] | null;
  profiles?: { email: string; full_name: string | null } | null;
};

function normalizeDraft(
  raw: unknown,
  addons: AddonKey[] | null,
): OnboardingDraft | null {
  if (!raw || typeof raw !== "object") return null;
  const draft = raw as OnboardingDraft;
  if (!draft.brandName || !draft.selectedDays?.length) return null;

  return {
    ...draft,
    purchasedAddons: draft.purchasedAddons?.length
      ? draft.purchasedAddons
      : (addons ?? []),
  };
}

export async function getOrderWithDraft(orderId: string, userId: string) {
  const supabase = await getClient();

  const { data } = await supabase
    .from("orders")
    .select("id, user_id, status, onboarding_draft, addons")
    .eq("id", orderId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) return null;

  const row = data as OrderRow;
  const draft = normalizeDraft(row.onboarding_draft, row.addons);

  return { ...row, draft };
}

export async function getLatestPaidOrderNeedingProject(userId: string) {
  const supabase = await getClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("id, user_id, status, onboarding_draft, addons, created_at")
    .eq("user_id", userId)
    .eq("status", "paid")
    .order("created_at", { ascending: false });

  if (!orders?.length) return null;

  for (const order of orders as OrderRow[]) {
    const existing = await findProjectIdByOrderId(userId, order.id);
    if (existing?.id) continue;

    const draft = normalizeDraft(order.onboarding_draft, order.addons);
    if (!draft) continue;

    return { orderId: order.id, draft };
  }

  return null;
}

export async function provisionProjectForOrder(orderId: string, userId: string) {
  const existing = await findProjectIdByOrderId(userId, orderId);
  if (existing?.id) {
    return { projectId: existing.id, created: false };
  }

  const supabase = await getClient();
  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, user_id, status, onboarding_draft, addons, profiles(email, full_name)",
    )
    .eq("id", orderId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!order) {
    throw new Error("Sipariş bulunamadı");
  }

  const row = order as {
    id: string;
    user_id: string;
    status: string;
    onboarding_draft: unknown;
    addons: AddonKey[] | null;
    profiles?: { email: string; full_name: string | null } | { email: string; full_name: string | null }[] | null;
  };
  if (row.status !== "paid") {
    throw new Error("Sipariş henüz ödenmedi");
  }

  const draft = normalizeDraft(row.onboarding_draft, row.addons);
  if (!draft) {
    throw new Error("Siparişte marka bilgisi yok. Onboarding formunu tekrar doldurun.");
  }

  const profileRow = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
  const created = await createProjectWithJobs(
    {
      id: userId,
      email: profileRow?.email ?? "",
      fullName: profileRow?.full_name ?? undefined,
    },
    { ...draft, orderId },
    orderId,
  );

  await supabase
    .from("orders")
    .update({ project_id: created.projectId, updated_at: new Date().toISOString() })
    .eq("id", orderId);

  return { projectId: created.projectId, created: true, totalJobs: created.totalJobs };
}

export async function provisionProjectAfterEftApproval(orderId: string) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;

  const { data: order } = await supabase
    .from("orders")
    .select("id, user_id, status, onboarding_draft, addons")
    .eq("id", orderId)
    .maybeSingle();

  if (!order || order.status !== "paid") return null;

  try {
    return await provisionProjectForOrder(orderId, order.user_id as string);
  } catch (error) {
    console.error("EFT onayı sonrası proje oluşturulamadı:", error);
    return null;
  }
}
