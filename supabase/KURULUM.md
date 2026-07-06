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

## Vercel env (yeni Supabase paneli)

**Project URL** artık API Keys sayfasında yazmıyor olabilir. Şu formülle oluştur:

```text
https://PROJE-KODU.supabase.co
```

Proje kodu = tarayıcı adresindeki kod (örnek: `jpavgsimjqbkukwevnl`)

| Supabase paneli | Vercel env |
|-----------------|------------|
| Publishable key (`sb_publishable_...`) | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` |
| Secret key (`sb_secret_...`) | `SUPABASE_SECRET_KEY` |
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |

Alternatif: sadece `NEXT_PUBLIC_SUPABASE_PROJECT_ID=jpavgsimjqbkukwevnl` yaz, URL otomatik oluşur.

Eski **Legacy anon / service_role** sekmesi varsa onlar da çalışır.
