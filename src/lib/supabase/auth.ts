import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SessionUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
};

function parseUserNames(metadata: Record<string, unknown> | undefined, email: string) {
  const firstName =
    (typeof metadata?.first_name === "string" && metadata.first_name) ||
    (typeof metadata?.given_name === "string" && metadata.given_name) ||
    "";
  const lastName =
    (typeof metadata?.last_name === "string" && metadata.last_name) ||
    (typeof metadata?.family_name === "string" && metadata.family_name) ||
    "";

  if (firstName || lastName) {
    return {
      firstName: firstName || "Üye",
      lastName,
      fullName: `${firstName} ${lastName}`.trim(),
    };
  }

  const fullName =
    (typeof metadata?.full_name === "string" && metadata.full_name) ||
    (typeof metadata?.name === "string" && metadata.name) ||
    "";

  if (fullName) {
    const parts = fullName.trim().split(/\s+/);
    return {
      firstName: parts[0] ?? "Üye",
      lastName: parts.slice(1).join(" "),
      fullName: fullName.trim(),
    };
  }

  const fallback = email.split("@")[0] ?? "Üye";
  return { firstName: fallback, lastName: "", fullName: fallback };
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return null;
  }

  const names = parseUserNames(user.user_metadata, user.email);

  return {
    id: user.id,
    email: user.email,
    ...names,
  };
}

export async function requireSessionUser(next = "/dashboard"): Promise<SessionUser> {
  const user = await getSessionUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  return user;
}
