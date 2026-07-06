import { generateTextWithGemini } from "@/lib/ai/providers/gemini";
import { isGeminiConfigured } from "@/lib/ai/gemini-config";
import { sectors } from "@/lib/mock-data";
import type { BrandContext, SectorKey } from "@/types/domain";

export type BrandCreativeBrief = {
  positioning: string;
  toneOfVoice: string;
  visualDirection: string;
  visualQuality: string;
  /** Görselde sadece bu kısa metin (varsa) — yoksa null */
  subtextOnImage: string | null;
  onImageTextRules: string;
  avoidOnImage: string[];
};

const SECTOR_FALLBACK: Partial<Record<SectorKey, { positioning: string; tone: string; visual: string }>> = {
  agency: {
    positioning: "Kurumsal dijital çözümler, web yazılımı ve e-ticaret projeleri üreten profesyonel ajans",
    tone: "kurumsal, güven veren, teknoloji odaklı, premium ajans dili",
    visual: "modern tech agency aesthetic, subtle grid or UI accents, depth and layering, no clip art",
  },
  beauty: {
    positioning: "Güzellik ve bakım hizmeti sunan yerel işletme",
    tone: "zarif, sıcak, güven veren",
    visual: "soft premium beauty brand aesthetic, elegant lighting",
  },
  cafe: {
    positioning: "Kafe veya restoran işletmesi",
    tone: "sıcak, davetkar, samimi",
    visual: "cozy appetizing food & beverage aesthetic",
  },
  dental: {
    positioning: "Diş sağlığı ve ağız bakımı hizmeti",
    tone: "temiz, profesyonel, güvenilir",
    visual: "clinical clean healthcare aesthetic",
  },
  "real-estate": {
    positioning: "Gayrimenkul danışmanlığı ve emlak hizmetleri",
    tone: "kurumsal, güvenilir, modern",
    visual: "architecture and city lifestyle aesthetic",
  },
  education: {
    positioning: "Eğitim ve öğrenme odaklı kurum",
    tone: "ilham veren, güvenilir, umut dolu",
    visual: "clean educational brand aesthetic",
  },
  boutique: {
    positioning: "Perakende ve butik mağaza",
    tone: "şık, davetkar, trend",
    visual: "retail fashion boutique aesthetic",
  },
  "auto-service": {
    positioning: "Otomotiv servis ve bakım hizmeti",
    tone: "güvenilir, profesyonel, çözüm odaklı",
    visual: "automotive service professional aesthetic",
  },
  fitness: {
    positioning: "Spor ve fitness hizmeti",
    tone: "enerjik, motive edici, dinamik",
    visual: "athletic energetic fitness aesthetic",
  },
  nutrition: {
    positioning: "Beslenme ve sağlıklı yaşam danışmanlığı",
    tone: "sağlıklı, güven veren, bilimsel",
    visual: "wellness nutrition aesthetic",
  },
  other: {
    positioning: "Yerel KOBİ işletmesi",
    tone: "samimi, profesyonel, güven veren",
    visual: "clean modern small business aesthetic",
  },
};

function inferFromRawDescription(raw: string): Partial<BrandCreativeBrief> {
  const lower = raw.toLowerCase();
  const hints: Partial<BrandCreativeBrief> = {};

  if (
    lower.includes("e-ticaret") ||
    lower.includes("eticaret") ||
    lower.includes("e ticaret") ||
    lower.includes("yazılım") ||
    lower.includes("yazilim") ||
    lower.includes("web") ||
    lower.includes("ajans") ||
    lower.includes("dijital")
  ) {
    hints.positioning =
      "Kurumsal web siteleri, e-ticaret yazılımları ve dijital çözümler sunan profesyonel ajans";
    hints.toneOfVoice = "kurumsal, teknoloji odaklı, güven veren, premium ajans dili";
    hints.visualDirection =
      "modern dijital ajans estetiği, derinlik ve katmanlı kompozisyon, ince grid veya UI dokunuşları";
    hints.visualQuality =
      "ajans kalitesinde, premium, profesyonel sosyal medya tasarımı — clip art ve çocuk çizimi YASAK";
    hints.subtextOnImage = null;
  }

  if (lower.includes("güzellik") || lower.includes("kuaför") || lower.includes("bakım")) {
    hints.positioning = "Güzellik ve kişisel bakım hizmeti sunan işletme";
  }

  if (lower.includes("kafe") || lower.includes("restoran") || lower.includes("kahve")) {
    hints.positioning = "Kafe veya restoran işletmesi";
  }

  return hints;
}

