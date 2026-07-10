# Müşteri kayıt onay e-postası (kurumsal)

Müşteri **normal e-posta + şifre** ile üye olduğunda Supabase otomatik **onay maili** gönderir.  
Varsayılan gönderen: `noreply@mail.app.supabase.io` gibi bir adres — kurumsal görünmez.

Bunu **`noreply@poust.app`** veya **`destek@poust.app`** üzerinden göndermek için Supabase panelinde 2 ayar yapılır:

1. **SMTP** (kimden gideceği)
2. **E-posta şablonu** (mailin Türkçe metni)

Kod tarafında ekstra bir şey yok; hepsi Supabase Dashboard'dan yapılır.

---

## Adım 1 — E-posta kutusu açın

Domain sağlayıcınızda veya hosting panelinde bir mailbox oluşturun:

- Önerilen: `noreply@poust.app` (sadece gönderim)
- Alternatif: `destek@poust.app`

Bu kutunun **SMTP bilgilerini** not edin (sunucu, port, kullanıcı, şifre).  
cPanel, Turhost, Natro, Google Workspace vb. hepsinde "E-posta hesapları" bölümünde bulunur.

**SMTP bilgisi yoksa** [Resend](https://resend.com) gibi bir servis de kullanılabilir — `poust.app` domainini doğrulayıp `noreply@poust.app` gönderir.

---

## Adım 2 — Supabase SMTP

1. [Supabase Dashboard](https://supabase.com/dashboard) → projeniz  
2. **Project Settings** (sol alttaki dişli)  
3. **Authentication** → **SMTP Settings**  
4. **Enable Custom SMTP** açın  
5. Alanları doldurun:

| Alan | Örnek |
|------|--------|
| Sender email | `noreply@poust.app` |
| Sender name | `poust` |
| Host | Hosting'in verdiği (ör. `mail.poust.app`) |
| Port | `587` |
| Username | `noreply@poust.app` |
| Password | Mailbox şifresi |

6. **Save** → mümkünse test maili gönderin

Bundan sonra onay mailleri **sizin domaininizden** gider.

---

## Adım 3 — Onay maili şablonu (hazır HTML)

Hazır şablon dosyası: **`docs/email-templates/confirm-signup.html`**

1. Supabase → **Authentication** → **Email Templates**  
2. **Confirm signup** şablonunu seçin  
3. **Subject (konu):** `poust hesabınızı doğrulayın`  
4. **Body:** `confirm-signup.html` dosyasının **tüm içeriğini** kopyalayıp yapıştırın  
5. **`{{ .ConfirmationURL }}` satırlarını silmeyin** — onay linki budur  
6. **Save**

SMTP olmadan da şablon kaydedilir; mail yine Supabase üzerinden gider, sadece tasarım sizin olur.

---

## Adım 4 — E-posta onayı açık mı?

Supabase → **Authentication** → **Providers** → **Email** → **Confirm email** **açık** olmalı.

---

## Adım 5 — Redirect adresleri

**Authentication** → **URL Configuration**

| Alan | Değer |
|------|--------|
| Site URL | `https://www.poust.app` |
| Redirect URLs | `https://www.poust.app/auth/callback` |

Onay linkine tıklayınca müşteri bu adrese döner.

---

## Kontrol listesi

- [ ] `noreply@poust.app` mailbox veya Resend  
- [ ] Supabase SMTP kayıtlı  
- [ ] Confirm signup şablonu Türkçe  
- [ ] Confirm email açık  
- [ ] Site URL doğru  

---

## Notlar

**Google ile kayıt** → Onay maili gitmez (Google zaten doğrulamış sayılır).  
Sadece **e-posta + şifre** kaydında bu mail gider.

**Mail gelmiyor** → Supabase Logs → Auth; SMTP şifre/port kontrol edin.

**Spam** → DNS'e SPF ve DKIM ekleyin (hosting panelinden).
