import type { VisualStyle } from "@/types/domain";

/** Eski kayıtlar / seed uyumluluğu */
const STYLE_KEY_ALIASES: Record<string, VisualStyle> = {
  colorful: "vibrant",
};

export function normalizeStyleKey(raw: string): VisualStyle {
  if (raw in STYLE_KEY_ALIASES) {
    return STYLE_KEY_ALIASES[raw]!;
  }
  return raw as VisualStyle;
}
