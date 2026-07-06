import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureUserProfile } from "@/lib/supabase/profiles";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/dashboard";
  const origin = url.origin;

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user?.email) {
      const metadata = data.user.user_metadata ?? {};
      const fullName =
        (typeof metadata.full_name === "string" && metadata.full_name) ||
        [
          typeof metadata.first_name === "string" ? metadata.first_name : "",
          typeof metadata.last_name === "string" ? metadata.last_name : "",
        ]
          .join(" ")
          .trim();

      await ensureUserProfile({
        id: data.user.id,
        email: data.user.email,
        fullName: fullName || undefined,
      });
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
