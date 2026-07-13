import sharp from "sharp";

import type { LogoColorProfile } from "@/lib/ai/logo-overlay-plan";
import { relativeLuminance } from "@/lib/ai/logo-overlay-plan";

function colorDistance(a: number[], b: number[]): number {
  return Math.sqrt(
    (a[0]! - b[0]!) ** 2 + (a[1]! - b[1]!) ** 2 + (a[2]! - b[2]!) ** 2,
  );
}

function sampleCornerRgb(
  data: Buffer,
  width: number,
  height: number,
  x: number,
  y: number,
): number[] {
  const idx = (y * width + x) * 4;
  return [data[idx]!, data[idx + 1]!, data[idx + 2]!, data[idx + 3]!];
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((v) => clamp(v).toString(16).padStart(2, "0")).join("")}`;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

/** Düz renkli logo arka planını şeffaflaştırır (siyah/kutu sorunu). */
export async function stripUniformLogoBackground(
  logoBuffer: Buffer,
  threshold = 36,
): Promise<{ buffer: Buffer; stripped: boolean; backgroundRgb?: { r: number; g: number; b: number } }> {
  const { data, info } = await sharp(logoBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  const corners = [
    sampleCornerRgb(data, width, height, 0, 0),
    sampleCornerRgb(data, width, height, width - 1, 0),
    sampleCornerRgb(data, width, height, 0, height - 1),
    sampleCornerRgb(data, width, height, width - 1, height - 1),
  ];

  const bg = corners[0]!;
  const cornersMatch = corners.every((px) => colorDistance(px, bg) <= threshold);
  if (!cornersMatch || bg[3]! < 200) {
    return { buffer: logoBuffer, stripped: false };
  }

  const output = Buffer.from(data);
  let removed = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const px = [output[idx]!, output[idx + 1]!, output[idx + 2]!];
      if (colorDistance(px, bg) <= threshold) {
        output[idx + 3] = 0;
        removed++;
      }
    }
  }

  if (removed < width * height * 0.08) {
    return { buffer: logoBuffer, stripped: false };
  }

  const cleaned = await sharp(output, {
    raw: { width, height, channels: 4 },
  })
    .png()
    .toBuffer();

  return {
    buffer: cleaned,
    stripped: true,
    backgroundRgb: { r: bg[0]!, g: bg[1]!, b: bg[2]! },
  };
}

export async function analyzeLogoColors(logoBuffer: Buffer): Promise<LogoColorProfile> {
  const stripped = await stripUniformLogoBackground(logoBuffer);
  const working = stripped.buffer;

  const { data, info } = await sharp(working).ensureAlpha().raw().toBuffer({
    resolveWithObject: true,
  });

  let rSum = 0;
  let gSum = 0;
  let bSum = 0;
  let count = 0;
  const buckets = new Map<string, number>();

  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3]!;
    if (alpha < 40) continue;
    const r = data[i]!;
    const g = data[i + 1]!;
    const b = data[i + 2]!;
    rSum += r;
    gSum += g;
    bSum += b;
    count++;

    const key = rgbToHex(
      Math.round(r / 32) * 32,
      Math.round(g / 32) * 32,
      Math.round(b / 32) * 32,
    );
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  if (!count) {
    const stats = await sharp(working).stats();
    const r = stats.channels[0]?.mean ?? 128;
    const g = stats.channels[1]?.mean ?? 128;
    const b = stats.channels[2]?.mean ?? 128;
    const rgb = { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
    return {
      rgb,
      luminance: relativeLuminance(rgb),
      dominantColors: [rgbToHex(rgb.r, rgb.g, rgb.b)],
      hasOpaqueBackground: Boolean(stripped.backgroundRgb),
      backgroundRgb: stripped.backgroundRgb,
    };
  }

  const rgb = {
    r: Math.round(rSum / count),
    g: Math.round(gSum / count),
    b: Math.round(bSum / count),
  };

  const dominantColors = [...buckets.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([hex]) => hex);

  return {
    rgb,
    luminance: relativeLuminance(rgb),
    dominantColors,
    hasOpaqueBackground: stripped.stripped,
    backgroundRgb: stripped.backgroundRgb,
  };
}

export async function recolorLogo(
  logoBuffer: Buffer,
  mode: "brand" | "white" | "black",
  brandRgb?: { r: number; g: number; b: number } | null,
): Promise<Buffer> {
  if (mode === "brand") return logoBuffer;

  const { data, info } = await sharp(logoBuffer).ensureAlpha().raw().toBuffer({
    resolveWithObject: true,
  });

  const target =
    mode === "white"
      ? { r: 255, g: 255, b: 255 }
      : mode === "black"
        ? { r: 0, g: 0, b: 0 }
        : brandRgb ?? { r: 255, g: 255, b: 255 };

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3]! < 20) continue;
    data[i] = target.r;
    data[i + 1] = target.g;
    data[i + 2] = target.b;
  }

  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();
}
