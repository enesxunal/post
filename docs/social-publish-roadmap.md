# Paylaşım takvimi ve Instagram otomasyonu

## Müşterinin istediği

Meta Business Suite gibi: görsel + açıklama ile **paylaşım takvimine** eklemek veya **Instagram’a otomatik** paylaşım.

## Şu an ne var? (v1 — güvenli)

Takvim paketi alan müşteriler panelde:

1. **Takvime ekle (.ics)** — Google/Apple/Outlook takvimine hatırlatıcı; açıklamada caption + hashtag + adımlar
2. **Google Takvim** — tek tıkla web takvimine ekleme
3. **Paylaşım paketi** — caption kopyala + görsel indir + Meta/Instagram manuel paylaşım rehberi

Bu, Meta’nın iç takvimine doğrudan yazmaz ama **aynı işi güvenli şekilde** hatırlatır; Meta API onayı gerektirmez.

## Neden otomatik Instagram şimdi yok?

| Yol | Zorluk | Güvenlik / risk |
|-----|--------|------------------|
| ICS + manuel paylaşım | Kolay | Düşük — token yok |
| Meta Business Suite API | Çok zor | Meta app review, business doğrulama, token yenileme |
| Instagram Graph API otomatik post | Zor | İşletme hesabı, Facebook Page bağlantısı, izinler |

Otomatik paylaşım için gerekenler:

- Meta Developer uygulaması
- `instagram_content_publish`, `pages_manage_posts` izinleri
- Müşterinin Instagram Business + Facebook Sayfa bağlantısı
- Meta **App Review** (genelde haftalar)
- Token güvenliği (şifreli saklama, iptal akışı)

## Önerilen yol haritası

### Faz 1 (şimdi) ✅
ICS + Google Takvim + paylaşım sayfası (`/paylasim/[jobId]`) — tıklayınca görsel indir + metin kopyala

### Faz 2
Meta Business Suite’e **yönlendirme linki** + hazır caption (hâlâ manuel onay)

### Faz 3
“Instagram hesabını bağla” — OAuth ile sadece **zamanlanmış hatırlatma + taslak**, otomatik publish kapalı

### Faz 4
Onaylı Meta app ile **gerçek otomatik yayın** (seçili müşteri pilot)

Önce Faz 1 ile müşteri değeri verilir; Faz 4 ancak Meta onayı sonrası.
