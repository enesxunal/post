import { analyzeImageWithGemini } from "@/lib/ai/providers/gemini";
import { isPlaceholderImageUrl } from "@/lib/ai/image-provider";
import { isGeminiConfigured } from "@/lib/ai/gemini-config";
import { QUALITY_CHECK_ENABLED } from "@/lib/config";
import { buildOccasionCreativeGuide } from "@/lib/ai/occasion-creative-guide";
import { isLeanGenerationMode } from "@/lib/generation/generation-mode";
import type { CreativeBrief } from "@/lib/ai/creative-brief";
import type { SpecialDayCategory } from "@/types/domain";

export type QualityCheckResult = {
  passed: boolean;
  issues: string[];
  severity: "low" | "medium" | "high";
};

export type QualityCheckPhase = "pre-overlay" | "final";

export type QualityCheckContext = {
  imageUrl: string;
  expectedHeadline: string;
  brandName: string;
  brandBrief?: CreativeBrief;
  dayName?: string;
  dayCategory?: SpecialDayCategory;
  culturalContext?: string;
  logoComposited?: boolean;
  headlineOverlay?: boolean;
  phase?: QualityCheckPhase;
};

function parseQualityJson(text: string): QualityCheckResult | null {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  const parsed = JSON.parse(jsonMatch[0]) as Partial<QualityCheckResult>;
  const severity = parsed.severity ?? "low";

  return {
    passed: Boolean(parsed.passed),
    issues: Array.isArray(parsed.issues) ? parsed.issues.map(String) : [],
    severity: severity === "high" || severity === "medium" ? severity : "low",
  };
}

function buildEssentialCheckPrompt(input: QualityCheckContext) {
  const phase = input.phase ?? "final";

  if (phase === "pre-overlay") {
    return [
      "Sen Türk sosyal medya görsel kalite kontrol uzmanısın.",
      "Bu görsel henüz başlık ve logo bindirilmeden ÖNCE üretildi.",
      `Marka: "${input.brandName}"`,
      input.dayName ? `Özel gün: ${input.dayName}` : "",
      "",
      "REDDET (passed=false, severity=high) eğer:",
      `- Görselde "${input.brandName}" yazısı veya marka logosu/ikonu var (AI çizimi)`,
      "- Alt slogan, ekstra Türkçe cümle veya tagline var",
      "- Metin veya logo çerçeveye çok yakın (kenardan %8 içeride değil)",
      "- Üniforma/rozet üzerinde marka adı veya logo var",
      "",
      'JSON: {"passed":true,"issues":[],"severity":"low"}',
    ]
      .filter(Boolean)
      .join("\n");
  }

  return [
    "Sen Türkçe sosyal medya görsel yazım kontrol uzmanısın.",
    "SADECE görseldeki yazıları oku ve başlığın doğru yazılıp yazılmadığını kontrol et.",
    "",
    `Beklenen başlık (anlam ve yazım birebir olmalı): "${input.expectedHeadline}"`,
    `Marka: "${input.brandName}"`,
    input.dayName ? `Özel gün: ${input.dayName}` : "",
    input.logoComposited
      ? "Logo görsele sonradan eklendi — logo kontrolü yapma."
      : "",
    input.headlineOverlay
      ? "Başlık görsele sonradan bindirildi — sadece bu başlık olmalı, başka hiçbir yazı/URL/footer/ikon metni OLMAMALI."
      : "",
    "",
    "LAYOUT:",
    "- Tüm metin ve logo kenarlardan en az %8 içeride olmalı (üst/alt/yan safe zone)",
    "- Marka logosu veya adı birden fazla kez görünmemeli",
    input.logoComposited
      ? `- AI çizimi marka logosu OLMAMALI — sadece bindirilen gerçek logo kabul`
      : "",
    "",
    "REDDET (passed=false, severity=high) eğer:",
    "- Türkçe karakterler yanlış veya eksik (Ağustos → Agustos, AĞÜ TUS, Áğostos)",
    "- Kelime bölünmüş veya harf atlanmış",
    "- Başlık tamamen farklı veya anlamsız",
    "- Görselde beklenmeyen ekstra Türkçe cümle/slogan var",
    "- Metin veya logo çerçeveye yapışık (safe zone ihlali)",
    "- Marka adı veya logo 2+ kez görünüyor",
    "",
    "Örnek hatalar: '30 AĞÜ TUS', 'Kutlu Olsun' doğru ama üst satır yanlışsa REDDET.",
    "",
    'JSON: {"passed":true,"issues":[],"severity":"low"}',
  ]
    .filter(Boolean)
    .join("\n");
}

