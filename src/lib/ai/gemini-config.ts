/** Tek GEMINI_API_KEY ile hem metin hem görsel modelleri kullanılır. */
export const GEMINI_DEFAULTS = {
  imageModel: "gemini-2.5-flash-image",
  textModel: "gemini-2.5-flash",
  /** Instagram kare post */
  aspectRatio: "1:1" as const,
} as const;

export function getGeminiApiKey() {
  return process.env.GEMINI_API_KEY?.trim() ?? "";
}

export function isGeminiConfigured() {
  return Boolean(getGeminiApiKey());
}

export function getGeminiImageModel() {
  return process.env.GEMINI_IMAGE_MODEL?.trim() || GEMINI_DEFAULTS.imageModel;
}

export function getGeminiTextModel() {
  return process.env.GEMINI_TEXT_MODEL?.trim() || GEMINI_DEFAULTS.textModel;
}

export function resolveImageProvider() {
  const explicit = process.env.IMAGE_PROVIDER?.trim();
  if (explicit) return explicit;
  return isGeminiConfigured() ? "gemini" : "mock";
}

export function resolveCaptionProvider() {
  const explicit = process.env.CAPTION_PROVIDER?.trim();
  if (explicit) return explicit;
  return isGeminiConfigured() ? "gemini" : "mock";
}
