import { analyzeImageWithGemini } from "@/lib/ai/providers/gemini";
import { isPlaceholderImageUrl } from "@/lib/ai/image-provider";
import { isGeminiConfigured } from "@/lib/ai/gemini-config";
import { buildOccasionCreativeGuide } from "@/lib/ai/occasion-creative-guide";
import type { BrandCreativeBrief } from "@/lib/ai/brand-creative-director";
import type { SpecialDayCategory } from "@/types/domain";

export type QualityCheckResult = {
  passed: boolean;
  issues: string[];
  severity: "low" | "medium" | "high";
};

export type QualityCheckContext = {
  imageUrl: string;
  expectedHeadline: string;
  brandName: string;
  brandBrief?: BrandCreativeBrief;
  dayName?: string;
  dayCategory?: SpecialDayCategory;
  culturalContext?: string;
};

export async function checkGeneratedImageQuality(
  input: QualityCheckContext,
): Promise<QualityCheckResult> {
  const fallbackPass: QualityCheckResult = { passed: true, issues: [], severity: "low" };

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

  const allowedSubtext = input.brandBrief?.subtextOnImage;
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

  try {
    const text = await analyzeImageWithGemini(
      [
        "Sen Türk sosyal medya görsel kalite kontrol uzmanısın. Ruhsuz, konudan kopuk veya yazım hatalı görselleri REDDET.",
        "",
        `Özel gün: ${input.dayName ?? "bilinmiyor"} (${input.dayCategory ?? "?"})`,
        input.culturalContext ? `Kültürel bağlam: ${input.culturalContext}` : "",
        occasionGuide ? `Beklenen ruh: ${occasionGuide.soul}` : "",
        `Marka: "${input.brandName}"`,
        `Beklenen başlık (birebir): "${input.expectedHeadline}"`,
        allowedSubtext
          ? `İzin verilen tek ikincil metin: "${allowedSubtext}"`
          : "İkincil metin/cümle OLMAMALI — sadece başlık + logo.",
        "",
        "KONTROL:",
        "1) Türkçe yazım hatası? (ye/ve, yalda/yılda, yanınızdaız, Çözüllmeri, Áğostos, Agustos)",
        "2) Başlık beklenenle uyumlu ve doğru mu?",
        "3) İzinsiz alt slogan veya müşteri açıklaması var mı?",
        "4) Clip art / amatör çizim?",
        "5) Görsel RUHSUZ mu? (soğuk tech grid, hologram, chip, cyberpunk — özel güne uymuyorsa REDDET)",
        "6) Özel gün ilk bakışta anlaşılıyor mu? Konuya uygun dekor/sembol var mı?",
        "7) Milli bayramda bayrak veya güçlü kırmızı-beyaz kimlik var mı?",
        "8) Bayram/kandilde sıcak manevi atmosfer var mı? (holografik hilal REDDET)",
        "9) Logo bozuk mu?",
        "",
        "passed=false: yazım hatası, ruhsuz jenerik tech şablon, konudan kopukluk, izinsiz metin.",
        'JSON: {"passed":true,"issues":[],"severity":"low"}',
      ].join("\n"),
      input.imageUrl,
    );

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return fallbackPass;

    const parsed = JSON.parse(jsonMatch[0]) as Partial<QualityCheckResult>;
    const severity = parsed.severity ?? "low";

    return {
      passed: Boolean(parsed.passed),
      issues: Array.isArray(parsed.issues) ? parsed.issues.map(String) : [],
      severity: severity === "high" || severity === "medium" ? severity : "low",
    };
  } catch (error) {
    console.error("Quality check failed, allowing image:", error);
    return fallbackPass;
  }
}

export function shouldRetryQualityCheck(result: QualityCheckResult) {
  if (result.passed) return false;
  return result.severity === "high" || result.severity === "medium";
}
