# Supabase veritabanı kurulumu

## Adım 1 — Tabloları oluştur

1. [Supabase Dashboard](https://supabase.com/dashboard) → projeni aç
2. Sol menüden **SQL Editor**
3. **New query**
4. Bu projedeki `supabase/schema.sql` dosyasının **tamamını** kopyala yapıştır
5. **Run** (veya Ctrl+Enter)

Başarılı olunca **Table Editor**'da şunları görmelisin:
- profiles
- projects
- generation_jobs
- orders
- special_days
- …

## Adım 2 — Örnek veri (isteğe bağlı)

Aynı şekilde `supabase/seed.sql` dosyasını çalıştırabilirsin.

## Sık hata

| Hata | Sebep |
|------|--------|
| `relation "projects" does not exist` | Sadece policy SQL'i çalıştırılmış; önce `schema.sql` gerekli |
| `type "app_role" already exists` | Şema zaten kurulu; sorun değil, devam edebilirsin |

## Vercel env

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (Settings → API → service_role)
