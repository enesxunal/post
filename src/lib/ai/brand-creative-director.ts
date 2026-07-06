import { generateTextWithGemini } from "@/lib/ai/providers/gemini";
import { isGeminiConfigured } from "@/lib/ai/gemini-config";
import { buildOccasionCreativeGuide } from "@/lib/ai/occasion-creative-guide";
import { formatSectorRuleForBrief } from "@/lib/sectors/build-sector-prompt";
import { getSectorOptionsFromSeed, getSectorRule } from "@/lib/sectors/repository";
import { formatStyleRuleForBrief } from "@/lib/styles/build-style-prompt";
import { getStyleRuleFromSeed, resolveStyleName } from "@/lib/styles/seed-data";
import type { BrandContext, SectorKey, SectorRule, SpecialDay, StyleRule } from "@/types/domain";

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
  sectorRule?: SectorRule,
  selectedHeadline?: string,
): Pick<BrandCreativeBrief, "dayHarmony" | "sceneComposition" | "sectorBlend"> {
  const dayName = day?.name ?? "özel gün";
  const sectorLabel =
    getSectorOptionsFromSeed().find((item) => item.key === context.sector)?.label ??
    context.customSector ??
    "KOBİ";
  const occasionGuide = day
    ? buildOccasionCreativeGuide({
        id: day.name,
        slug: day.name,
        name: day.name,
        category: day.category,
        dateType: "fixed",
        dateValue: "",
        importance: "medium",
        culturalContext: day.culturalContext,
        popularUsages: [],
        headlineAlternatives: day.headlineAlternatives,
        captionIdeas: day.captionIdeas,
        visualDirection: day.visualDirection,
        avoidRules: day.avoidRules,
        promptTemplate: "",
        isDefaultSelected: false,
      })
    : null;
  const headline = selectedHeadline ?? day?.headlineAlternatives[0] ?? dayName;

  const sectorAccent =
    sectorRule?.suitableElements.slice(0, 2).join(", ") ?? sectorRule?.visualCues ?? "profesyonel";

  return {
    dayHarmony: `${context.brandName} (${sectorLabel}) için ${dayName}: ${occasionGuide?.soul ?? day?.culturalContext ?? "saygılı kutlama"}. Marka sektörü sadece ince aksan — özel günün ruhu öncelikli.`,
    sceneComposition: [
      `Ana başlık (büyük, hatasız Türkçe): "${headline}".`,
      `Sahne ruhu: ${occasionGuide?.visualMetaphors.slice(0, 2).join("; ") ?? day?.visualDirection ?? "kutlama"}.`,
      `Kültürel öğeler: ${occasionGuide?.culturalElements.slice(0, 3).join(", ") ?? "konuya uygun dekor"}.`,
      `Renk ve kompozisyon: ${sectorRule?.colorHints ?? "marka rengine uyumlu"}. ${sectorRule?.compositionHints ?? ""}`.trim(),
      context.sector === "agency"
        ? "Ajans markası: katmanlı premium dijital estetik kullanılabilir — özel gün atmosferi ana sahne."
        : `Sektör aksanı (arka plan detayı): ${sectorAccent}.`,
      `${context.brandName} logosu köşede küçük. Sıcak, paylaşılabilir, kültürel olarak doğru kompozisyon.`,
    ].join(" "),
    sectorBlend: [
      `Özel gün kimliği önce (%65), marka aksanı sonra (%35).`,
      sectorRule?.promptModifier ?? "professional local business",
      sectorRule ? `Ton: ${sectorRule.toneHints}.` : "",
      "Aynı gün farklı sektörlerde farklı his vermeli — bu sektörün estetiği günün ruhuna uyumlanmalı.",
    ]
      .filter(Boolean)
      .join(" "),
  };
}

