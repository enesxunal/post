/** Supabase URL ve API key — yeni (publishable/secret) ve eski (anon/service_role) isimleri destekler. */

function getProjectRef() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID?.trim() ||
    process.env.SUPABASE_PROJECT_ID?.trim() ||
    ""
  );
}

export function getSupabaseUrl() {
  const explicit =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim() ||
    "";

  if (explicit) return explicit;

  const projectRef = getProjectRef();
  if (projectRef) {
    return `https://${projectRef}.supabase.co`;
  }

  return "";
}

export function getSupabaseAnonKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.SUPABASE_ANON_KEY?.trim() ||
    process.env.SUPABASE_PUBLISHABLE_KEY?.trim() ||
    ""
  );
}

export function getSupabaseServiceRoleKey() {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    ""
  );
}

export function isSupabaseConfigured() {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

export const SUPABASE_SETUP_HINT =
  "Supabase: Project URL = https://PROJE-ID.supabase.co (adres çubuğundaki proje kodu). Publishable key → NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Secret key → SUPABASE_SECRET_KEY. Sonra redeploy.";
