/** Supabase URL ve API key — yeni (publishable/secret) ve eski (anon/service_role) isimleri destekler. */

function extractProjectRefFromUrl(url: string) {
  const match = url.match(/https?:\/\/([a-z0-9-]+)\.supabase\.co/i);
  return match?.[1] ?? "";
}

function getProjectRef() {
  const explicit =
    process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID?.trim() ||
    process.env.SUPABASE_PROJECT_ID?.trim() ||
    "";

  if (explicit) return explicit;

  const fromUrl =
    extractProjectRefFromUrl(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "") ||
    extractProjectRefFromUrl(process.env.SUPABASE_URL?.trim() ?? "");

  return fromUrl;
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

export function getSupabaseEnvDebug() {
  return {
    configured: isSupabaseConfigured(),
    url: getSupabaseUrl() || null,
    projectRef: getProjectRef() || null,
    hasPublishableKey: Boolean(getSupabaseAnonKey()),
    hasSecretKey: Boolean(getSupabaseServiceRoleKey()),
  };
}

export const SUPABASE_SETUP_HINT =
  "Vercel'de NEXT_PUBLIC_SUPABASE_PROJECT_ID=jpavgsimjqbkukwevnl yaz (URL gerekmez). Publishable key → NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Secret → SUPABASE_SECRET_KEY. Sonra redeploy.";
