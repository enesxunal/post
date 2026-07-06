import sharp from "sharp";

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

/** Üretilen görselin sağ üstüne gerçek logoyu bindirir — AI'nın çizmesine güvenilmez. */
export async function applyLogoOverlay(
  imageUrl: string,
  logoUrl: string,
  position: "top-right" | "bottom-right" = "top-right",
): Promise<string> {
  const logoBuffer = await rasterizeLogo(logoUrl);
  if (!logoBuffer) return imageUrl;

  let imageBuffer: Buffer;
  if (imageUrl.startsWith("data:")) {
    const parsed = parseDataUrl(imageUrl);
    if (!parsed) return imageUrl;
    imageBuffer = parsed.buffer;
  } else {
    const response = await fetch(imageUrl);
    if (!response.ok) return imageUrl;
    imageBuffer = Buffer.from(await response.arrayBuffer());
  }

  const base = sharp(imageBuffer);
  const meta = await base.metadata();
  const width = meta.width ?? 1080;
  const height = meta.height ?? 1080;

  const maxLogoW = Math.round(width * 0.2);
  const maxLogoH = Math.round(height * 0.14);

  const resizedLogo = await sharp(logoBuffer)
    .resize(maxLogoW, maxLogoH, { fit: "inside" })
    .png()
    .toBuffer();

  const logoMeta = await sharp(resizedLogo).metadata();
  const logoW = logoMeta.width ?? maxLogoW;
  const logoH = logoMeta.height ?? maxLogoH;

  const margin = Math.round(width * 0.045);
  const left = width - logoW - margin;
  const top = position === "top-right" ? margin : height - logoH - margin;

  const output = await base
    .composite([{ input: resizedLogo, left, top }])
    .png()
    .toBuffer();

  return `data:image/png;base64,${output.toString("base64")}`;
}
