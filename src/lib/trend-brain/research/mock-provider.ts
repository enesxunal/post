import type { TrendResearchSummary, TrendTargetType } from "@/lib/trend-brain/types";

/** Faz 1: mock research — Faz 2'de gerçek provider bağlanır. */
export async function fetchTrendResearchMock(input: {
  targetType: TrendTargetType;
  targetId: string;
  label: string;
}): Promise<TrendResearchSummary> {
  await new Promise((resolve) => setTimeout(resolve, 50));

  if (input.targetType === "special_day") {
    return mockSpecialDayResearch(input.targetId, input.label);
  }
  if (input.targetType === "sector") {
    return mockSectorResearch(input.targetId);
  }
  return mockStyleResearch(input.targetId);
}

function mockSpecialDayResearch(dayId: string, label: string): TrendResearchSummary {
  const base = {
    targetType: "special_day" as const,
    targetId: dayId,
    summary: `${label} için sosyal medyada daha editorial ve az şablon hissi veren paylaşımlar öne çıkıyor.`,
    toneNotes: ["saygılı", "sıcak", "premium"],
    phraseHints: [],
    visualNotes: ["daha az 3D ikon", "daha güçlü tipografi", "tam ekran atmosfer"],
    avoidNotes: ["generic tech overlay", "tekrarlayan üst başlık şablonu"],
  };

  if (dayId.includes("29-ekim") || dayId.includes("cumhuriyet")) {
    return {
      ...base,
      summary:
        "29 Ekim paylaşımlarında kırmızı-beyaz tam ekran kompozisyonlar ve güçlü tipografi daha çok etkileşim alıyor.",
      phraseHints: ["Cumhuriyetimizin ışığıyla", "Yaşasın Cumhuriyet", "Birlik ve beraberlik"],
      visualNotes: ["bayrak hareketi", "şehir silüeti", "editorial poster"],
      avoidNotes: ["politik sembol", "parti vurgusu"],
    };
  }

  if (dayId.includes("mart") || dayId.includes("kadin")) {
    return {
      ...base,
      summary:
        "8 Mart içeriklerinde güçlü kadın portresi ve kısa duygusal cümleler standart stok görsellerden daha iyi performans gösteriyor.",
      phraseHints: ["Güçlü kadınlar", "Eşit yarınlar", "Işığınızla güzelleşiyor"],
      visualNotes: ["editorial portre", "sıcak ışık", "minimal emblem"],
    };
  }

  if (dayId.includes("ramazan") || dayId.includes("bayram") || dayId.includes("kandil")) {
    return {
      ...base,
      summary:
        "Dini günlerde sakin gece ışığı, ölçülü hilal ve az metinli kompozisyonlar tercih ediliyor.",
      phraseHints: ["Huzurlu günler", "Bereketli günler", "Mübarek günler"],
      visualNotes: ["gece ışığı", "minimal cami silüeti", "düşük yoğunluk"],
      avoidNotes: ["abartılı neon", "yanlış dini sembol"],
    };
  }

  return {
    ...base,
    phraseHints: [`${label} kutlu olsun`, `${label} özel günü`],
  };
}

function mockSectorResearch(sector: string): TrendResearchSummary {
  return {
    targetType: "sector",
    targetId: sector,
    summary: `${sector} sektöründe yerel işletme samimiyeti ve gerçek mekan/ürün fotoğrafı trendi güçleniyor.`,
    toneNotes: ["güvenilir", "samimi", "yerel"],
    phraseHints: [],
    visualNotes: ["still life", "sıcak ışık", "az grafik ikon"],
    avoidNotes: ["soğuk kurumsal şablon"],
  };
}

function mockStyleResearch(style: string): TrendResearchSummary {
  return {
    targetType: "style",
    targetId: style,
    summary: `${style} stilinde editorial poster ve sinematik kompozisyonlar standart kart düzeninden daha iyi sonuç veriyor.`,
    toneNotes: ["premium", "okunaklı"],
    phraseHints: [],
    visualNotes: ["split layout", "full-bleed", "tipografi öncelikli"],
    avoidNotes: ["üst başlık + alt görsel tekrarı"],
  };
}
