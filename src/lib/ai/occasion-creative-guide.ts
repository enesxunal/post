import { resolveStyleName } from "@/lib/styles/seed-data";
import type { BrandContext, SpecialDay, SpecialDayCategory } from "@/types/domain";

export type OccasionCreativeGuide = {
  soul: string;
  visualMetaphors: string[];
  culturalElements: string[];
  compositionIdeas: string[];
  moodKeywords: string[];
  avoid: string[];
};

const UNIVERSAL_AVOID = [
  "holographic UI panels",
  "cyberpunk server room",
  "microchip or credit-card metaphor",
  "abstract glowing tech blocks on a dark grid floor",
  "soulless corporate template with no occasion identity",
  "random English text",
  "customer service description as visible text",
  "Turkish typos (ye instead of ve, yalda instead of yılda, Çözüllmeri, Áğostus)",
];

const CATEGORY_BASE: Record<SpecialDayCategory, OccasionCreativeGuide> = {
  national: {
    soul: "Milli gurur, saygı ve kutlama. İnsani, sıcak, gururlu — soğuk fütürist teknoloji sahnesi değil.",
    visualMetaphors: [
      "dalgalanan veya kompozisyonda yer alan Türk bayrağı motifi",
      "kırmızı-beyaz renk hikayesi",
      "gurur ve birlik hissi veren ışık ve derinlik",
    ],
    culturalElements: [
      "Türk bayrağı (doğru ay-yıldız oranı)",
      "kırmızı-beyaz palet",
      "saygılı kutlama atmosferi",
    ],
    compositionIdeas: [
      "Bayrak veya milli renkler ön planda; marka logosu köşede küçük",
      "Başlık büyük ve okunaklı; arka planda günün ruhunu taşıyan dekor",
    ],
    moodKeywords: ["gururlu", "saygılı", "coşkulu", "kurumsal", "sıcak"],
    avoid: [...UNIVERSAL_AVOID, "politik parti sembolü", "distorted flag", "mosque", "minaret", "religious architecture"],
  },
  holiday: {
    soul: "İşletmenin müşterilerine profesyonel bayram kutlama grafiği — markalı sosyal medya tasarımı. Kişisel aile kartı veya stok fotoğraf DEĞİL.",
    visualMetaphors: [
      "premium bayram temalı grafik tasarım kompozisyonu",
      "marka renkleriyle entegre hilal/bayram motifi ve dekoratif desenler",
      "sektöre uygun vitrin, ürün veya mekan dokunuşu ile kutlama",
      "katmanlı tipografi ve editorial poster hissi",
    ],
    culturalElements: [
      "ölçülü hilal veya bayram motifi (grafik tasarım öğesi olarak)",
      "sıcak ama kurumsal kutlama atmosferi",
      "Türkçe bayram mesajı için güçlü tipografi alanı",
    ],
    compositionIdeas: [
      "Grafik tasarımcı eli değmiş katmanlı kompozisyon — fotoğraf + siyah şerit şablonu YASAK",
      "Bayram kimliği + işletme sektörü birlikte hissedilsin (mağaza, kafe, klinik vb.)",
      "Marka rengi tasarımın parçası; rastgele stok görsel değil",
    ],
    moodKeywords: ["profesyonel", "zarif", "sıcak", "saygılı", "markalı"],
    avoid: [
      ...UNIVERSAL_AVOID,
      "stock photo family hugging",
      "multi-generation family portrait",
      "living room family scene",
      "black footer bar with text",
      "canva photo template",
      "generic greeting card layout",
      "holographic crescent",
      "data-dashboard aesthetic",
      "cold dark void",
    ],
  },
  religious: {
    soul: "İşletmenin müşterilerine saygılı dini gün kutlama grafiği — premium marka tasarımı. Stok aile fotoğrafı veya kişisel kart DEĞİL.",
    visualMetaphors: [
      "zarif İslami geometri ve bayram/kandil motifleri (grafik tasarım)",
      "dingin gece atmosferi ile markalı kompozisyon",
      "sektöre uygun premium kutlama grafiği",
    ],
    culturalElements: [
      "ölçülü hilal veya kandil ışığı (dekoratif grafik öğe)",
      "lacivert, altın, beyaz tonlar",
      "saygılı minimal dini estetik",
    ],
    compositionIdeas: [
      "Editorial poster düzeni; manevi motif + marka kimliği dengeli",
      "Tipografi ön planda; stok fotoğraf şablonu kullanma",
    ],
    moodKeywords: ["huzurlu", "saygılı", "dingin", "zarif", "profesyonel"],
    avoid: [
      ...UNIVERSAL_AVOID,
      "stock photo family",
      "black footer text bar",
      "canva template",
      "offensive religious imagery",
      "neon cyber mosque",
    ],
  },
  friday: {
    soul: "Cuma huzuru ve hayırlı dilekler. Sakin, temiz, saygılı.",
    visualMetaphors: ["yumuşak ışık", "minimal cami silueti", "sakin sabah atmosferi"],
    culturalElements: ["hayırlı cumalar tonu", "sade tipografi", "huzur veren renkler"],
    compositionIdeas: ["Az öğe, çok nefes; metin net"],
    moodKeywords: ["huzurlu", "sakin", "saygılı"],
    avoid: [...UNIVERSAL_AVOID],
  },
  recommended: {
    soul: "Kutlama ve marka sıcaklığı. Konuya özel atmosfer şart.",
    visualMetaphors: ["mevsim veya kutlama objeleri", "sıcak ışık", "paylaşılabilir sosyal medya estetiği"],
    culturalElements: ["günün kültürel bağlamına uygun dekor"],
    compositionIdeas: ["Konu ilk bakışta anlaşılsın", "Marka köşede, konu merkezde"],
    moodKeywords: ["sıcak", "kutlayıcı", "premium"],
    avoid: [...UNIVERSAL_AVOID],
  },
  popular: {
    soul: "İlgili özel günün popüler kültür ruhu. Jenerik şablon değil.",
    visualMetaphors: ["güne özel semboller ve objeler"],
    culturalElements: ["günün ana teması görselde hissedilsin"],
    compositionIdeas: ["Konuya özel sahne kurgusu"],
    moodKeywords: ["ilgili", "sıcak", "paylaşılabilir"],
    avoid: [...UNIVERSAL_AVOID],
  },
  sectoral: {
    soul: "Meslek günü onuru ve teşekkür. İlgili sektör hissi + günün anlamı.",
    visualMetaphors: ["sektöre özgü ince ipuçları", "teşekkür ve saygı"],
    culturalElements: ["meslek günü sembolleri", "profesyonel gurur"],
    compositionIdeas: ["Sektör + gün birlikte anlaşılsın"],
    moodKeywords: ["saygılı", "profesyonel", "teşekkür"],
    avoid: [...UNIVERSAL_AVOID],
  },
  campaign: {
    soul: "Kampanya enerjisi ama marka kimliğiyle uyumlu. Konuya uygun dinamizm.",
    visualMetaphors: ["mevsim veya kampanya objeleri"],
    culturalElements: ["kampanya dönemine uygun atmosfer"],
    compositionIdeas: ["Dikkat çekici ama konuya sadık"],
    moodKeywords: ["enerjik", "davetkar", "premium"],
    avoid: [...UNIVERSAL_AVOID],
  },
};

