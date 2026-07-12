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

/** Orijinal logo renklerini korur; okunabilirlik için hafif gölge ekler. */
async function prepareLogoForOverlay(
  logoBuffer: Buffer,
  lightBackground: boolean,
): Promise<{ buffer: Buffer; pad: number }> {
  const meta = await sharp(logoBuffer).metadata();
  const w = meta.width ?? 100;
  const h = meta.height ?? 100;
  const pad = Math.max(6, Math.round(Math.min(w, h) * 0.1));
  const offset = Math.max(2, Math.round(Math.min(w, h) * 0.035));

  const shadow = await sharp(logoBuffer)
    .ensureAlpha()
    .greyscale()
    .linear(lightBackground ? 0.35 : 0.65, lightBackground ? 0 : 255)
    .blur(Math.max(2, Math.round(pad * 0.45)))
    .toBuffer();

  const canvasW = w + pad * 2;
  const canvasH = h + pad * 2;

  const buffer = await sharp({
    create: {
      width: canvasW,
      height: canvasH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: shadow, left: pad + offset, top: pad + offset, blend: "over" },
      { input: logoBuffer, left: pad, top: pad },
    ])
    .png()
    .toBuffer();

  return { buffer, pad };
}

/** Üretilen görsele gerçek logoyu bindirir — orijinal renkler korunur, kutu eklenmez. */
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

  const lightBackground = regionStats.mean >= 128;
  const { buffer: preparedLogo, pad } = await prepareLogoForOverlay(resizedLogo, lightBackground);

  const output = await base
    .composite([
      {
        input: preparedLogo,
        left: Math.max(0, left - pad),
        top: Math.max(0, top - pad),
      },
    ])
    .png()
    .toBuffer();

  return `data:image/png;base64,${output.toString("base64")}`;
}
