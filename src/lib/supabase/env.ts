/** Supabase URL ve anon key — Vercel entegrasyonundaki farklı isimleri de kabul eder. */
export function getSupabaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim() ||
    ""
  );
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

export function isSupabaseConfigured() {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

export const SUPABASE_SETUP_HINT =
  "Localhost'ta test ediyorsan proje klasörüne .env.local dosyası oluşturup NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY değerlerini Supabase panelinden yapıştır. Sonra sunucuyu yeniden başlat (npm run dev). Vercel'de ise env ekledikten sonra yeniden deploy gerekir.";