function buildFallbackBrief(context: BrandContext): BrandCreativeBrief {
  const sectorLabel =
    sectors.find((item) => item.key === context.sector)?.label ??
    context.customSector ??
    "KOBİ";
  const sectorDefaults = SECTOR_FALLBACK[context.sector] ?? SECTOR_FALLBACK.other!;
  const inferred = inferFromRawDescription(context.brandDescription ?? "");

  const positioning =
    inferred.positioning ??
    (context.brandDescription?.trim().length
      ? `${context.brandName}: ${context.brandDescription.trim()}`
      : `${context.brandName} — ${sectorDefaults.positioning}`);

  return {
    positioning,
    toneOfVoice: inferred.toneOfVoice ?? sectorDefaults.tone,
    visualDirection: inferred.visualDirection ?? sectorDefaults.visual,
    visualQuality:
      inferred.visualQuality ??
      "premium professional social media design, layered composition, refined typography — never clip art or stick figures",
    subtextOnImage: inferred.subtextOnImage ?? null,
    onImageTextRules:
      "Görselde YALNIZCA büyük kutlama başlığı + köşede küçük marka adı/logo. Hizmet açıklaması, slogan veya uzun cümle EKLEME.",
    avoidOnImage: [
      "clip art",
      "stick figure children",
      "amatör çizim",
      "yazım hatalı Türkçe",
      "gereksiz alt slogan",
      "hizmet listesi",
      "fazla metin bloğu",
    ],
  };
}

export async function buildBrandCreativeBrief(
  context: BrandContext,
  specialDayName?: string,
): Promise<BrandCreativeBrief> {
  const fallback = buildFallbackBrief(context);
  const sectorLabel =
    sectors.find((item) => item.key === context.sector)?.label ?? context.customSector ?? "";

  if (!isGeminiConfigured()) {
    return fallback;
  }

  const rawInput = context.brandDescription?.trim() || "Müşteri detay vermedi";

  try {
    const text = await generateTextWithGemini(
      [
        "Sen Türkiye'deki KOBİ'ler için çalışan kıdemli bir marka ve kreatif direktörsün.",
        "Müşterinin kısa, eksik veya bozuk cümlelerini profesyonel marka diline çeviriyorsun.",
        "",
        `Marka adı: ${context.brandName}`,
        `Sektör seçimi: ${sectorLabel}`,
        `Müşterinin kendi cümlesi (ham): "${rawInput}"`,
        specialDayName ? `Özel gün: ${specialDayName}` : "",
        `Görsel stil tercihi: ${context.visualStyle}`,
        "",
        "Görev:",
        "1) Müşterinin ne iş yaptığını 1-2 cümlede PROFESYONEL Türkçe ile yaz (yazım düzelt, anlamı netleştir).",
        "2) Sosyal medya görseli için ton ve görsel yön belirle.",
        "3) Görselde alt metin/slogan gerekiyorsa EN FAZLA 4 kelimelik, yazımı kusursuz bir ifade öner; gerekmiyorsa null ver.",
        "4) Ajans/kurumsal markalar için görselde genelde SLOGAN OLMAMALI — subtextOnImage null olsun.",
        "",
        "JSON dön:",
        JSON.stringify({
          positioning: "string",
          toneOfVoice: "string",
          visualDirection: "string",
          visualQuality: "string",
          subtextOnImage: "string veya null",
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
      subtextOnImage:
        parsed.subtextOnImage === null || parsed.subtextOnImage === undefined
          ? null
          : parsed.subtextOnImage.trim() || null,
      onImageTextRules: parsed.onImageTextRules?.trim() || fallback.onImageTextRules,
      avoidOnImage:
        Array.isArray(parsed.avoidOnImage) && parsed.avoidOnImage.length
          ? parsed.avoidOnImage.map(String)
          : fallback.avoidOnImage,
    };
  } catch (error) {
    console.error("Brand brief generation failed, using fallback:", error);
    return fallback;
  }
}
