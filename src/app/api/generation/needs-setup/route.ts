import { NextResponse } from "next/server";

import { findProjectIdByOrderId } from "@/lib/generation/queue-processor";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/supabase/auth";

async function getClient() {
  return createSupabaseAdminClient() ?? (await createSupabaseServerClient());
}

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const supabase = await getClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "paid")
    .order("created_at", { ascending: false });

  for (const order of orders ?? []) {
    const existing = await findProjectIdByOrderId(user.id, order.id);
    if (!existing?.id) {
      return NextResponse.json({ needsSetup: true, orderId: order.id });
    }
  }

  return NextResponse.json({ needsSetup: false });
}
