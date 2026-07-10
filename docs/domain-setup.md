# poust.app domain kurulumu

Canlı site: **https://www.poust.app**

Kod tarafında `poust.app` → `www.poust.app` yönlendirmesi ve SEO kanonik adresi ayarlandı. Aşağıdaki panel adımlarını da tamamlayın.

---

## 1. Vercel — ortam değişkenleri

Vercel → proje → **Settings** → **Environment Variables**

| Değişken | Değer (Production) |
|----------|-------------------|
| `NEXT_PUBLIC_APP_URL` | `https://www.poust.app` |
| `NEXT_PUBLIC_APP_DOMAIN` | `poust.app` |
| `NEXT_PUBLIC_APP_NAME` | `poust` |

Kaydettikten sonra **Redeploy** yapın (Deployments → son deploy → Redeploy).

Ödeme (Tosla) kullanıyorsanız:

| Değişken | Değer |
|----------|--------|
| `TOSLA_CALLBACK_URL` | `https://www.poust.app/api/payments/tosla/callback` |

---

## 2. Vercel — domain

**Settings** → **Domains** içinde şunlar olmalı:

- `www.poust.app` (birincil)
- `poust.app` (apex — otomatik www'ye yönlendirilir)

DNS'te genelde:
- `www` → CNAME → `cname.vercel-dns.com`
- `@` (kök) → A veya Vercel'in verdiği kayıt

---

## 3. Supabase — giriş / OAuth

Supabase → **Authentication** → **URL Configuration**

| Alan | Değer |
|------|--------|
| Site URL | `https://www.poust.app` (**localhost yazmayın**) |
| Redirect URLs | `https://www.poust.app/auth/callback` |
| | `https://poust.app/auth/callback` (yedek) |
| | `http://localhost:3000/auth/callback` (sadece yerel geliştirme) |

> **Önemli:** Site URL `localhost` kalırsa canlı siteden Google girişi sizi `localhost:3000/?code=...` adresine atar. Canlıda mutlaka `https://www.poust.app` olmalı.

Google ile giriş: Google Cloud → **Authorized redirect URIs** listesinde Supabase callback olmalı:
`https://jpavgsimjqbkukwevnl.supabase.co/auth/v1/callback`  
(poust uygulama callback’i `https://www.poust.app/auth/callback` — bunu Supabase Redirect URLs’e ekleyin, Google’a değil)

---

## 4. Kontrol listesi (canlı test)

- [ ] https://www.poust.app açılıyor
- [ ] https://poust.app adresi www'ye yönleniyor
- [ ] Giriş yap / Google ile giriş çalışıyor
- [ ] `/blog` ve `/sitemap.xml` açılıyor
- [ ] Ödeme sonrası dönüş URL'leri doğru (Tosla / EFT)

---

## 5. SEO

Otomatik üretilen dosyalar:

- `https://www.poust.app/sitemap.xml`
- `https://www.poust.app/robots.txt`

Google Search Console'a `https://www.poust.app` mülkünü ekleyin:

1. Doğrulama: HTML dosyası `google7973783f09363249.html` (zaten `public/` içinde)
2. Sitemap gönderin: `https://www.poust.app/sitemap.xml`
3. Google OAuth doğrulaması için Search Console hesabı, Cloud Console ile **aynı Gmail** olmalı — ayrıntılar: `docs/google-oauth-branding.md`
