import { APP_NAME } from "@/lib/config";
import type { BlogPost } from "@/lib/blog/types";
import { DAY_SEO_SEEDS, SECTOR_SEO_SEEDS, type DaySeoSeed, type SectorSeoSeed } from "@/lib/blog/seo-seeds";

/** Anasayfa vitrin görselleri → ilgili blog konuları */
const TOPIC_COVER_IMAGES: Record<string, string> = {
  "friday-blessing": "/marketing/showcase-hayirli-cumalar.jpg",
  "29-ekim": "/marketing/showcase-29-ekim.jpg",
  "ramadan-feast": "/marketing/showcase-ramazan-bayrami.jpg",
  "mothers-day": "/marketing/showcase-anneler-gunu.jpg",
  "regaib-kandili": "/marketing/showcase-kandil.jpg",
  "mirac-kandili": "/marketing/showcase-kandil.jpg",
  "berat-kandili": "/marketing/showcase-kandil.jpg",
  "mevlid-kandili": "/marketing/showcase-kandil.jpg",
  "kadir-gecesi": "/marketing/showcase-kandil.jpg",
};

function coverForTopic(topicId: string) {
  return TOPIC_COVER_IMAGES[topicId];
}

function slugify(input: string) {
  return input
    .toLocaleLowerCase("tr")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function publishedAtFor(index: number) {
  const base = new Date("2026-01-05T09:00:00.000Z");
  base.setDate(base.getDate() + index * 2);
  return base.toISOString().slice(0, 10);
}

function buildDayGuide(seed: DaySeoSeed, index: number): BlogPost {
  const primary = seed.searchTerms[0]!;
  const title = `${seed.longTails[0]} (2026)`;
  const slug = slugify(`${primary}-rehberi-${seed.dayId}`);

  return {
    slug,
    title,
    description: `${seed.label} için ${primary} arayan işletmelere örnek mesajlar, görsel fikirleri ve hazır Instagram post önerileri. ${APP_NAME} ile dakikalar içinde markanıza özel tasarım.`,
    keywords: [...seed.searchTerms, `${seed.label} postu`, `${seed.label} işletme mesajı`, "özel gün postu", "instagram kutlama"],
    primaryKeyword: primary,
    category: "ozel-gun",
    categoryLabel: "Özel gün yazıları",
    topicId: seed.dayId,
    topicLabel: seed.label,
    publishedAt: publishedAtFor(index),
    readingMinutes: 6,
    intro: `"${primary}" diye arıyorsanız yalnız değilsiniz. Her yıl binlerce işletme ${seed.label} için hem duygusal hem profesyonel bir paylaşım arıyor. Bu rehberde arama niyetine uygun mesaj örnekleri, görsel kuralları ve hazır post sürecini anlatıyoruz.`,
    sections: [
      {
        heading: `"${primary}" arayanlar ne istiyor?`,
        body: [
          `Google ve Instagram’da "${primary}" araması genelde üç ihtiyacı gösterir: hızlı örnek metin, görsel şablon ve markaya özel tasarım.`,
          `${seed.label} paylaşımında abartılı vatanseverlik / dini sembol karmaşası veya stok aile fotoğrafı hissi güveni düşürür. Temiz tipografi, marka rengi ve net mesaj daha çok etkileşim alır.`,
          `İşletmeler için doğru yaklaşım: müşteriye saygı, kısa kutlama cümlesi, görünür logo ve paylaşılabilir kare format.`,
        ],
      },
      {
        heading: `${seed.label} için örnek mesajlar`,
        body: [
          `1) "${seed.label} kutlu olsun. ${seed.label} coşkusunu sizinle paylaşmanın mutluluğunu yaşıyoruz."`,
          `2) "Bu anlamlı günde tüm müşterilerimize saygı ve sevgiyle selamlar. ${seed.label} kutlu olsun."`,
          `3) "${primary} arıyorsanız işte kısa ve net bir öneri: Gününüz güzel, işleriniz bereketli olsun."`,
          `Mesajı sektöre göre uyarlayın: kafe ise sıcak bir ton, hukuk bürosu ise daha kurumsal bir dil kullanın.`,
        ],
      },
      {
        heading: "Instagram postu nasıl görünmeli?",
        body: [
          "1080×1080 veya 1080×1350 format tercih edin. İlk 2 saniyede okunan bir ana başlık yeterli.",
          "Alt barda Canva hissi vermeyin: ince çizgi + küçük logo + kısa alt satır daha profesyonel durur.",
          `${seed.searchTerms.slice(0, 2).join(" ve ")} gibi aramalarda insanlar hazır görsel bekler. Bu yüzden stok kalabalığı yerine markanıza özel kompozisyon kullanın.`,
        ],
      },
      {
        heading: `${APP_NAME} ile ${seed.label} postu`,
        body: [
          `${APP_NAME}; logonuzu, marka renklerinizi ve sektörünüzü alıp ${seed.label} için hazır Instagram görseli üretir.`,
          "Kartı üretir, beğenmezseniz revize notu yazarsınız, onaylarsınız. İsterseniz caption da hazırlanır.",
          `Özellikle "${primary}" gibi yüksek arama hacimli günlerde zaman kazancı kritik hale gelir.`,
        ],
      },
    ],
    faq: [
      {
        question: `${seed.label} mesajı ne kadar uzun olmalı?`,
        answer: "Görselde 6–12 kelime idealdir. Uzun metin Instagram’da okunmaz; detayı caption’a yazın.",
      },
      {
        question: `"${primary}" için hazır şablon mu kullanmalıyım?`,
        answer: "Hazır şablonlar hızlıdır ama markanız diğer işletmelerle aynı görünür. Logo + renklerinize özel tasarım daha güven verir.",
      },
    ],
    cta: `${seed.label} için markanıza özel postları ${APP_NAME} ile hemen hazırlayın.`,
    coverImage: coverForTopic(seed.dayId),
  };
}

function buildDayIdeas(seed: DaySeoSeed, index: number): BlogPost {
  const primary = seed.searchTerms[1] ?? seed.searchTerms[0]!;
  const slug = slugify(`${seed.dayId}-instagram-fikirleri`);

  return {
    slug,
    title: seed.longTails[1],
    description: `${seed.label} Instagram feed ve story fikirleri. ${primary}, görsel kompozisyon ve yayın takvimi önerileriyle organik erişimi artırın.`,
    keywords: [...seed.searchTerms, `${seed.label} hikaye`, "instagram story", "özel gün içerik takvimi"],
    primaryKeyword: primary,
    category: "ozel-gun",
    categoryLabel: "Özel gün yazıları",
    topicId: seed.dayId,
    topicLabel: seed.label,
    publishedAt: publishedAtFor(index + 100),
    readingMinutes: 5,
    intro: `${seed.label} yaklaşırken feed’iniz boş kalmasın. Bu yazıda "${primary}" niyetine uygun hikaye + post kombinasyonları ve yayın sıralaması var.`,
    sections: [
      {
        heading: "Önerilen içerik seti (3 parça)",
        body: [
          `1) Ana feed postu: "${seed.label}" başlıklı, markalı kutlama görseli.`,
          "2) Story: aynı görselin dikey hali + ‘Swipe up / profil’ çağrısı.",
          "3) Reels veya carousel kapağı: kısa metin + güçlü renk bloğu (mümkünse 24 saat önce teaser).",
        ],
      },
      {
        heading: "Yayın zamanlaması",
        body: [
          "Özel günden 1 gün önce teaser, günün sabahı ana kutlama, günün akşamı teşekkür mesajı paylaşın.",
          `"${seed.searchTerms[0]}" aramaları özel gün sabahına zirve yapar. İçeriği gece yarısından önce hazır tutun.`,
        ],
      },
      {
        heading: "Kaçınılması gerekenler",
        body: [
          "Aşırı kalabalık clipart, bozuk yazı, okunaksız logo, genel stok aile sahneleri.",
          "Dini / milli günlerde mizah risklidir; sakin ve saygılı bir ton tercih edin.",
        ],
      },
      {
        heading: "Hızlı çözüm",
        body: [
          `${APP_NAME} üzerinden ${seed.label} kartını seçin, üretin, revize edin ve onaylayın. Aynı gün story çıktısı da alınabilir.`,
        ],
      },
    ],
    faq: [
      {
        question: "Story ve post aynı mı olmalı?",
        answer: "Aynı görsel dilde olmalı ama oran farklıdır. Post kare/dikey, story ise full dikey olmalı.",
      },
      {
        question: "Hashtag kullanmalı mıyım?",
        answer: `Evet, 3–8 arası spesifik etiket yeter: #${slugify(seed.label).replace(/-/g, "")} ve sektör etiketleri.`,
      },
    ],
    cta: `${seed.label} Instagram setinizi ${APP_NAME} ile dakikalar içinde tamamlayın.`,
    coverImage: coverForTopic(seed.dayId),
  };
}

function buildSectorGuide(seed: SectorSeoSeed, index: number): BlogPost {
  const primary = seed.searchTerms[0]!;
  const slug = slugify(`${seed.sector}-ozel-gun-postlari`);

  return {
    slug,
    title: seed.longTails[0],
    description: `${seed.label} işletmeleri için özel gün Instagram postları, bayram mesajları ve içerik takvimi. ${primary} arayanlar için pratik rehber.`,
    keywords: [...seed.searchTerms, `${seed.label} bayram postu`, `${seed.label} sosyal medya`, "kobi instagram"],
    primaryKeyword: primary,
    category: "meslek",
    categoryLabel: "Mesleklere özel yazılar",
    topicId: seed.sector,
    topicLabel: seed.label,
    publishedAt: publishedAtFor(index + 200),
    readingMinutes: 7,
    intro: `${seed.label} işletmeleri özel günlerde görünür olmalıdır; müşteri ilişkiyi hatırlar. Bu rehber "${primary}" arayanlar için görsel ton, mesaj ve yayın planını sadeleştirir.`,
    sections: [
      {
        heading: `${seed.label} için doğru görsel dil`,
        body: [
          `${seed.label} postlarında sektörünüzün güven sinyali kritiktir. Abartılı efekt yerine temiz kompozisyon, net logo ve tutarlı renk kullanın.`,
          `Bayram, cuma ve milli günlerde marka kimliğinizi koruyan ama kutlama hissi veren bir orta yol kurun.`,
        ],
      },
      {
        heading: "Ayda hangi özel günler?",
        body: [
          "En az: Cumalar (haftalık), büyük bayramlar, yılbaşı, 29 Ekim, 30 Ağustos, Anneler / Babalar Günü, sektöre özel meslek günleri.",
          `${seed.label} müşterisi bu paylaşımlarda sizi “unutmayan işletme” olarak konumlar.`,
        ],
      },
      {
        heading: "Örnek caption yapısı",
        body: [
          "1. Satır: kısa kutlama.",
          "2. Satır: sektöre dokunan bir cümle (hizmet / teşekkür).",
          "3. Satır: yumuşak CTA (randevu, ziyaret, DM).",
        ],
      },
      {
        heading: `${APP_NAME} ${seed.label} paketleri`,
        body: [
          `Sektörünüzü seçtiğinizde ${APP_NAME}, ${seed.label} görsel diline uygun özel gün kartları önerir ve logonuzla üretir.`,
          `"${primary}" ihtiyacını ajans beklemeden çözmek için tasarlandı.`,
        ],
      },
    ],
    faq: [
      {
        question: `${seed.label} için kaç özel gün postu yeter?`,
        answer: "Başlangıç için 20–30 kartlık bir yıllık takvim çoğu KOBİ için yeterli olur.",
      },
      {
        question: "Her cumayı paylaşmalı mıyım?",
        answer: "Haftalık cuma paylaşımı yerel işletmelerde sadakat artırır; tonunuzu sektöre göre tutarlı tutun.",
      },
    ],
    cta: `${seed.label} markanız için özel gün postlarını ${APP_NAME} ile üretin.`,
  };
}

function buildSectorCalendar(seed: SectorSeoSeed, index: number): BlogPost {
  const primary = seed.searchTerms[1] ?? seed.searchTerms[0]!;
  const slug = slugify(`${seed.sector}-instagram-icerik-takvimi`);

  return {
    slug,
    title: seed.longTails[1],
    description: `${seed.label} Instagram içerik takvimi: bayramlar, milli günler, cuma paylaşımları ve kampanya günleri. ${primary} odaklı pratik plan.`,
    keywords: [...seed.searchTerms, `${seed.label} içerik takvimi`, "sosyal medya planı", "özel gün takvimi"],
    primaryKeyword: primary,
    category: "meslek",
    categoryLabel: "Mesleklere özel yazılar",
    topicId: seed.sector,
    topicLabel: seed.label,
    publishedAt: publishedAtFor(index + 300),
    readingMinutes: 6,
    intro: `Plan yoksa feed boş kalır. ${seed.label} için "${primary}" arayanların istediği şey aslında net bir takvim ve hazır görsellerdir.`,
    sections: [
      {
        heading: "3 katmanlı takvim",
        body: [
          "1) Sabit: Cumalar.",
          "2) Mevsimsel: bayramlar, 23 Nisan, 19 Mayıs, 30 Ağustos, 29 Ekim, yılbaşı.",
          `3) Sektörel: ${seed.label} ile ilişkili meslek / kampanya günleri.`,
        ],
      },
      {
        heading: "Üretim sırası",
        body: [
          "Ay başında o ayın kartlarını netleştirin.",
          "Görselleri önceden üretip onaylayın.",
          "Yayın günü sadece paylaşın; tasarım panikte yapılmasın.",
        ],
      },
      {
        heading: "Ölçüm",
        body: [
          "Kaydetme, profil ziyareti ve DM sayısına bakın. Beğeni tek başına yeterli metrik değildir.",
          "Bayram postlarında yorum yerine DM/telefon artışı daha değerli olabilir.",
        ],
      },
      {
        heading: `${APP_NAME} ile otomasyon`,
        body: [
          `${APP_NAME} seçtiğiniz günleri kartlara çevirir; siz üret → onayla → paylaş akışını yönetirsiniz.`,
        ],
      },
    ],
    faq: [
      {
        question: "Takvim Excel’de mi tutulmalı?",
        answer: "Başlangıç için basit bir liste yeter. Asıl kritik olan görsellerin hazır olmasıdır.",
      },
      {
        question: "Ajans şart mı?",
        answer: `${seed.label} için yıllık özel gün setini ${APP_NAME} ile ajanssız da yönetebilirsiniz.`,
      },
    ],
    cta: `${seed.label} içerik takviminizi ${APP_NAME} ile görsele dönüştürün.`,
  };
}

let cachedPosts: BlogPost[] | null = null;

export function getAllBlogPosts(): BlogPost[] {
  if (cachedPosts) return cachedPosts;

  const posts: BlogPost[] = [];
  DAY_SEO_SEEDS.forEach((seed, i) => {
    posts.push(buildDayGuide(seed, i));
    posts.push(buildDayIdeas(seed, i));
  });
  SECTOR_SEO_SEEDS.forEach((seed, i) => {
    posts.push(buildSectorGuide(seed, i));
    posts.push(buildSectorCalendar(seed, i));
  });

  cachedPosts = posts.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
  return cachedPosts;
}

export function getBlogPostBySlug(slug: string) {
  return getAllBlogPosts().find((post) => post.slug === slug);
}

export function getBlogPostsByCategory(category: BlogPost["category"]) {
  return getAllBlogPosts().filter((post) => post.category === category);
}

export function getRelatedPosts(post: BlogPost, limit = 4) {
  return getAllBlogPosts()
    .filter((item) => item.slug !== post.slug && (item.topicId === post.topicId || item.category === post.category))
    .slice(0, limit);
}

export function getBlogTopics() {
  const days = DAY_SEO_SEEDS.map((s) => ({
    id: s.dayId,
    label: s.label,
    category: "ozel-gun" as const,
    keyword: s.searchTerms[0]!,
  }));
  const sectors = SECTOR_SEO_SEEDS.map((s) => ({
    id: s.sector,
    label: s.label,
    category: "meslek" as const,
    keyword: s.searchTerms[0]!,
  }));
  return { days, sectors };
}