function buildFallbackBrief(
  context: BrandContext,
  day?: SpecialDayContext,
  sectorRule?: SectorRule,
  styleRule?: StyleRule,
): BrandCreativeBrief {
  const sectorDefaults = SECTOR_FALLBACK[context.sector] ?? SECTOR_FALLBACK.other!;
  const styleRuleResolved = styleRule ?? getStyleRuleFromSeed(context.visualStyle);
  const refinedRaw = refineRawDescription(
    context.brandDescription ?? "",
    context.brandName,
    context.sector,
  );
  const harmony = buildFallbackHarmony(context, day, sectorRule);

  const positioning =
    refinedRaw.length > 10
      ? `${context.brandName}: ${refinedRaw}`
      : `${context.brandName} — ${sectorDefaults.positioning}`;

  return {
    positioning,
    toneOfVoice: `${sectorRule?.toneHints ?? sectorDefaults.tone}, ${styleRuleResolved?.description ?? "modern"}`,
    visualDirection: [
      sectorRule?.visualCues ?? sectorDefaults.visual,
      sectorRule?.colorHints ? `Renk: ${sectorRule.colorHints}` : "",
      day?.visualDirection ?? "",
    ]
      .filter(Boolean)
      .join(". ")
      .trim(),
    visualQuality:
      "Ajans kalitesinde premium sosyal medya tasarımı: katmanlı kompozisyon, okunaklı tipografi, gerçekçi veya üst düzey illüstrasyon — asla clip art veya amatör çizim değil.",
    subtextOnImage: null,
    onImageTextRules:
      "Görselde YALNIZCA büyük kutlama başlığı + köşede küçük marka adı/logo. Müşterinin ham cümlesini, hizmet listesini veya uzun sloganı görsele yazma.",
    avoidOnImage: [
      ...UNIVERSAL_AVOID,
      ...(sectorRule?.avoidRules ?? []),
      ...(day?.avoidRules ? [day.avoidRules] : []),
    ],
    ...harmony,
  };
}

export async function buildBrandCreativeBrief(
  context: BrandContext,
  day?: SpecialDayContext,
  options?: { useGemini?: boolean; sectorRule?: SectorRule; styleRule?: StyleRule },
): Promise<BrandCreativeBrief> {
  const sectorRule = options?.sectorRule ?? (await getSectorRule(context.sector));
  const styleRule = options?.styleRule ?? getStyleRuleFromSeed(context.visualStyle);
  const fallback = buildFallbackBrief(context, day, sectorRule, styleRule);

  if (options?.useGemini === false) {
    return fallback;
  }
  const sectorLabel =
    getSectorOptionsFromSeed().find((item) => item.key === context.sector)?.label ??
    context.customSector ??
    "";
  const styleLabel = resolveStyleName(context.visualStyle);
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
        "",
        "=== SEKTÖR KURALLARI (tüm alanları brief'e yansıt — aynı gün farklı sektörlerde farklı his) ===",
        sectorRule ? formatSectorRuleForBrief(sectorRule) : "Sektör kuralı yok",
        "",
        "=== STİL KURALLARI (tüm alanları brief'e yansıt — aynı gün farklı stillerde farklı his) ===",
        styleRule ? formatStyleRuleForBrief(styleRule) : "Stil kuralı yok",
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
        "1) ÖNCELİK: Özel günün kültürel ruhu (%65). Marka sadece aksan (%35). Tech/ajans markalarında chip, grid, hologram YASAK.",
        "2) positioning: Müşterinin ne iş yaptığını yazım düzelterek 1-2 cümle profesyonel Türkçe.",
        "3) dayHarmony: Bu özel günün duygusal/kültürel anlamı + markanın nasıl bir araya geleceği. Ruhsuz şablon değil.",
        "4) sceneComposition: Somut sahne — hangi dekor, hangi semboller, hangi atmosfer, nerede başlık/logo. Konu ilk bakışta anlaşılsın.",
        "5) sectorBlend: Sektör estetiği (description, visual, tone, composition, color, elements) günün ruhuna UYUMLANMALI; günün yerini almamalı.",
        "6) subtextOnImage: Çoğu durumda null. İkincil cümle üretme — yazım hatası riski.",
        "7) Müşterinin ham cümlesini görsele kopyalama.",
        "8) Örnek: 29 Ekim güzellik salonunda zarif premium soft kırmızı-beyaz; kafede sıcak kahve/masa; diş kliniğinde temiz hijyenik; ajansda modern katmanlı premium.",
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
