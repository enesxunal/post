export type PostFormat = "square" | "landscape-1350x1080";

export type ImageAspectRatio = "1:1" | "5:4" | "9:16";

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
    key: "landscape-1350x1080",
    label: "Yatay feed",
    size: "1350×1080",
    description: "Geniş feed formatı (5:4)",
    aspectRatio: "5:4",
  },
];

export const STORY_FORMAT = {
  label: "Story",
  size: "1080×1920",
  aspectRatio: "9:16" as ImageAspectRatio,
};

export function resolveAspectRatio(format: PostFormat): ImageAspectRatio {
  return POST_FORMAT_OPTIONS.find((item) => item.key === format)?.aspectRatio ?? "1:1";
}

export function getPostFormatLabel(format: PostFormat) {
  return POST_FORMAT_OPTIONS.find((item) => item.key === format)?.size ?? "1080×1080";
}

export function getPreviewAspectClass(format: PostFormat) {
  if (format === "landscape-1350x1080") return "aspect-[5/4]";
  return "aspect-square";
}

/** Instagram feed + story güvenli alan kuralları — prompt'a eklenir */
export function buildSafeZonePrompt(kind: "post" | "story", format?: PostFormat) {
  const postRule =
    format === "landscape-1350x1080"
      ? "SAFE ZONE (1350x1080): Tüm metin, logo ve odak öğeleri kenarlardan en az %8 içeride kalsın. Üst ve alt kırpma riskine karşı kritik içerik merkeze yakın."
      : "SAFE ZONE (1080x1080): Tüm metin, logo ve odak öğeleri her kenardan en az %8 içeride. Merkez ağırlıklı kompozisyon; köşelere kritik metin koyma.";

  const storyRule =
    "SAFE ZONE (1080x1920 Story): Kritik metin ve logo üstten %12, alttan %18, yanlardan %6 içeride kalsın (profil çubuğu ve yanıt alanı için). Ana mesaj dikey orta bölgede.";

  return kind === "story" ? storyRule : postRule;
}

export function buildFormatPromptLine(format: PostFormat) {
  if (format === "landscape-1350x1080") {
    return "OUTPUT FORMAT: 1350x1080 pixels landscape Instagram feed post (5:4).";
  }
  return "OUTPUT FORMAT: 1080x1080 pixels square Instagram feed post (1:1).";
}
