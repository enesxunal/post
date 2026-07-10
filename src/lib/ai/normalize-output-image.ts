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

/** AI çıktısını Instagram feed boyutuna kesin ölçekler (4:5 veya kare). */
export async function normalizeGeneratedImageSize(
  imageUrl: string,
  postFormat?: PostFormat,
): Promise<string> {
  const buffer = await loadImageBuffer(imageUrl);
  if (!buffer) return imageUrl;

  const { width, height } = targetSizeForFormat(postFormat);
  const meta = await sharp(buffer).metadata();
  if (meta.width === width && meta.height === height) {
    return imageUrl;
  }

  const output = await sharp(buffer)
    .resize(width, height, { fit: "cover", position: "centre" })
    .png()
    .toBuffer();

  return `data:image/png;base64,${output.toString("base64")}`;
}
