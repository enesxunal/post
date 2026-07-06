import { sectorModifiers, styles } from "@/lib/mock-data";
import { getPromptLibraryEntry } from "@/lib/ai/prompt-library";
import type { BrandContext, PromptPreview } from "@/types/domain";

export async function composeImagePrompt(
  context: BrandContext,
  dayId: string,
): Promise<PromptPreview> {
  const day = await getPromptLibraryEntry(dayId);
  const sector = sectorModifiers.find((item) => item.key === context.sector);
  const style = styles.find((item) => item.key === context.visualStyle);

  const headline =
    day?.headlineAlternatives[0] ?? `${context.brandName} — ${day?.name ?? "Özel Gün"}`;

  const captionHint = day?.captionIdeas?.slice(0, 2).join(" | ") ?? "";

  const prompt = [
    day?.promptTemplate,
    `Marka adı: ${context.brandName}.`,
    `Marka renkleri (öncelik sırasıyla): ${(context.brandColors?.length ? context.brandColors : [context.primaryColor]).join(", ")}.`,
    `Marka açıklaması: ${context.brandDescription ?? "Yerel KOBİ işletmesi"}.`,
    `Sektör: ${sector?.promptModifier ?? context.customSector ?? "genel KOBİ"}.`,
    `Stil: ${style?.promptModifier ?? "temiz modern"}.`,
    `Kültürel bağlam: ${day?.culturalContext ?? "Türkiye kültürüne uygun, saygılı ton."}`,
    `Görsel yön: ${day?.visualDirection ?? "premium, sade, mobil uyumlu"}.`,
    captionHint ? `Caption ilhamı: ${captionHint}.` : null,
    `Görselde Türkçe başlık olarak şunu kullan: "${headline}".`,
    "Instagram kare post (1:1), okunaklı Türkçe tipografi, marka logosu için net alan.",
    "Logo oranını bozma, gereksiz İngilizce metin ekleme, kalabalık kompozisyondan kaçın.",
    "Dini ve milli günlerde saygılı, abartısız görsel dil kullan.",
  ]
    .filter(Boolean)
    .join(" ");

  const negativePrompt = [
    day?.avoidRules,
    "okunmayan Türkçe",
    "bozuk bayrak",
    "bozuk dini sembol",
    "bozuk logo",
    "rastgele fazla yazı",
    "watermark",
    "düşük çözünürlük",
  ]
    .filter(Boolean)
    .join(", ");

  return { headline, prompt, negativePrompt };
}
