export const IDEOGRAM_DEFAULTS = {
  apiBase: "https://api.ideogram.ai",
  model: "v4" as const,
  renderingSpeed: "QUALITY" as const,
} as const;

export type IdeogramRenderingSpeed = "TURBO" | "DEFAULT" | "QUALITY";

export function getIdeogramApiKey() {
  return process.env.IDEOGRAM_API_KEY?.trim() ?? "";
}

export function isIdeogramConfigured() {
  return Boolean(getIdeogramApiKey());
}

export function getIdeogramRenderingSpeed(): IdeogramRenderingSpeed {
  const raw = process.env.IDEOGRAM_RENDERING_SPEED?.trim().toUpperCase();
  if (raw === "TURBO" || raw === "DEFAULT" || raw === "QUALITY") {
    return raw;
  }
  return IDEOGRAM_DEFAULTS.renderingSpeed;
}

/** Ideogram 4.0 çözünürlükleri — Instagram formatlarına yakın eşleme */
export function resolveIdeogramResolution(aspectRatio?: string) {
  switch (aspectRatio) {
    case "5:4":
      return "2240x1792";
    case "9:16":
      return "1440x2560";
    case "1:1":
    default:
      return "2048x2048";
  }
}
