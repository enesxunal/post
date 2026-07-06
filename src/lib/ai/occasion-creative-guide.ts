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
    avoid: [...UNIVERSAL_AVOID, "politik parti sembolü", "distorted flag"],
  },
  holiday: {
    soul: "Bayram sıcaklığı, aile, paylaşma ve iyi dilek. Manevi huzur — holografik fütürizm değil.",
    visualMetaphors: [
      "sıcak aile/bayramlaşma atmosferi",
      "zarif hilal veya bayram ışığı",
      "altın ve lacivert tonlarda dingin kutlama",
    ],
    culturalElements: [
      "ölçülü hilal veya bayram motifi",
      "sıcak ışık, huzur, bereket hissi",
      "geleneksel-modern karışımı zarif desenler",
    ],
    compositionIdeas: [
      "Sıcak, davetkar arka plan; bayram hissi ilk bakışta anlaşılsın",
      "Marka rengi aksan olarak; ana ruh bayram atmosferi",
    ],
    moodKeywords: ["huzurlu", "sıcak", "zarif", "saygılı", "kutlayıcı"],
    avoid: [...UNIVERSAL_AVOID, "holographic crescent", "data-dashboard aesthetic", "cold dark void"],
  },
  religious: {
    soul: "Manevi derinlik, dua ve huzur. Dingin, saygılı, zarif — teknoloji gösterisi değil.",
    visualMetaphors: [
      "gece gökyüzü ve yumuşak ışık huzmeleri",
      "zarif cami silueti veya soyut İslami geometri",
      "kandil ışığı ve sakin kompozisyon",
    ],
    culturalElements: [
      "ölçülü hilal veya kandil ışığı",
      "lacivert, altın, beyaz tonlar",
      "saygılı minimal dini estetik",
    ],
    compositionIdeas: [
      "Dingin gece atmosferi; metin az ve okunaklı",
      "Manevi motifler ölçülü; abartısız premium tasarım",
    ],
    moodKeywords: ["huzurlu", "saygılı", "dingin", "zarif", "manevi"],
    avoid: [...UNIVERSAL_AVOID, "offensive religious imagery", "neon cyber mosque"],
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
    culturalElements: [
      "Türk bayrağı veya güçlü kırmızı-beyaz kompozisyon",
      "cumhuriyet gururu",
      "modern Türkiye kutlama estetiği",
    ],
    avoid: ["credit card or chip metaphor", "sci-fi podium", "no flag on Republic Day"],
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
    soul: "Ramazan Bayramı sıcaklığı — aile, sevgi, bayramlaşma.",
    visualMetaphors: ["sıcak ev atmosferi", "zarif bayram motifi", "altın ve beyaz tonlar"],
    avoid: ["holographic crescent on tech platform", "cyber bayram"],
  },
  "kurban-bayrami": {
    soul: "Kurban Bayramı huzuru — paylaşma, aile, saygı.",
    visualMetaphors: ["sıcak aile birliği", "zarif bayram dekoru"],
    avoid: ["holographic religious symbols", "disturbing sacrifice imagery"],
  },
};

function mergeGuide(base: OccasionCreativeGuide, patch?: Partial<OccasionCreativeGuide>): OccasionCreativeGuide {
  if (!patch) return base;
  return {
    soul: patch.soul ?? base.soul,
    visualMetaphors: [...new Set([...(patch.visualMetaphors ?? []), ...base.visualMetaphors])],
    culturalElements: [...new Set([...(patch.culturalElements ?? []), ...base.culturalElements])],
    compositionIdeas: [...new Set([...(patch.compositionIdeas ?? []), ...base.compositionIdeas])],
    moodKeywords: [...new Set([...(patch.moodKeywords ?? []), ...base.moodKeywords])],
    avoid: [...new Set([...(patch.avoid ?? []), ...base.avoid])],
  };
}

export function buildOccasionCreativeGuide(day: SpecialDay): OccasionCreativeGuide {
  const base = CATEGORY_BASE[day.category] ?? CATEGORY_BASE.recommended;
  return mergeGuide(base, SLUG_OVERRIDES[day.id] ?? SLUG_OVERRIDES[day.slug]);
}

export function buildStyleBalanceRule(day: SpecialDay, context: BrandContext): string {
  const styleName = resolveStyleName(context.visualStyle);

  return [
    "=== OCCASION-FIRST HIERARCHY (CRITICAL) ===",
    `Primary subject (≈65%): "${day.name}" — ${day.culturalContext}`,
    `Secondary accent (≈35%): brand "${context.brandName}" via colors + small logo corner.`,
    `Customer style "${styleName}" must ADAPT to this occasion — never replace the occasion with a generic ${styleName} tech/corporate template.`,
    "Agency, software or corporate brands: sector tech cues (grids, UI, chips) are FORBIDDEN as the main scene on special days.",
    "The viewer must instantly feel WHICH Turkish special day this is — before noticing the brand.",
    "Warmth, cultural authenticity and emotional connection matter more than looking 'futuristic'.",
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
