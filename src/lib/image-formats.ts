export type PostFormat = "square" | "portrait-1080x1350" | "landscape-1350x1080";

export type ImageAspectRatio = "1:1" | "4:5" | "5:4" | "9:16";

/** Eski siparişlerdeki yatay anahtarı dikeye çevirir (UI'da yanlış etiketlenmişti). */
export function normalizePostFormat(format?: string): PostFormat {
  if (format === "landscape-1350x1080" || format === "portrait-1080x1350") {
    return "portrait-1080x1350";
  }
  return "square";
}

export const POST_FORMAT_OPTIONS: Array<{
  key: PostFormat;
  label: string;
  size: string;
  description: string;
  aspectRatio: ImageAspectRatio;
}> = [
  {
    key: "square",
    label: "Kare post",
    size: "1080×1080",
    description: "Klasik Instagram kare gönderi",
    aspectRatio: "1:1",
  },
  {
    key: "portrait-1080x1350",
    label: "Dikey feed",
    size: "1080×1350",
    description: "Instagram dikey gönderi (4:5)",
    aspectRatio: "4:5",
  },
];

export const STORY_FORMAT = {
  label: "Story",
  size: "1080×1920",
  aspectRatio: "9:16" as ImageAspectRatio,
};

export function resolveAspectRatio(format?: string): ImageAspectRatio {
  const normalized = normalizePostFormat(format);
  return POST_FORMAT_OPTIONS.find((item) => item.key === normalized)?.aspectRatio ?? "1:1";
}

export function getPostFormatLabel(format?: string) {
  const normalized = normalizePostFormat(format);
  return POST_FORMAT_OPTIONS.find((item) => item.key === normalized)?.size ?? "1080×1080";
}

export function getPreviewAspectClass(format?: string) {
  const normalized = normalizePostFormat(format);
  if (normalized === "portrait-1080x1350") return "aspect-[4/5]";
  return "aspect-square";
}

/** Prompt + bindirme için güvenli alan (kenar boşlukları) */
export function getSafeZoneInsets(width: number, height: number) {
  const portrait = height > width;
  return {
    top: Math.round(height * (portrait ? 0.14 : 0.12)),
    bottom: Math.round(height * (portrait ? 0.2 : 0.14)),
    sides: Math.round(width * 0.08),
  };
}

/** Instagram feed + story güvenli alan kuralları — prompt'a eklenir */
export function buildSafeZonePrompt(kind: "post" | "story", format?: string) {
  const normalized = normalizePostFormat(format);
  const postRule =
    normalized === "portrait-1080x1350"
      ? "SAFE ZONE (1080x1350): Tüm metin ve odak öğeleri kenarlardan en az %8 içeride. Alt %18 ve üst %10 bölgesini sade bırak (logo otomatik eklenir). Dikey kompozisyon — yatay değil."
      : "SAFE ZONE (1080x1080): Tüm metin, logo ve odak öğeleri her kenardan en az %8 içeride. Merkez ağırlıklı kompozisyon; köşelere kritik metin koyma.";

  const storyRule =
    "SAFE ZONE (1080x1920 Story): Kritik metin ve logo üstten %12, alttan %18, yanlardan %6 içeride kalsın (profil çubuğu ve yanıt alanı için). Ana mesaj dikey orta bölgede.";

  return kind === "story" ? storyRule : postRule;
}

export function buildFormatPromptLine(format?: string) {
  const normalized = normalizePostFormat(format);
  if (normalized === "portrait-1080x1350") {
    return "OUTPUT FORMAT: 1080x1350 pixels PORTRAIT vertical Instagram feed post (4:5). Taller than wide — NOT landscape.";
  }
  return "OUTPUT FORMAT: 1080x1080 pixels square Instagram feed post (1:1).";
}
