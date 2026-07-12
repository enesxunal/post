import sharp from "sharp";

import { normalizePostFormat, type PostFormat } from "@/lib/image-formats";

function parseDataUrl(dataUrl: string): Buffer | null {
  const match = dataUrl.match(/^data:[^;]+;base64,(.+)$/);
  if (!match) return null;
  return Buffer.from(match[1], "base64");
}

async function loadImageBuffer(imageUrl: string): Promise<Buffer | null> {
  if (imageUrl.startsWith("data:")) {
    return parseDataUrl(imageUrl);
  }

  const response = await fetch(imageUrl);
  if (!response.ok) return null;
  return Buffer.from(await response.arrayBuffer());
}

function targetSizeForFormat(format?: PostFormat) {
  const normalized = normalizePostFormat(format);
  if (normalized === "portrait-1080x1350") {
    return { width: 1080, height: 1350 };
  }
  return { width: 1080, height: 1080 };
}

async function sampleBackgroundColor(buffer: Buffer) {
  const { dominant } = await sharp(buffer).resize(120, 120, { fit: "inside" }).stats();
  return {
    r: Math.round(dominant.r),
    g: Math.round(dominant.g),
    b: Math.round(dominant.b),
    alpha: 1,
  };
}

/**
 * Instagram teslim boyutuna getirir.
 * - Aynı en-boy oranı → sadece ölçekler (kırpma yok)
 * - Farklı oran (ör. OpenAI 2:3 → 4:5) → içine sığdırır, boşlukları arka plan rengiyle doldurur (kırpma yok)
 */
export async function normalizeGeneratedImageSize(
  imageUrl: string,
  postFormat?: PostFormat,
): Promise<string> {
  const buffer = await loadImageBuffer(imageUrl);
  if (!buffer) return imageUrl;

  const { width, height } = targetSizeForFormat(postFormat);
  const meta = await sharp(buffer).metadata();
  const sourceW = meta.width ?? width;
  const sourceH = meta.height ?? height;

  if (sourceW === width && sourceH === height) {
    return imageUrl;
  }

  const sourceRatio = sourceW / sourceH;
  const targetRatio = width / height;
  const sameRatio = Math.abs(sourceRatio - targetRatio) < 0.012;

  let output: Buffer;

  if (sameRatio) {
    output = await sharp(buffer).resize(width, height).png().toBuffer();
  } else {
    const background = await sampleBackgroundColor(buffer);
    output = await sharp(buffer)
      .resize(width, height, {
        fit: "contain",
        position: "centre",
        background,
      })
      .png()
      .toBuffer();
  }

  return `data:image/png;base64,${output.toString("base64")}`;
}
