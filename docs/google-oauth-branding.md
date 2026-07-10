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
| App logo | **`public/poust-oauth-logo.png`** (512×512 kare, “poust” yazılı) |
| App home page | `https://www.poust.app` |
| Privacy policy | `https://www.poust.app/gizlilik` |
| Terms of service | `https://www.poust.app/kullanim-sartlari` |

> **Logo uyarısı:** Yatay `poust-logo.png` kullanmayın. Google kare, en az 120×120 px ve markayı net ayırt eden görsel ister. Projede bunun için `public/poust-oauth-logo.png` hazırlandı.

Kaydet. Birkaç dakika–saat içinde giriş ekranının üst kısmı “Poust” olarak güncellenir.

---

## 1b. Doğrulama hatalarını çözme (Verification Center)

Google şu iki hatayı verdiyse aşağıdaki sırayı **aynı Gmail hesabıyla** uygulayın (Cloud Console ile Search Console hesabı **aynı** olmalı).

### Hata: “Ana sayfa size kayıtlı değil”

1. [Google Search Console](https://search.google.com/search-console) açın.
2. **Mülk ekle** → **URL öneki** → `https://www.poust.app`
3. Doğrulama yöntemi: **HTML dosyası** → `google7973783f09363249.html`  
   (Bu dosya sitede yayında: `https://www.poust.app/google7973783f09363249.html`)
4. **Doğrula** deyin; mülk “Doğrulandı” olmalı.
5. İsteğe bağlı ama önerilir: ikinci mülk olarak **Alan adı** `poust.app` ekleyin (DNS TXT kaydı ile doğrulama).
6. Google Cloud → **Google Auth Platform** → **Branding** → ana sayfa satırında **Sahipliği doğrula** / **Verify** butonuna basın (Search Console bağlantısı isteyecek).
7. **Audience** → **Verification Center** → tekrar **Verify** / **Submit for verification**.

### Hata: “Logo markanızı benzersiz tanıtmıyor”

1. Yeni deploy sonrası bilgisayarınızdan `public/poust-oauth-logo.png` dosyasını Google Branding’e yükleyin (512×512, ikon + “poust” yazısı).
2. Başka markanın logosuna benzeyen, sadece harf “P” veya jenerik ikon **kullanmayın**.
3. Kaydedip Verification Center’dan yeniden gönderin.

### Kontrol listesi

- [ ] Search Console’da `https://www.poust.app` doğrulandı
- [ ] Cloud Console ve Search Console **aynı Google hesabı**
- [ ] Branding’de logo = `poust-oauth-logo.png`
- [ ] Ana sayfa = `https://www.poust.app` (sonunda `/` fark etmez)
- [ ] Gizlilik ve kullanım şartları linkleri sitede açılıyor

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
