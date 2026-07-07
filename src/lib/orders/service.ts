import type { OnboardingDraft } from "@/lib/onboarding/draft";
import { provisionProjectAfterEftApproval } from "@/lib/orders/provision-project";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureUserProfile } from "@/lib/supabase/profiles";

type OrderUser = {
  id: string;
  email: string;
  fullName?: string;
};

async function getClient() {
  return createSupabaseAdminClient() ?? (await createSupabaseServerClient());
}

export async function createEftOrder(
  user: OrderUser,
  amount: number,
  addons: string[] = [],
  onboardingDraft?: OnboardingDraft,
) {
  await ensureUserProfile(user);
  const supabase = await getClient();

  const { data, error } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      amount_total: amount,
      currency: "TRY",
      status: "pending",
      payment_provider: "eft",
      addons,
      onboarding_draft: onboardingDraft ?? null,
    })
    .select("id, status, amount_total, created_at")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "EFT siparişi oluşturulamadı");
  }

  return data;
}

export async function createToslaOrder(
  user: OrderUser,
  amount: number,
  externalOrderId: string,
  addons: string[] = [],
  onboardingDraft?: OnboardingDraft,
) {
  await ensureUserProfile(user);
  const supabase = await getClient();

  const { data, error } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      amount_total: amount,
      currency: "TRY",
      status: "pending",
      payment_provider: "tosla",
      provider_payment_id: externalOrderId,
      addons,
      onboarding_draft: onboardingDraft ?? null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Tosla order insert failed:", error.message);
    return null;
  }

  return data;
}

export async function markOrderPaid(orderId: string, provider = "tosla") {
  const supabase = createSupabaseAdminClient() ?? (await createSupabaseServerClient());

  const { data } = await supabase
    .from("orders")
    .update({ status: "paid", updated_at: new Date().toISOString() })
    .eq("provider_payment_id", orderId)
    .eq("payment_provider", provider)
    .select("id")
    .maybeSingle();

  if (data) return data;

  const { data: byId } = await supabase
    .from("orders")
    .update({ status: "paid", updated_at: new Date().toISOString() })
    .eq("id", orderId)
    .select("id")
    .maybeSingle();

  return byId;
}

export async function getOrderForUser(orderId: string, userId: string) {
  const supabase = await getClient();

  const { data } = await supabase
    .from("orders")
    .select("id, status, amount_total, payment_provider, created_at, user_id")
    .eq("id", orderId)
    .eq("user_id", userId)
    .maybeSingle();

  return data;
}

export async function listPendingEftOrders() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    throw new Error("Admin işlemi için SUPABASE_SECRET_KEY gerekli");
  }

  const { data, error } = await supabase
    .from("orders")
    .select("id, status, amount_total, created_at, user_id, profiles(email, full_name)")
    .eq("payment_provider", "eft")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function approveEftOrder(orderId: string) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    throw new Error("Admin işlemi için SUPABASE_SECRET_KEY gerekli");
  }

  const { data, error } = await supabase
    .from("orders")
    .update({ status: "paid", updated_at: new Date().toISOString() })
    .eq("id", orderId)
    .eq("payment_provider", "eft")
    .eq("status", "pending")
    .select("id, status, user_id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Sipariş bulunamadı veya zaten onaylanmış");
  }

  await provisionProjectAfterEftApproval(orderId);

  return data;
}

export async function userHasPaidOrder(userId: string) {
  const supabase = await getClient();

  const { data } = await supabase
    .from("orders")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "paid")
    .limit(1)
    .maybeSingle();

  return Boolean(data);
}

export async function isOrderPaid(orderId: string, userId: string) {
  const order = await getOrderForUser(orderId, userId);
  return order?.status === "paid";
}
