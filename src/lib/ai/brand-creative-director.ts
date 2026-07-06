import { generateTextWithGemini } from "@/lib/ai/providers/gemini";
import { isGeminiConfigured } from "@/lib/ai/gemini-config";
import { sectorModifiers, sectors, styles } from "@/lib/mock-data";
import type { BrandContext, SectorKey, SpecialDay } from "@/types/domain";

export type SpecialDayContext = Pick<
  SpecialDay,
  | "name"
  | "category"
  | "culturalContext"
  | "visualDirection"
  | "captionIdeas"
  | "headlineAlternatives"
  | "avoidRules"
>;

export type BrandCreativeBrief = {
  positioning: string;
  toneOfVoice: string;
  visualDirection: string;
  visualQuality: string;
  subtextOnImage: string | null;
  onImageTextRules: string;
  avoidOnImage: string[];
  /** Marka + özel günün nasıl birleşeceği */
  dayHarmony: string;
  /** Görselde sahne ve kompozisyon tarifi */
  sceneComposition: string;
  /** Sektör + özel gün + marka tonu birleşimi */
  sectorBlend: string;
};

const UNIVERSAL_AVOID = [
  "clip art",
  "stick figure",
  "amatör çizim",
  "yazım hatalı Türkçe",
  "gereksiz alt slogan",
  "hizmet listesi",
  "fazla metin bloğu",
  "düz arka plan + tek kelime",
];

const SECTOR_FALLBACK: Partial<
  Record<SectorKey, { positioning: string; tone: string; visual: string }>
> = {
  agency: {
    positioning: "Dijital çözümler ve kurumsal hizmet sunan profesyonel ajans",
    tone: "kurumsal, güven veren, teknoloji odaklı",
    visual: "premium dijital ajans estetiği, katmanlı modern kompozisyon",
  },
  beauty: {
    positioning: "Güzellik ve kişisel bakım hizmeti sunan işletme",
    tone: "zarif, sıcak, güven veren",
    visual: "yumuşak ışık, premium güzellik markası estetiği",
  },
  cafe: {
    positioning: "Kafe veya restoran işletmesi",
    tone: "sıcak, davetkar, samimi",
    visual: "iştah açıcı, sıcak mekan hissi",
  },
  dental: {
    positioning: "Diş ve ağız sağlığı hizmeti",
    tone: "temiz, profesyonel, güvenilir",
    visual: "hijyenik, aydınlık sağlık estetiği",
  },
  "real-estate": {
    positioning: "Gayrimenkul danışmanlığı",
    tone: "kurumsal, güvenilir, modern",
    visual: "mimari ve şehir yaşamı estetiği",
  },
  education: {
    positioning: "Eğitim ve öğrenme odaklı kurum",
    tone: "ilham veren, güvenilir, umut dolu",
    visual: "aydınlık, düzenli eğitim markası estetiği",
  },
  boutique: {
    positioning: "Perakende ve butik mağaza",
    tone: "şık, davetkar, trend",
    visual: "zarif perakende vitrin estetiği",
  },
  "auto-service": {
    positioning: "Otomotiv servis ve bakım",
    tone: "güvenilir, profesyonel",
    visual: "temiz oto servis profesyonelliği",
  },
  fitness: {
    positioning: "Spor ve fitness merkezi",
    tone: "enerjik, motive edici",
    visual: "dinamik atletik enerji",
  },
  nutrition: {
    positioning: "Beslenme ve sağlıklı yaşam danışmanlığı",
    tone: "sağlıklı, bilimsel, güven veren",
    visual: "temiz wellness estetiği",
  },
  other: {
    positioning: "Yerel KOBİ işletmesi",
    tone: "samimi, profesyonel, güven veren",
    visual: "modern KOBİ markası estetiği",
  },
};

function getSectorModifier(sector: SectorKey) {
  return sectorModifiers.find((item) => item.key === sector);
}

function refineRawDescription(raw: string, brandName: string, sector: SectorKey): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    return SECTOR_FALLBACK[sector]?.positioning ?? SECTOR_FALLBACK.other!.positioning;
  }

  const lower = trimmed.toLowerCase();
  const fixes: Array<[RegExp, string]> = [
    [/yazilim/gi, "yazılım"],
    [/eticaret/gi, "e-ticaret"],
    [/e ticaret/gi, "e-ticaret"],
    [/cozum/gi, "çözüm"],
    [/cozuml/gi, "çözüm"],
  ];

  let refined = trimmed;
  for (const [pattern, replacement] of fixes) {
    refined = refined.replace(pattern, replacement);
  }

  if (refined.length < 20 && !refined.toLowerCase().includes(brandName.toLowerCase())) {
    return `${brandName}, ${refined}`;
  }

  return refined.charAt(0).toUpperCase() + refined.slice(1);
}

