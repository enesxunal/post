function normalizeHex(color: string): string | null {
  const trimmed = color.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(trimmed)) return trimmed;
  if (/^#[0-9A-Fa-f]{3}$/.test(trimmed)) {
    return `#${trimmed[1]}${trimmed[1]}${trimmed[2]}${trimmed[2]}${trimmed[3]}${trimmed[3]}`;
  }
  return null;
}

/** Marka renklerinden panel banner degrade CSS değeri üretir. */
export function buildBrandBannerGradient(
  brandColors: string[] | undefined,
  primaryColor: string,
): string {
  const palette = [...new Set(
    [...(brandColors ?? []), primaryColor]
      .map(normalizeHex)
      .filter((color): color is string => Boolean(color)),
  )];

  if (palette.length >= 2) {
    return `linear-gradient(135deg, ${palette[0]}, ${palette[1]})`;
  }

  const main = palette[0] ?? normalizeHex(primaryColor) ?? "#16A34A";
  return `linear-gradient(135deg, ${main}, ${main}cc)`;
}
