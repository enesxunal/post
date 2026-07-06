import { getPromptLibraryEntry } from "@/lib/ai/prompt-library";
import { isGeminiConfigured, resolveCaptionProvider } from "@/lib/ai/gemini-config";
import { generateTextWithGemini } from "@/lib/ai/providers/gemini";
import type { BrandContext } from "@/types/domain";

export async function generateCaption(context: BrandContext, dayId: string) {
  const day = getPromptLibraryEntry(dayId);

  const fallback = {
    caption: `${day?.name ?? "Özel gün"} için ${context.brandName} adına kısa, saygılı ve paylaşılabilir bir açıklama.`,
    hashtags: ["#ozelgun", "#sosyalmedya", "#markapostlari"],
  };

  if (isGeminiConfigured() && resolveCaptionProvider() === "gemini") {
    try {
      const text = await generateTextWithGemini(
        [
          `Marka: ${context.brandName}`,
          `Sektör: ${context.sector}`,
          `Özel gün: ${day?.name ?? dayId}`,
          `Marka açıklaması: ${context.brandDescription ?? "yok"}`,
          "Türkçe, kısa, sosyal medya uyumlu 1 caption yaz.",
          "Altına 3 hashtag öner. JSON dön: {\"caption\":\"...\",\"hashtags\":[\"#a\",\"#b\",\"#c\"]}",
        ].join("\n"),
      );

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as {
          caption?: string;
          hashtags?: string[];
        };
        if (parsed.caption) {
          return {
            caption: parsed.caption,
            hashtags: parsed.hashtags ?? fallback.hashtags,
          };
        }
      }
    } catch (error) {
      console.error("Gemini caption generation failed:", error);
    }
  }

  return fallback;
}