function buildFallbackHarmony(
  context: BrandContext,
  day?: SpecialDayContext,
  sectorMod?: ReturnType<typeof getSectorModifier>,
): Pick<BrandCreativeBrief, "dayHarmony" | "sceneComposition" | "sectorBlend"> {
  const dayName = day?.name ?? "özel gün";
  const sectorLabel =
    sectors.find((item) => item.key === context.sector)?.label ?? context.customSector ?? "KOBİ";

  return {
    dayHarmony: `${context.brandName} (${sectorLabel}) için ${dayName} kutlaması: markanın ${sectorMod?.toneHints ?? "profesyonel"} tonu ile ${day?.culturalContext ?? "saygılı kutlama"} birleşmeli. Satış baskısı yok, güven ve samimiyet ön planda.`,
    sceneComposition: [
      `Ön planda büyük Türkçe başlık: "${day?.headlineAlternatives[0] ?? dayName}".`,
      `Arka plan ve dekor: ${day?.visualDirection ?? "modern kutlama"} + ${sectorMod?.visualCues ?? "sektöre uygun görsel ipuçları"}.`,
      `Marka renkleri kompozisyonda doğal şekilde kullanılsın.`,
      `${context.brandName} logosu köşede küçük ve net.`,
      "Premium sosyal medya tasarımı, derinlik ve katman hissi.",
    ].join(" "),
    sectorBlend: `${sectorMod?.promptModifier ?? "professional local business"} estetiği, ${day?.category ?? "özel gün"} kategorisine uygun saygılı ton.`,
  };
}

function buildFallbackBrief(context: BrandContext, day?: SpecialDayContext): BrandCreativeBrief {
  const sectorMod = getSectorModifier(context.sector);
  const sectorDefaults = SECTOR_FALLBACK[context.sector] ?? SECTOR_FALLBACK.other!;
  const style = styles.find((item) => item.key === context.visualStyle);
  const refinedRaw = refineRawDescription(
    context.brandDescription ?? "",
    context.brandName,
    context.sector,
  );
  const harmony = buildFallbackHarmony(context, day, sectorMod);

  const positioning =
    refinedRaw.length > 10
      ? `${context.brandName}: ${refinedRaw}`
      : `${context.brandName} — ${sectorDefaults.positioning}`;

  return {
    positioning,
    toneOfVoice: `${sectorMod?.toneHints ?? sectorDefaults.tone}, ${style?.description ?? "modern"}`,
    visualDirection: `${sectorDefaults.visual}. ${day?.visualDirection ?? ""}`.trim(),
    visualQuality:
      "Ajans kalitesinde premium sosyal medya tasarımı: katmanlı kompozisyon, okunaklı tipografi, gerçekçi veya üst düzey illüstrasyon — asla clip art veya amatör çizim değil.",
    subtextOnImage: null,
    onImageTextRules:
      "Görselde YALNIZCA büyük kutlama başlığı + köşede küçük marka adı/logo. Müşterinin ham cümlesini, hizmet listesini veya uzun sloganı görsele yazma.",
    avoidOnImage: [
      ...UNIVERSAL_AVOID,
      ...(sectorMod?.avoidRules ? [sectorMod.avoidRules] : []),
      ...(day?.avoidRules ? [day.avoidRules] : []),
    ],
    ...harmony,
  };
}

