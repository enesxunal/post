import sharp, { type Sharp } from "sharp";

import { getSafeZoneInsets } from "@/lib/image-formats";
import type { LogoTreatment } from "@/lib/ai/art-direction/types";
import {
  analyzeLogoColors,
  recolorLogo,
  stripUniformLogoBackground,
} from "@/lib/ai/logo-color-profile";
import type { LogoAnalysis } from "@/lib/ai/logo-analysis";
import {
  buildLogoOverlayPlan,
  parseHexColor,
  type LogoOverlayPlan,
  type Rgb,
  type ZoneSample,
} from "@/lib/ai/logo-overlay-plan";

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

async function regionSample(
  image: Sharp,
  width: number,
  height: number,
  region: { left: number; top: number; w: number; h: number },
): Promise<ZoneSample> {
  const sample = await image
    .clone()
    .extract({
      left: Math.max(0, Math.min(region.left, width - 1)),
      top: Math.max(0, Math.min(region.top, height - 1)),
      width: Math.min(region.w, width),
      height: Math.min(region.h, height),
    })
    .resize(48, 48, { fit: "fill" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data } = sample;
  const channels = sample.info.channels;
  let sum = 0;
  let sumSq = 0;
  let rSum = 0;
  let gSum = 0;
  let bSum = 0;
  const count = data.length / channels;

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i] ?? 0;
    const g = data[i + 1] ?? r;
    const b = data[i + 2] ?? r;
    const grey =
      channels >= 3 ? Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b) : r;
    sum += grey;
    sumSq += grey * grey;
    rSum += r;
    gSum += g;
    bSum += b;
  }

  const mean = sum / count;
  const variance = sumSq / count - mean * mean;
  const rgb = {
    r: Math.round(rSum / count),
    g: Math.round(gSum / count),
    b: Math.round(bSum / count),
  };

  return {
    mean,
    variance,
    rgb,
    luminance: mean,
    isLight: mean >= 128,
  };
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
      const stats = await regionSample(image, width, height, {
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

function placementToCoords(
  placement: Placement,
  width: number,
  height: number,
  logoW: number,
  logoH: number,
  marginX: number,
  marginY: number,
  safeTop: number,
) {
  let left = width - logoW - marginX;
  let top = height - logoH - marginY;

  switch (placement) {
    case "top-left":
      left = marginX;
      top = safeTop;
      break;
    case "top-right":
      left = width - logoW - marginX;
      top = safeTop;
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

  return { left, top };
}

async function createRoundedMask(width: number, height: number, radius: number) {
  const svg = `<svg width="${width}" height="${height}"><rect x="0" y="0" width="${width}" height="${height}" rx="${radius}" ry="${radius}" fill="white"/></svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

function zoneVeilRgb(plan: LogoOverlayPlan): Rgb {
  if (plan.plateStyle === "frosted") {
    return plan.plateRgb;
  }
  return {
    r: Math.round(plan.plateRgb.r * 0.7 + 255 * 0.3),
    g: Math.round(plan.plateRgb.g * 0.7 + 255 * 0.3),
    b: Math.round(plan.plateRgb.b * 0.7 + 255 * 0.3),
  };
}

async function buildPlate(
  base: Sharp,
  width: number,
  height: number,
  left: number,
  top: number,
  plateW: number,
  plateH: number,
  plan: LogoOverlayPlan,
): Promise<Buffer | null> {
  if (plan.plateStyle === "none" || plan.plateOpacity <= 0) {
    return null;
  }

  const pad = Math.round(Math.min(plateW, plateH) * 0.18);
  const radius =
    plan.plateStyle === "badge"
      ? Math.round(Math.min(plateW, plateH) * 0.22)
      : plan.plateStyle === "card"
        ? Math.round(Math.min(plateW, plateH) * 0.12)
        : Math.round(Math.min(plateW, plateH) * 0.16);

  const extractLeft = Math.max(0, left - pad);
  const extractTop = Math.max(0, top - pad);
  const extractW = Math.min(width - extractLeft, plateW + pad * 2);
  const extractH = Math.min(height - extractTop, plateH + pad * 2);

  let plate = base
    .clone()
    .extract({
      left: extractLeft,
      top: extractTop,
      width: extractW,
      height: extractH,
    })
    .resize(extractW, extractH, { fit: "fill" })
    .blur(plan.plateStyle === "glass" || plan.plateStyle === "frosted" ? 14 : 4);

  const fillRgb =
    plan.plateStyle === "glass" || plan.plateStyle === "frosted"
      ? zoneVeilRgb(plan)
      : plan.plateRgb;

  plate = plate.composite([
    {
      input: {
        create: {
          width: extractW,
          height: extractH,
          channels: 4,
          background: {
            r: fillRgb.r,
            g: fillRgb.g,
            b: fillRgb.b,
            alpha: plan.plateOpacity,
          },
        },
      },
      blend: "over",
    },
  ]);

  const mask = await createRoundedMask(extractW, extractH, radius);
  return plate
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();
}

async function prepareLogoAsset(
  logoBuffer: Buffer,
  plan: LogoOverlayPlan,
  brandColor?: string | null,
): Promise<Buffer> {
  const stripped = await stripUniformLogoBackground(logoBuffer);
  const brandRgb = parseHexColor(brandColor);
  return recolorLogo(stripped.buffer, plan.colorMode, brandRgb);
}

export type LogoOverlayOptions = {
  logoAnalysis?: LogoAnalysis | null;
  preferredPlacement?: Placement | null;
  brandColor?: string | null;
  logoTreatment?: LogoTreatment | string | null;
};

/** Üretilen görsele gerçek logoyu bindirir — zemin ve marka rengine göre uyumlu yerleşim. */
export async function applyLogoOverlay(
  imageUrl: string,
  logoUrl: string,
  options?: LogoOverlayOptions,
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
    options?.logoAnalysis,
    options?.preferredPlacement ?? null,
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
  const { left, top } = placementToCoords(
    placement,
    width,
    height,
    logoW,
    logoH,
    marginX,
    marginY,
    safe.top,
  );

  const zone = await regionSample(base, width, height, {
    left: Math.max(0, left - marginX),
    top: Math.max(0, top - marginY),
    w: logoW + marginX * 2,
    h: logoH + marginY * 2,
  });

  const logoProfile = await analyzeLogoColors(resizedLogo);
  const plan = buildLogoOverlayPlan({
    zone,
    logo: logoProfile,
    brandColor: options?.brandColor,
    logoAnalysis: options?.logoAnalysis,
    logoTreatment: options?.logoTreatment,
  });

  const preparedLogo = await prepareLogoAsset(
    resizedLogo,
    plan,
    options?.brandColor,
  );

  const plate = await buildPlate(base, width, height, left, top, logoW, logoH, plan);
  const pad = Math.round(Math.min(logoW, logoH) * 0.12);
  const platePad = plate ? Math.round(Math.min(logoW, logoH) * 0.18) : 0;

  const composites: Array<{ input: Buffer; left: number; top: number }> = [];
  if (plate) {
    composites.push({
      input: plate,
      left: Math.max(0, left - platePad),
      top: Math.max(0, top - platePad),
    });
  }

  composites.push({
    input: preparedLogo,
    left: Math.max(0, left - pad),
    top: Math.max(0, top - pad),
  });

  const output = await base.composite(composites).png().toBuffer();

  return `data:image/png;base64,${output.toString("base64")}`;
}
