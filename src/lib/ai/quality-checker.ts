import { analyzeImageWithGemini } from "@/lib/ai/providers/gemini";
import { isGeminiConfigured } from "@/lib/ai/gemini-config";
import type { BrandCreativeBrief } from "@/lib/ai/brand-creative-director";

export type QualityCheckResult = {
  passed: boolean;
  issues: string[];
  severity: "low" | "medium" | "high";
};

export async function checkGeneratedImageQuality(input: {
  imageUrl: string;
  expectedHeadline: string;
  brandName: string;
  brandBrief?: BrandCreativeBrief;
  isNationalDay?: boolean;
}): Promise<QualityCheckResult> {
  const fallbackPass: QualityCheckResult = { passed: true, issues: [], severity: "low" };

  if (!isGeminiConfigured()) {
    return fallbackPass;
  }

  const allowedSubtext = input.brandBrief?.subtextOnImage;

  try {
    const text = await analyzeImageWithGemini(
      [
        "Sen Türk sosyal medya görsel kalite kontrol uzmanısın. Müşteriye sunulmadan önce görseli reddet veya onayla.",
        "",
        `Marka adı (doğru yazım): "${input.brandName}"`,
        `Beklenen ana başlık: "${input.expectedHeadline}"`,
        allowedSubtext
          ? `İzin verilen tek ikincil metin: "${allowedSubtext}"`
          : "İkincil metin/slogan/hizmet açıklaması OLMAMALI — sadece başlık + marka adı.",
        input.brandBrief?.positioning
          ? `Marka konumlandırma (görselde paragraf olarak YAZILMAMALI): ${input.brandBrief.positioning}`
          : "",
        "",
        "KONTROL LİSTESİ:",
        "1) Türkçe yazım hatası var mı? (ör: Çözülmeri, E-Ticaret yanlış yazım)",
        "2) Marka adı doğru yazılmış mı?",
        "3) İzin verilmeyen slogan, hizmet listesi veya uzun alt cümle var mı?",
        "4) Clip art, stick figure, amatör çizim, çocuk karakteri çizimi var mı?",
        "5) Görsel çok basit mi (düz arka plan + tek kelime)?",
        "6) Metin okunmuyor mu, logo bozuk mu?",
        input.isNationalDay
          ? "7) Milli bayram görseli: Türk bayrağı (kırmızı-beyaz ay-yıldız) var mı? Bilim kurgu/soyut blok estetiği uygun mu?"
          : "",
        input.isNationalDay
          ? "8) Başlıkta Türkçe yazım doğru mu? (ör: Ağustos — Áğostus veya Agustos YANLIŞ)"
          : "",
        "",
        "passed=false yap: yazım hatası, clip art, izinsiz alt metin, amatör/basit görsel.",
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
