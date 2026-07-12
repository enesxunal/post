import sharp, { type Sharp } from "sharp";

import { getSafeZoneInsets } from "@/lib/image-formats";

import type { LogoAnalysis } from "@/lib/ai/logo-analysis";

function parseDataUrl(dataUrl: string): { mime: string; buffer: Buffer } | null {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  return { mime: match[1], buffer: Buffer.from(match[2], "base64") };
}

function isSvgContent(buffer: Buffer, contentType: string, url: string) {
  if (contentType.includes("svg") || url.toLowerCase().includes(".svg")) {
    return true;
  }

  const head = buffer.toString("utf8", 0, Math.min(512, buffer.length)).trimStart();
  return head.startsWith("<svg") || head.startsWith("<?xml");
}

async function fetchRemoteBuffer(url: string) {
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) {
    throw new Error(`Logo indirilemedi (${response.status})`);
  }

  return {
    buffer: Buffer.from(await response.arrayBuffer()),
    contentType: response.headers.get("content-type") ?? "",
  };
}

/** SVG dahil her logo formatını Gemini/overlay için PNG'ye çevirir. */
export async function rasterizeLogo(logoUrl: string): Promise<Buffer | null> {
  try {
    let buffer: Buffer;
    let contentType = "";

    if (logoUrl.startsWith("data:")) {
      const parsed = parseDataUrl(logoUrl);
      if (!parsed) return null;
      buffer = parsed.buffer;
      contentType = parsed.mime;
    } else {
      const remote = await fetchRemoteBuffer(logoUrl);
      buffer = remote.buffer;
      contentType = remote.contentType;
    }

    const svg = isSvgContent(buffer, contentType, logoUrl);

    return sharp(buffer, svg ? { density: 320 } : undefined)
      .resize(480, 480, { fit: "inside", withoutEnlargement: false })
      .png()
      .toBuffer();
  } catch (error) {
    console.error("Logo rasterize failed:", error);
    return null;
  }
}

type Placement = LogoAnalysis["bestPlacement"];

async function regionBusyScore(
  image: Sharp,
  width: number,
  height: number,
  region: { left: number; top: number; w: number; h: number },
) {
  const sample = await image
    .clone()
    .extract({
      left: Math.max(0, Math.min(region.left, width - 1)),
      top: Math.max(0, Math.min(region.top, height - 1)),
      width: Math.min(region.w, width),
      height: Math.min(region.h, height),
    })
    .resize(48, 48, { fit: "fill" })
    .greyscale()
    .raw()
    .toBuffer();

  let sum = 0;
  let sumSq = 0;
  for (const value of sample) {
    sum += value;
    sumSq += value * value;
  }
  const mean = sum / sample.length;
  const variance = sumSq / sample.length - mean * mean;
  return { variance, mean };
}

/** En sakin bölgeyi bulur; preferred verilirse önce onu dener. */
export async function detectBestLogoPlacement(
  imageBuffer: Buffer,
  logoAnalysis?: LogoAnalysis | null,
  preferred?: Placement | null,
): Promise<Placement> {
  const image = sharp(imageBuffer);
  const meta = await image.metadata();
  const width = meta.width ?? 1080;
  const height = meta.height ?? 1080;

  const regionW = Math.round(width * 0.32);
  const regionH = Math.round(height * 0.22);
  const margin = Math.round(width * 0.04);

  const candidates: Array<{ placement: Placement; left: number; top: number }> = [
    { placement: "bottom-right", left: width - regionW - margin, top: height - regionH - margin },
    { placement: "top-right", left: width - regionW - margin, top: margin },
    { placement: "top-left", left: margin, top: margin },
    {
      placement: "bottom-center",
      left: Math.round((width - regionW) / 2),
      top: height - regionH - margin,
    },
    { placement: "bottom-left", left: margin, top: height - regionH - margin },
  ];

  const scores = await Promise.all(
    candidates.map(async (candidate) => {
      const stats = await regionBusyScore(image, width, height, {
        left: candidate.left,
        top: candidate.top,
        w: regionW,
        h: regionH,
      });
      return { ...candidate, ...stats };
    }),
  );

  scores.sort((a, b) => a.variance - b.variance);

  if (preferred) {
    const preferredScore = scores.find((item) => item.placement === preferred);
    if (preferredScore && preferredScore.variance <= scores[0]!.variance * 1.55) {
      return preferred;
    }
  }

  if (logoAnalysis?.logoType === "wordmark") {
    const bottomCenter = scores.find((item) => item.placement === "bottom-center");
    if (bottomCenter && bottomCenter.variance <= scores[0]!.variance * 1.35) {
      return "bottom-center";
    }
  }

  return scores[0]?.placement ?? logoAnalysis?.bestPlacement ?? "bottom-right";
}

