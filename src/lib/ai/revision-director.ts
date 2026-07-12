import { generateTextWithGemini } from "@/lib/ai/providers/gemini";
import { isGeminiConfigured } from "@/lib/ai/gemini-config";
import { DEFAULT_REVISION_DIRECTIVE } from "@/lib/generation/design-metadata";
import type { ArtDirection } from "@/lib/ai/art-direction";
import type { BrandContext } from "@/types/domain";
import type { SpecialDay } from "@/types/domain";

type RevisionDirectorInput = {
  context: BrandContext;
  day: SpecialDay;
  userNote?: string;
  previousArtDirection?: ArtDirection | null;
};

function buildFallbackRevisionDirective(input: RevisionDirectorInput): string {
  const userRequest = input.userNote?.trim() || DEFAULT_REVISION_DIRECTIVE;
  const layout = input.previousArtDirection?.layout?.replace(/-/g, " ") ?? "önceki düzen";
  const focus = input.previousArtDirection?.visualFocus?.replace(/-/g, " ") ?? "önceki odak";

  return [
    "REVISION MODE — customer rejected the previous visual.",
    `Customer request (Turkish): "${userRequest}"`,
    `Avoid repeating previous layout (${layout}) and visual focus (${focus}).`,
    "Create a clearly different premium alternative for the same special day and brand.",
    "Change composition, sector-native props, color balance, and atmosphere — not just tiny tweaks.",
  ].join(" ");
}

export async function buildRevisionCreativeDirective(
  input: RevisionDirectorInput,
): Promise<string> {
  const userRequest = input.userNote?.trim() || DEFAULT_REVISION_DIRECTIVE;
  const fallback = buildFallbackRevisionDirective(input);

  if (!isGeminiConfigured()) {
    return fallback;
  }

  try {
    const text = await generateTextWithGemini(
      [
        "Sen Türkiye'de çalışan kıdemli marka yöneticisi ve kreatif direktörsün.",
        "Müşteri hazır bir sosyal medya görselini beğenmedi ve revizyon istiyor.",
        "Görevin: müşterinin Türkçe talebini okuyup, aynı özel gün ve marka için YENİ bir görsel brief'i yazmak.",
        "",
        `Marka: ${input.context.brandName}`,
        `Sektör: ${input.context.sector}`,
        `Özel gün: ${input.day.name}`,
        `Kültürel bağlam: ${input.day.culturalContext}`,
        `Müşteri talebi: "${userRequest}"`,
        input.previousArtDirection
          ? `Önceki kompozisyon: ${input.previousArtDirection.layout}, odak: ${input.previousArtDirection.visualFocus}, yoğunluk: ${input.previousArtDirection.density}`
          : "Önceki kompozisyon bilgisi yok",
        "",
        "Kurallar:",
        "1) Müşterinin yazdığı talebi mutlaka dikkate al — görmezden gelme.",
        "2) Önceki görselle karıştırılmayacak kadar farklı yön öner.",
        "3) Özel günün ruhu korunmalı; marka sadece aksan.",
        "4) Somut sahne, renk, dekor ve kompozisyon öner — 4-6 cümle, Türkçe.",
        "5) Başlık metnini değiştirme; sadece görsel yönü anlat.",
        "6) JSON veya madde işareti kullanma; düz metin dön.",
      ].join("\n"),
    );

    const cleaned = text.trim().replace(/^["']|["']$/g, "");
    return cleaned.length >= 40 ? cleaned : fallback;
  } catch {
    return fallback;
  }
}