const SLUG_OVERRIDES: Partial<Record<string, Partial<OccasionCreativeGuide>>> = {
  "new-year": {
    soul: "Yeni başlangıç, umut ve kutlama. Sıcak ışıklar — karanlık boş gradient değil.",
    visualMetaphors: ["yılbaşı ışıkları", "zarif konfeti veya sparkle", "sıcak kutlama atmosferi"],
    culturalElements: ["mutlu yıllar hissi", "parlak ama abartısız kutlama dekoru"],
    avoid: ["cold empty dark gradient only", "typo in Turkish subtext"],
  },
  "29-ekim": {
    soul: "Cumhuriyet Bayramı gururu — Türk bayrağı, kırmızı-beyaz, modern kutlama. Başka özel gün sembolleri (cami, kandil, bayram, Cuma) bu tasarıma karışmasın.",
    visualMetaphors: [
      "Türk bayrağı kompozisyonu",
      "kırmızı-beyaz ışık ve derinlik",
      "cumhuriyet poster estetiği",
      "modern Türkiye kutlama grafiği",
    ],
    culturalElements: [
      "Türk bayrağı veya güçlü kırmızı-beyaz kompozisyon",
      "cumhuriyet gururu",
      "milli kutlama estetiği",
    ],
    avoid: [
      "mosque",
      "minaret",
      "cami",
      "Ottoman skyline",
      "Blue Mosque",
      "Hagia Sophia",
      "religious architecture",
      "Islamic dome in background",
      "tourist Istanbul mosque view",
      "credit card or chip metaphor",
      "sci-fi podium",
      "no flag on Republic Day",
    ],
  },
  "30-agustos": {
    culturalElements: ["zafer ve gurur", "Türk bayrağı motifi", "kırmızı-beyaz"],
    avoid: ["sci-fi tiered blocks", "no national symbols"],
  },
  "19-mayis": {
    culturalElements: [
      "gençlik enerjisi ve umut",
      "spor/hareket hissi",
      "kırmızı-beyaz",
      "19 Mayıs ruhu",
    ],
    avoid: ["generic gold line figures without youth/sports context", "text typo ye/ve"],
  },
  "23-nisan": {
    culturalElements: ["çocuk neşesi", "renkli ama saygılı", "umut ve gelecek"],
    avoid: ["karikatür clip art children"],
  },
  "ramadan-feast": {
    soul: "Mağaza/işletmenin müşterilerine Ramazan Bayramı kutlama POSTU — ticari Instagram grafiği.",
    visualMetaphors: [
      "zarif bayram motifleri ile premium marka grafiği",
      "sektöre özgü ürün veya mekan atmosferi + bayram estetiği",
      "katmanlı tipografi, dekoratif hilal ve bayram desenleri",
    ],
    compositionIdeas: [
      "Butik/mağaza/hizmet işletmesi müşterilerine kutlama — sektör hissi şart",
      "Grafik tasarım kompozisyonu; stok aile fotoğrafı yasak",
    ],
    avoid: [
      "multi-generation family stock photo",
      "living room family hugging scene",
      "black bar footer template",
      "generic greeting card photo",
      "holographic crescent on tech platform",
      "cyber bayram",
    ],
  },
  "kurban-bayrami": {
    soul: "İşletmenin müşterilerine Kurban Bayramı kutlama grafiği — markalı ve profesyonel.",
    visualMetaphors: [
      "saygılı bayram temalı premium grafik tasarım",
      "sektör kimliği ile birleşen bayram dekoru",
      "editorial poster kompozisyonu",
    ],
    avoid: [
      "stock family portrait",
      "family gathering stock photo",
      "black footer template",
      "holographic religious symbols",
      "disturbing sacrifice imagery",
    ],
  },
};

