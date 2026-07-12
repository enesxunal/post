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
| `Connection terminated due to connection timeout` | Çok satırlı migration tek seferde çalıştırılmış — aşağıdaki **Parçalı migration** bölümüne bak |

## Parçalı migration (timeout olursa)

`20260707_performance_indexes_storage.sql` dosyasını **tek parça çalıştırma**.

Sırayla:

### 1) Index'ler

SQL Editor → **New query** → `migrations/20260707_performance_indexes.sql` içeriğini yapıştır → **Run**.

Hâlâ timeout alırsan dosyadaki **her `create index` satırını tek tek** ayrı sorgu olarak çalıştır.

### 2) Storage bucket

**Kolay yol (önerilen):** Supabase → **Storage** → **New bucket** → isim: `generated-images` → **Public bucket** açık → Create.

**SQL yolu:** `migrations/20260707_storage_bucket.sql` dosyasında önce sadece `insert into storage.buckets...` kısmını Run et.

### 3) Storage izni (policy)

Aynı dosyada `drop policy` + `create policy` kısmını **ayrı** sorgu olarak Run et.

Index'ler olmadan da site çalışır; sadece panel biraz yavaş kalır. Storage bucket olmadan yeni görseller yine veritabanına kaydedilir (eski yöntem).

## Trend Brain tabloları

Admin panelde **Trend Brain** hata veriyorsa (`relation "trend_brain_runs" does not exist`):

1. Supabase → **SQL Editor** → **New query**
2. `supabase/migrations/20260710_trend_brain.sql` dosyasının tamamını yapıştır
3. **Run**
4. Admin → Trend Brain sayfasını yenile

Gerekli tablolar: `trend_brain_runs`, `trend_brain_suggestions`, `performance_aggregates`, `revision_feedback`, `prompt_versions`

## `draft` enum hatası (unsafe use of new value)

`alter type ... add value 'draft'` ile `update ... set status = 'draft'` **aynı sorguda çalışmaz**.

**Adım 1** — yeni sorgu, sadece:

```sql
alter type generation_status add value if not exists 'draft';
```

Run → Success.

**Adım 2** — yeni sorgu, sadece:

```sql
update generation_jobs
set status = 'draft'
where status = 'queued' and image_url is null;
```

Run → Success.

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
