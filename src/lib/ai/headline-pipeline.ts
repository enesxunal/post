import sharp from "sharp";

import { getSafeZoneInsets } from "@/lib/image-formats";

function parseDataUrl(dataUrl: string): { mime: string; buffer: Buffer } | null {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  return { mime: match[1], buffer: Buffer.from(match[2], "base64") };
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

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapHeadline(headline: string, maxCharsPerLine: number) {
  const words = headline.trim().split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= maxCharsPerLine) {
      current = next;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 3);
}

/** AI yerine doğru Türkçe başlığı güvenli alan içinde bindirir. */
export async function applyHeadlineOverlay(
  imageUrl: string,
  headline: string,
  options?: { brandColor?: string },
): Promise<string> {
  const trimmed = headline.trim();
  if (!trimmed) return imageUrl;

  const imageBuffer = await loadImageBuffer(imageUrl);
  if (!imageBuffer) return imageUrl;

  const base = sharp(imageBuffer);
  const meta = await base.metadata();
  const width = meta.width ?? 1080;
  const height = meta.height ?? 1080;
  const safe = getSafeZoneInsets(width, height);

  const maxTextWidth = width - safe.sides * 2;
  const fontSize = Math.round(
    Math.min(width * (width > height ? 0.062 : 0.056), maxTextWidth / 7),
  );
  const maxCharsPerLine = Math.max(10, Math.round(maxTextWidth / (fontSize * 0.52)));
  const lines = wrapHeadline(trimmed, maxCharsPerLine);
  const lineHeight = Math.round(fontSize * 1.18);
  const blockHeight = lineHeight * lines.length;
  const startY = safe.top + fontSize;

  const fill = options?.brandColor && options.brandColor !== "#FFFFFF" ? "#FFFFFF" : "#111827";
  const tspans = lines
    .map((line, index) => {
      const dy = index === 0 ? 0 : lineHeight;
      return `<tspan x="50%" dy="${dy}">${escapeXml(line)}</tspan>`;
    })
    .join("");

  const svg = Buffer.from(`<svg width="${width}" height="${blockHeight + startY + safe.top}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="headlineShadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="3" stdDeviation="6" flood-color="#000000" flood-opacity="0.45"/>
      </filter>
    </defs>
    <text
      x="50%"
      y="${startY}"
      text-anchor="middle"
      filter="url(#headlineShadow)"
      font-family="DejaVu Sans, Arial, Helvetica, sans-serif"
      font-weight="700"
      font-size="${fontSize}"
      fill="${fill}"
    >${tspans}</text>
  </svg>`);

  const textLayer = await sharp(svg).png().toBuffer();

  const output = await base
    .composite([{ input: textLayer, top: 0, left: 0 }])
    .png()
    .toBuffer();

  return `data:image/png;base64,${output.toString("base64")}`;
}

export function useHeadlineOverlayForProvider(provider: string) {
  if (process.env.HEADLINE_OVERLAY === "true") return true;
  if (process.env.HEADLINE_OVERLAY === "false") return false;
  if (provider === "ideogram") return process.env.IDEOGRAM_TEXT_FREE !== "false";
  if (provider === "openai") return process.env.OPENAI_TEXT_FREE === "true";
  return false;
}
