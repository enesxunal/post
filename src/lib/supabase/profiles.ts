import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ProfileInput = {
  id: string;
  email: string;
  fullName?: string;
};

export async function ensureUserProfile(user: ProfileInput) {
  const admin = createSupabaseAdminClient();
  const supabase = admin ?? (await createSupabaseServerClient());

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) {
    return;
  }

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email,
      full_name: user.fullName?.trim() || null,
    },
    { onConflict: "id" },
  );

  if (error) {
    throw new Error(`Profil oluşturulamadı: ${error.message}`);
  }
}