function buildFullCheckPrompt(input: QualityCheckContext) {
  const allowedSubtext = undefined;
  const occasionGuide =
    input.dayName && input.dayCategory
      ? buildOccasionCreativeGuide({
          id: input.dayName,
          slug: input.dayName,
          name: input.dayName,
          category: input.dayCategory,
          dateType: "fixed",
          dateValue: "",
          importance: "medium",
          culturalContext: input.culturalContext ?? "",
          popularUsages: [],
          headlineAlternatives: [input.expectedHeadline],
          captionIdeas: [],
          visualDirection: "",
          avoidRules: "",
          promptTemplate: "",
          isDefaultSelected: false,
        })
      : null;

  return [
    "Sen Türk sosyal medya görsel kalite kontrol uzmanısın. Ruhsuz, konudan kopuk veya yazım hatalı görselleri REDDET.",
    "",
    `Özel gün: ${input.dayName ?? "bilinmiyor"} (${input.dayCategory ?? "?"})`,
    input.culturalContext ? `Kültürel bağlam: ${input.culturalContext}` : "",
    input.brandBrief
      ? `Beklenen ruh: ${input.brandBrief.occasion.emotionalGoal}`
      : occasionGuide
        ? `Beklenen ruh: ${occasionGuide.soul}`
        : "",
    `Marka: "${input.brandName}"`,
    `Beklenen başlık (birebir): "${input.expectedHeadline}"`,
    allowedSubtext
      ? `İzin verilen tek ikincil metin: "${allowedSubtext}"`
      : "İkincil metin/cümle OLMAMALI — sadece başlık + logo.",
    input.logoComposited ? "Logo sonradan bindirildi — logo şekli kontrol edilmesin." : "",
    input.headlineOverlay
      ? "Başlık programatik bindirildi — görselde SADECE bu başlık yazmalı; sahte Türkçe, footer, sosyal ikon, URL varsa REDDET."
      : "",
    "",
    "LAYOUT:",
    "9) Metin/logo kenarlardan en az %8 içeride mi? Yapışıksa REDDET.",
    "10) Marka logosu veya adı birden fazla kez mi? (çift logo) REDDET.",
    input.logoComposited
      ? "11) AI çizimi marka logosu var mı? (bindirilen dışında) REDDET."
      : "",
    "",
    "KONTROL:",
    "1) Türkçe yazım hatası? (Ağustos→Agustos, AĞÜ TUS, Áğostos, ye/ve karışıklığı)",
    "2) Başlık beklenenle uyumlu ve doğru mu?",
    "3) İzinsiz alt slogan veya müşteri açıklaması var mı?",
    "4) Clip art / amatör çizim?",
    "5) Görsel RUHSUZ mu? (soğuk tech grid, hologram, chip, cyberpunk — özel güne uymuyorsa REDDET)",
    "6) Özel gün ilk bakışta anlaşılıyor mu?",
    "7) Milli bayramda bayrak veya güçlü kırmızı-beyaz kimlik var mı?",
    "8) Bayram/kandilde sıcak manevi atmosfer var mı?",
    "",
    "passed=false: yazım hatası, ruhsuz jenerik şablon, konudan kopukluk, izinsiz metin, safe zone ihlali, çift logo.",
    'JSON: {"passed":true,"issues":[],"severity":"low"}',
  ].join("\n");
}

export function isQualityCheckEnabled() {
  return QUALITY_CHECK_ENABLED;
}

export async function checkGeneratedImageQuality(
  input: QualityCheckContext,
): Promise<QualityCheckResult> {
  const fallbackPass: QualityCheckResult = { passed: true, issues: [], severity: "low" };

  if (!QUALITY_CHECK_ENABLED) {
    return fallbackPass;
  }

  if (isPlaceholderImageUrl(input.imageUrl)) {
    return {
      passed: false,
      issues: ["Placeholder görsel — gerçek AI görseli üretilmemiş"],
      severity: "high",
    };
  }

  if (!isGeminiConfigured()) {
    return fallbackPass;
  }

  const lean = isLeanGenerationMode();

  try {
    const prompt = lean ? buildEssentialCheckPrompt(input) : buildFullCheckPrompt(input);
    const text = await analyzeImageWithGemini(prompt, input.imageUrl);
    const parsed = parseQualityJson(text);
    if (!parsed) return fallbackPass;

    if (lean && !parsed.passed && parsed.severity === "low") {
      return { ...parsed, severity: "high" };
    }

    return parsed;
  } catch (error) {
    console.error("Quality check failed, allowing image:", error);
    return fallbackPass;
  }
}

export function shouldRetryQualityCheck(result: QualityCheckResult) {
  if (result.passed) return false;
  return result.severity === "high" || result.severity === "medium";
}
