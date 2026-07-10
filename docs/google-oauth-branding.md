# Google giriş ekranı ve e-posta markası

## Neden “jpavgsimjqbkuikwevnl.supabase.co” yazıyor?

Google girişte alttaki “… uygulamasına devam edin” metni, OAuth’un döndüğü **alan adını** gösterir. Şu an giriş Supabase üzerinden geçtiği için `supabase.co` görünür.

**Üstteki uygulama adını** Google Console’dan değiştirirsin; **alttaki domain** için ise ya Supabase Custom Auth Domain ya da ileride kendi auth altyapın gerekir.

---

## 1. Google Cloud — Marka (hemen yap)

**Google Auth Platform → Branding**

| Alan | Değer |
|------|--------|
| App name | `poust` veya `Poust` |
| User support email | `destek@poust.app` |
| App logo | `public/poust-logo.png` (kare, min 120px) |
| App home page | `https://www.poust.app` |
| Privacy policy | `https://www.poust.app/gizlilik` |
| Terms of service | `https://www.poust.app/kullanim-sartlari` |

Kaydet. Birkaç dakika–saat içinde giriş ekranının üst kısmı “Poust” olarak güncellenir.

---

## 2. Test modu

**Audience → Test users** listesine kendi Gmail’ini ekle. Uygulama “Testing” modundayken sadece bu mailler giriş yapabilir.

Herkesin girişi için ileride **Verification** (doğrulama) gerekir.

---

## 3. Supabase — e-posta şablonları (Türkçe)

Supabase → **Authentication** → **Email Templates**

### Confirm signup (Kayıt onayı)

**Subject:** `poust hesabınızı doğrulayın`

**Body (örnek):**
```
Merhaba,

poust'a hoş geldiniz. Hesabınızı aktifleştirmek için aşağıdaki bağlantıya tıklayın:

{{ .ConfirmationURL }}

Bu işlemi siz yapmadıysanız bu e-postayı yok sayabilirsiniz.

— poust ekibi
destek@poust.app
```

### Magic Link / Reset password

Benzer şekilde Türkçeleştir; `{{ .ConfirmationURL }}` veya `{{ .Token }}` alanlarını silme.

### SMTP (isteğe bağlı, daha profesyonel)

Supabase → Project Settings → Auth → **SMTP Settings**

Kendi mail sunucun veya Resend/SendGrid ile `noreply@poust.app` gönderen adresi ayarlanabilir.

---

## 4. Alttaki supabase.co yazısını tamamen kaldırmak (ileri seviye)

Supabase **Custom Domain** (ücretli plan): örn. `auth.poust.app`

Bu ayarlandığında Google ekranında `auth.poust.app` görünür. Şimdilik zorunlu değil; üstte “Poust” yazması çoğu kullanıcı için yeterli.
