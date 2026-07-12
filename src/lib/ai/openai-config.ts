export const OPENAI_IMAGE_DEFAULTS = {
  apiBase: "https://api.openai.com/v1",
  model: "gpt-image-1.5" as const,
  quality: "medium" as const,
  style: "vivid" as const,
  size: "1024x1024" as const,
} as const;

export type GptImageQuality = "low" | "medium" | "high" | "auto";
export type Dalle3Quality = "standard" | "hd";
export type Dalle3Style = "vivid" | "natural";
export type GptImageSize = "1024x1024" | "1536x1024" | "1024x1536";
export type Dalle3Size = "1024x1024" | "1792x1024" | "1024x1792";

export function getOpenAIApiKey() {
  return process.env.OPENAI_API_KEY?.trim() ?? "";
}

export function isOpenAIConfigured() {
  return Boolean(getOpenAIApiKey());
}

export function getOpenAIImageModel() {
  return process.env.OPENAI_IMAGE_MODEL?.trim() || OPENAI_IMAGE_DEFAULTS.model;
}

export function getOpenAIImageFallbackModel() {
  return process.env.OPENAI_IMAGE_FALLBACK_MODEL?.trim() || "gpt-image-1-mini";
}

export function isDalle3Model(model = getOpenAIImageModel()) {
  return model.startsWith("dall-e");
}

export function isGptImageModel(model = getOpenAIImageModel()) {
  return model.startsWith("gpt-image") || model.startsWith("chatgpt-image");
}

export function getDalle3Quality(): Dalle3Quality {
  const raw = process.env.OPENAI_IMAGE_QUALITY?.trim().toLowerCase();
  if (raw === "hd" || raw === "high") return "hd";
  return "standard";
}

export function getGptImageQuality(): GptImageQuality {
  const raw = process.env.OPENAI_IMAGE_QUALITY?.trim().toLowerCase();
  if (raw === "low" || raw === "medium" || raw === "high" || raw === "auto") {
    return raw;
  }
  return "medium";
}

export function getDalle3Style(): Dalle3Style {
  const raw = process.env.OPENAI_IMAGE_STYLE?.trim().toLowerCase();
  if (raw === "natural") return "natural";
  return "vivid";
}

/** Instagram formatlarına yakın boyut — OpenAI 4:5 desteklemez; en yakın dikey 1024x1536 (2:3). */
export function resolveOpenAIImageSize(aspectRatio?: string, model = getOpenAIImageModel()) {
  if (model.startsWith("dall-e")) {
    switch (aspectRatio) {
      case "4:5":
      case "9:16":
        return "1024x1792";
      case "5:4":
        return "1792x1024";
      case "1:1":
      default:
        return "1024x1024";
    }
  }

  switch (aspectRatio) {
    case "4:5":
    case "9:16":
      // API'de tam 4:5 yok; 2:3 üretilir, teslimde kırpma olmadan 1080x1350'ye sığdırılır
      return "1024x1536";
    case "5:4":
      return "1536x1024";
    case "1:1":
    default:
      return "1024x1024";
  }
}

export function isOpenAITextFreeMode() {
  return process.env.OPENAI_TEXT_FREE === "true";
}
