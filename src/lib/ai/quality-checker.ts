import { analyzeImageWithGemini } from "@/lib/ai/providers/gemini";
import { isGeminiConfigured } from "@/lib/ai/gemini-config";

export type QualityCheckResult = {
  passed: boolean;
  issues: string[];
  severity: "low" | "medium" | "high";
};

export async function checkGeneratedImageQuality(input: {
  imageUrl: string;
  expectedHeadline: string;
  brandName: string;
}): Promise<QualityCheckResult> {
  const fallbackPass: QualityCheckResult = { passed: true, issues: [], severity: "low" };

  if (!isGeminiConfigured()) {
    return fallbackPass;
  }

  try {
    const text = await analyzeImageWithGemini(
      [
        "Sen Türk sosyal medya görsel kalite kontrol uzmanısın.",
        `Marka: ${input.brandName}`,
        `Görselde olması beklenen Türkçe başlık: "${input.expectedHeadline}"`,
        "",
        "Bu Instagram kare post görselini incele ve şunları kontrol et:",
        "1) Türkçe yazım hatası veya anlamsız/bozuk metin var mı?",
        "2) Metin okunmuyor veya çok küçük mü?",
        "3) Logo veya marka alanı bozuk/distorsiyonlu mu?",
        "4) Görsel çok basit, boş veya amatör mü (sadece düz renk + tek kelime)?",
        "5) AI artefaktı, fazla parmak, garip tipografi var mı?",
        "",
        "Sadece JSON dön:",
        '{"passed":true,"issues":[],"severity":"low"}',
        "passed=false yap eğer yazım hatası, okunmayan metin veya ciddi görsel hata varsa.",
        'severity: "high" ciddi hata, "medium" orta, "low" kabul edilebilir.',
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
