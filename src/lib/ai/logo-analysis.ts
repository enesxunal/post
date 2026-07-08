import sharp from "sharp";

export type LogoAnalysis = {
  logoType: "wordmark" | "icon" | "emblem" | "mixed" | "unknown";
  dominantColors: string[];
  background: "transparent" | "light" | "dark" | "unknown";
  complexity: "simple" | "medium" | "complex";
  bestPlacement: "bottom-right" | "bottom-center" | "bottom-left" | "top-right" | "top-left";
  usageNote: string;
};

function parseDataUrl(dataUrl: string): Buffer | null {
  const match = dataUrl.match(/^data:[^;]+;base64,(.+)$/);
  if (!match) return null;
  return Buffer.from(match[1], "base64");
}

async function loadLogoBuffer(logoUrl: string): Promise<Buffer | null> {
  if (logoUrl.startsWith("data:")) {
    return parseDataUrl(logoUrl);
  }
  try {
    const response = await fetch(logoUrl);
    if (!response.ok) return null;
    return Buffer.from(await response.arrayBuffer());
  } catch {
    return null;
  }
}

function classifyLogoType(width: number, height: number): LogoAnalysis["logoType"] {
  const ratio = width / Math.max(height, 1);
  if (ratio > 2.2) return "wordmark";
  if (ratio < 0.75) return "emblem";
  if (ratio >= 0.85 && ratio <= 1.15) return "icon";
  if (ratio >= 1.15 && ratio <= 2.2) return "mixed";
  return "unknown";
}

function classifyComplexity(pixelCount: number): LogoAnalysis["complexity"] {
  if (pixelCount < 120_000) return "simple";
  if (pixelCount < 400_000) return "medium";
  return "complex";
}

function buildUsageNote(
  placement: LogoAnalysis["bestPlacement"],
  complexity: LogoAnalysis["complexity"],
): string {
  const placementText =
    placement === "top-right"
      ? "top-right"
      : placement === "top-left"
        ? "top-left"
        : placement === "bottom-center"
          ? "bottom-center"
          : "bottom-right";

  return `Do NOT draw any logo in the image. ${placementText} corner must stay empty — real logo added after generation.`;
}

/** Logo bir kez analiz edilir; sonuç proje meta'sında saklanır. */
export async function analyzeLogo(logoUrl: string): Promise<LogoAnalysis | null> {
  const buffer = await loadLogoBuffer(logoUrl);
  if (!buffer) return null;

  try {
    const image = sharp(buffer);
    const meta = await image.metadata();
    const width = meta.width ?? 256;
    const height = meta.height ?? 256;
    const stats = await image.stats();

    const hasAlpha = meta.hasAlpha === true;
    const avgBrightness =
      stats.channels.slice(0, 3).reduce((sum, ch) => sum + ch.mean, 0) /
      Math.min(stats.channels.length, 3);

    const background: LogoAnalysis["background"] = hasAlpha
      ? "transparent"
      : avgBrightness > 180
        ? "light"
        : avgBrightness < 80
          ? "dark"
          : "unknown";

    const logoType = classifyLogoType(width, height);
    const complexity = classifyComplexity(width * height);
    const bestPlacement: LogoAnalysis["bestPlacement"] =
      logoType === "wordmark" ? "bottom-center" : "bottom-right";

    return {
      logoType,
      dominantColors: [],
      background,
      complexity,
      bestPlacement,
      usageNote: buildUsageNote(bestPlacement, complexity),
    };
  } catch {
    return {
      logoType: "unknown",
      dominantColors: [],
      background: "unknown",
      complexity: "medium",
      bestPlacement: "top-right",
      usageNote:
        "Do NOT draw any logo in the image. Top-right corner must stay empty — real logo added after generation.",
    };
  }
}
