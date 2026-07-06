import { getPromptLibraryEntry } from "@/lib/ai/prompt-library";
import { isGeminiConfigured, resolveCaptionProvider } from "@/lib/ai/gemini-config";
import { generateTextWithGemini } from "@/lib/ai/providers/gemini";
import type { BrandContext } from "@/types/domain";

export async function generateCaption(context: BrandContext, dayId: string) {
  const day = await getPromptLibraryEntry(dayId);

  const fallback = {
    caption:
      day?.captionIdeas[0] ??
      `${day?.name ?? "Özel gün"} için ${context.brandName} adına kısa, saygılı ve paylaşılabilir bir açıklama.`,
    hashtags: ["#ozelgun", "#sosyalmedya", `#${context.brandName.replace(/\s+/g, "").toLowerCase()}`],
  };

  if (isGeminiConfigured() && resolveCaptionProvider() === "gemini") {
    try {
      const text = await generateTextWithGemini(
        [
          "Sen Türkiye'deki KOBİ'ler için sosyal medya metni yazan bir uzmansın.",
          `Marka: ${context.brandName}`,
          `Sektör: ${context.sector}`,
          `Özel gün: ${day?.name ?? dayId}`,
          `Marka açıklaması: ${context.brandDescription ?? "yerel işletme"}`,
          `Kültürel bağlam: ${day?.culturalContext ?? "saygılı ve sıcak ton"}`,
          `Başlık alternatifleri: ${day?.headlineAlternatives.join(" | ") ?? day?.name}`,
          `Caption fikirleri (bunlardan ilham al): ${day?.captionIdeas.join(" | ") ?? "kutlama mesajı"}`,
          "",
          "Kurallar:",
          "- Türkçe yaz",
          "- 2-4 cümle, Instagram/Facebook için uygun",
          "- Abartılı satış dili kullanma",
          "- Emoji en fazla 2 adet",
          "- Sonuna 3-5 alakalı hashtag ekle",
          "",
          'JSON dön: {"caption":"...","hashtags":["#a","#b","#c"]}',
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