async function loadImageBuffer(imageUrl: string): Promise<Buffer | null> {
  if (imageUrl.startsWith("data:")) {
    const parsed = parseDataUrl(imageUrl);
    return parsed?.buffer ?? null;
  }

  const response = await fetch(imageUrl);
  if (!response.ok) return null;
  return Buffer.from(await response.arrayBuffer());
}

async function recolorLogoForBackground(
  logoBuffer: Buffer,
  regionMean: number,
): Promise<Buffer> {
  const lightBackground = regionMean >= 128;
  const target = lightBackground
    ? { r: 15, g: 23, b: 42 }
    : { r: 255, g: 255, b: 255 };

  const { data, info } = await sharp(logoBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3] ?? 0;
    if (alpha < 24) continue;
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

/** Üretilen görsele gerçek logoyu bindirir — arka plana göre renk uyarlar, kutu eklemez. */
export async function applyLogoOverlay(
  imageUrl: string,
  logoUrl: string,
  logoAnalysis?: LogoAnalysis | null,
  preferredPlacement?: Placement | null,
): Promise<string> {
  const logoBuffer = await rasterizeLogo(logoUrl);
  if (!logoBuffer) return imageUrl;

  const imageBuffer = await loadImageBuffer(imageUrl);
  if (!imageBuffer) return imageUrl;

  const base = sharp(imageBuffer);
  const meta = await base.metadata();
  const width = meta.width ?? 1080;
  const height = meta.height ?? 1080;
  const safe = getSafeZoneInsets(width, height);

  const placement = await detectBestLogoPlacement(
    imageBuffer,
    logoAnalysis,
    preferredPlacement ?? null,
  );

  const maxLogoW = Math.round(width * 0.24);
  const maxLogoH = Math.round(height * 0.16);

  const resizedLogo = await sharp(logoBuffer)
    .resize(maxLogoW, maxLogoH, { fit: "inside" })
    .png()
    .toBuffer();

  const logoMeta = await sharp(resizedLogo).metadata();
  const logoW = logoMeta.width ?? maxLogoW;
  const logoH = logoMeta.height ?? maxLogoH;

  const marginX = safe.sides;
  const marginY = Math.round(safe.bottom * 0.35);
  let left = width - logoW - marginX;
  let top = height - logoH - marginY;

  switch (placement) {
    case "top-left":
      left = marginX;
      top = safe.top;
      break;
    case "top-right":
      left = width - logoW - marginX;
      top = safe.top;
      break;
    case "bottom-left":
      left = marginX;
      top = height - logoH - marginY;
      break;
    case "bottom-center":
      left = Math.round((width - logoW) / 2);
      top = height - logoH - marginY;
      break;
    case "bottom-right":
    default:
      left = width - logoW - marginX;
      top = height - logoH - marginY;
      break;
  }

  const regionStats = await regionBusyScore(base, width, height, {
    left: Math.max(0, left - marginX),
    top: Math.max(0, top - marginY),
    w: logoW + marginX * 2,
    h: logoH + marginY * 2,
  });

  const adaptedLogo = await recolorLogoForBackground(resizedLogo, regionStats.mean);

  const output = await base
    .composite([{ input: adaptedLogo, left, top }])
    .png()
    .toBuffer();

  return `data:image/png;base64,${output.toString("base64")}`;
}