const OVERRIDE_ONLY_LIST_SLUGS = new Set(["29-ekim", "30-agustos", "19-mayis", "23-nisan"]);

function mergeGuide(base: OccasionCreativeGuide, patch?: Partial<OccasionCreativeGuide>, slug?: string): OccasionCreativeGuide {
  if (!patch) return base;
  const listOnly = slug && OVERRIDE_ONLY_LIST_SLUGS.has(slug);
  return {
    soul: patch.soul ?? base.soul,
    visualMetaphors: listOnly && patch.visualMetaphors?.length
      ? patch.visualMetaphors
      : [...new Set([...(patch.visualMetaphors ?? []), ...base.visualMetaphors])],
    culturalElements: listOnly && patch.culturalElements?.length
      ? patch.culturalElements
      : [...new Set([...(patch.culturalElements ?? []), ...base.culturalElements])],
    compositionIdeas: [...new Set([...(patch.compositionIdeas ?? []), ...base.compositionIdeas])],
    moodKeywords: [...new Set([...(patch.moodKeywords ?? []), ...base.moodKeywords])],
    avoid: [...new Set([...(patch.avoid ?? []), ...base.avoid])],
  };
}

export function buildOccasionCreativeGuide(day: SpecialDay): OccasionCreativeGuide {
  const base = CATEGORY_BASE[day.category] ?? CATEGORY_BASE.recommended;
  const slug = day.id ?? day.slug;
  return mergeGuide(base, SLUG_OVERRIDES[day.id] ?? SLUG_OVERRIDES[day.slug], slug);
}

export function buildStyleBalanceRule(day: SpecialDay, context: BrandContext): string {
  const styleName = resolveStyleName(context.visualStyle);

  return [
    "=== COMMERCIAL DESIGN HIERARCHY (CRITICAL) ===",
    `This is a professional Instagram marketing graphic that "${context.brandName}" publishes TO CUSTOMERS — not a personal greeting card.`,
    `NOT stock lifestyle photography, NOT Canva photo+footer template, NOT generic family scene.`,
    `Design like a senior Turkish graphic designer: layered composition, intentional typography, brand color integration.`,
    "",
    `Occasion (≈40%): "${day.name}" — ${day.culturalContext}`,
    `Business sector (≈35%): the design must feel specific to this type of business.`,
    `Brand accent (≈25%): brand colors only${context.logoUrl ? " — real logo is added after generation, do NOT draw logo or write brand name" : `: "${context.brandName}" via colors + logo corner`}.`,
    `Style "${styleName}" adapts to occasion + sector — never a soulless generic template.`,
    "Viewer must instantly understand BOTH the special day AND that this is a business post.",
  ].join("\n");
}

export function appendOccasionGuideSections(sections: string[], day: SpecialDay, context: BrandContext) {
  const guide = buildOccasionCreativeGuide(day);

  sections.push(
    "",
    buildStyleBalanceRule(day, context),
    "",
    "=== OCCASION SOUL (what the image must FEEL like) ===",
    guide.soul,
    "",
    "=== CULTURAL & VISUAL ELEMENTS (use thoughtfully, not all at once) ===",
    ...guide.culturalElements.map((item) => `- ${item}`),
    "",
    "=== VISUAL METAPHORS (pick 1-2, execute with premium design) ===",
    ...guide.visualMetaphors.map((item) => `- ${item}`),
    "",
    "=== COMPOSITION IDEAS ===",
    ...guide.compositionIdeas.map((item) => `- ${item}`),
    "",
    `=== MOOD: ${guide.moodKeywords.join(", ")} ===`,
    "",
    "=== STRICT TEXT ON IMAGE ===",
    "- ONLY the exact Turkish headline (perfect spelling: ğ ü ş ı ö ç).",
    "- NO extra subtext, NO customer description, NO typo slogans.",
    "- Do NOT invent secondary sentences like 'yeni yalda' or 'Gençlik ye umut'.",
  );

  return guide;
}

export function occasionAvoidList(day: SpecialDay): string[] {
  return buildOccasionCreativeGuide(day).avoid;
}