export async function buildBrandCreativeBrief(
  context: BrandContext,
  day?: SpecialDayContext,
): Promise<BrandCreativeBrief> {
  const fallback = buildFallbackBrief(context, day);
  const sectorMod = getSectorModifier(context.sector);
  const sectorLabel =
    sectors.find((item) => item.key === context.sector)?.label ?? context.customSector ?? "";
  const styleLabel = styles.find((item) => item.key === context.visualStyle)?.name ?? context.visualStyle;
  const rawInput = context.brandDescription?.trim() || "Müşteri kısa veya eksik bilgi verdi";

  if (!isGeminiConfigured()) {
    return fallback;
  }

  try {
    const text = await generateTextWithGemini(
      [
        "Sen Türkiye KOBİ'leri için çalışan KIDEMLİ MARKA YÖNETİCİSİ ve kreatif direktörsün.",
        "TÜM sektörlerde (güzellik, kafe, diş, emlak, eğitim, ajans, spor vb.) aynı kalitede brief yazarsın.",
        "Görevin: müşterinin eksik/bozuk cümlesini profesyonelleştirmek VE seçilen özel günle markayı harmanlamak.",
        "",
        "=== MARKA ===",
        `Marka adı: ${context.brandName}`,
        `Sektör: ${sectorLabel}`,
        `Müşterinin ham cümlesi: "${rawInput}"`,
        `Görsel stil tercihi: ${styleLabel}`,
        `Marka renkleri: ${(context.brandColors?.length ? context.brandColors : [context.primaryColor]).join(", ")}`,
        sectorMod
          ? `Sektör görsel ipuçları: ${sectorMod.visualCues}. Ton: ${sectorMod.toneHints}. Kaçınılacak: ${sectorMod.avoidRules}.`
          : "",
        "",
        "=== ÖZEL GÜN ===",
        day
          ? [
              `Gün: ${day.name} (${day.category})`,
              `Kültürel bağlam: ${day.culturalContext}`,
              `Görsel yön: ${day.visualDirection}`,
              `Başlık seçenekleri: ${day.headlineAlternatives.join(" | ")}`,
              `Caption fikirleri: ${day.captionIdeas.slice(0, 3).join(" | ")}`,
              `Kaçınılacaklar: ${day.avoidRules}`,
            ].join("\n")
          : "Özel gün bilgisi yok",
        "",
        "=== KURALLAR ===",
        "1) positioning: Müşterinin ne iş yaptığını yazım düzelterek 1-2 cümle profesyonel Türkçe.",
        "2) dayHarmony: Bu markanın BU özel günle nasıl bir araya geleceğini 2 cümle anlat (marka + gün uyumu).",
        "3) sceneComposition: Görsel AI için somut sahne tarifi — arka plan, dekor, ışık, kompozisyon, nerede başlık, nerede logo. Clip art yasak, premium tasarım.",
        "4) sectorBlend: Sektör estetiği + özel gün ruhu nasıl birleşir.",
        "5) subtextOnImage: Çoğu durumda null. Sadece çok kısa (max 4 kelime) ve yazımı garanti ise ver.",
        "6) Müşterinin ham cümlesini görsele kopyalama — sadece brief'te kullan.",
        "",
        "JSON dön:",
        JSON.stringify({
          positioning: "string",
          toneOfVoice: "string",
          visualDirection: "string",
          visualQuality: "string",
          dayHarmony: "string",
          sceneComposition: "string",
          sectorBlend: "string",
          subtextOnImage: "null veya string",
          onImageTextRules: "string",
          avoidOnImage: ["string"],
        }),
      ].join("\n"),
    );

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return fallback;

    const parsed = JSON.parse(jsonMatch[0]) as Partial<BrandCreativeBrief>;
    return {
      positioning: parsed.positioning?.trim() || fallback.positioning,
      toneOfVoice: parsed.toneOfVoice?.trim() || fallback.toneOfVoice,
      visualDirection: parsed.visualDirection?.trim() || fallback.visualDirection,
      visualQuality: parsed.visualQuality?.trim() || fallback.visualQuality,
      dayHarmony: parsed.dayHarmony?.trim() || fallback.dayHarmony,
      sceneComposition: parsed.sceneComposition?.trim() || fallback.sceneComposition,
      sectorBlend: parsed.sectorBlend?.trim() || fallback.sectorBlend,
      subtextOnImage:
        parsed.subtextOnImage === null || parsed.subtextOnImage === undefined
          ? null
          : parsed.subtextOnImage.trim() || null,
      onImageTextRules: parsed.onImageTextRules?.trim() || fallback.onImageTextRules,
      avoidOnImage:
        Array.isArray(parsed.avoidOnImage) && parsed.avoidOnImage.length
          ? [...new Set([...parsed.avoidOnImage.map(String), ...UNIVERSAL_AVOID])]
          : fallback.avoidOnImage,
    };
  } catch (error) {
    console.error("Brand brief generation failed, using fallback:", error);
    return fallback;
  }
}
