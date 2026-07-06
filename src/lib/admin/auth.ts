import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSessionUser, type SessionUser } from "@/lib/supabase/auth";

function authRedirect(next: string): never {
  redirect(`/login?next=${encodeURIComponent(next)}`);
}

async function isAdminUser(user: SessionUser) {
  const adminEmails =
    process.env.ADMIN_EMAILS?.split(",").map((email) => email.trim().toLowerCase()) ?? [];

  if (adminEmails.includes(user.email.toLowerCase())) {
    return true;
  }

  const supabase = await createSupabaseServerClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return profile?.role === "admin";
}

export async function getAdminSession(): Promise<SessionUser | null> {
  const user = await getSessionUser();
  if (!user) return null;
  return (await isAdminUser(user)) ? user : null;
}

export async function requireAdminUser(next = "/admin/orders") {
  const user = await getSessionUser();
  if (!user) {
    authRedirect(next);
  }

  if (!(await isAdminUser(user))) {
    authRedirect(next);
  }

  return user;
}
