import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/supabase/auth";

function authRedirect(next: string): never {
  redirect(`/login?next=${encodeURIComponent(next)}`);
}

export async function requireAdminUser(next = "/admin/orders") {
  const user = await getSessionUser();
  if (!user) {
    authRedirect(next);
  }

  const adminEmails =
    process.env.ADMIN_EMAILS?.split(",").map((email) => email.trim().toLowerCase()) ??
    [];

  if (adminEmails.includes(user.email.toLowerCase())) {
    return user;
  }

  const supabase = await createSupabaseServerClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role === "admin") {
    return user;
  }

  authRedirect(next);
}
