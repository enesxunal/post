import type { LogoTreatment } from "@/lib/ai/art-direction/types";
import type { LogoAnalysis } from "@/lib/ai/logo-analysis";

export type Rgb = { r: number; g: number; b: number };

export type ZoneSample = {
  mean: number;
  variance: number;
  rgb: Rgb;
  luminance: number;
  isLight: boolean;
};

export type LogoColorProfile = {
  rgb: Rgb;
  luminance: number;
  dominantColors: string[];
  hasOpaqueBackground: boolean;
  backgroundRgb?: Rgb;
};

export type LogoColorMode = "brand" | "white" | "black";

export type LogoPlateStyle = "none" | "frosted" | "badge" | "card" | "glass";

export type LogoOverlayPlan = {
  colorMode: LogoColorMode;
  plateStyle: LogoPlateStyle;
  plateRgb: Rgb;
  plateOpacity: number;
  reason: string;
};

const CONTRAST_THRESHOLD = 68;

export function parseHexColor(input?: string | null): Rgb | null {
  if (!input?.trim()) return null;
  const raw = input.trim().replace("#", "");
  if (!/^[0-9a-fA-F]{3,8}$/.test(raw)) return null;

  const hex =
    raw.length === 3
      ? raw
          .split("")
          .map((ch) => ch + ch)
          .join("")
      : raw.slice(0, 6);

  const value = Number.parseInt(hex, 16);
  if (Number.isNaN(value)) return null;

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

export function relativeLuminance({ r, g, b }: Rgb): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastDistance(a: Rgb, b: Rgb): number {
  return Math.abs(relativeLuminance(a) - relativeLuminance(b));
}

function blendRgb(base: Rgb, accent: Rgb, accentWeight: number): Rgb {
  const w = Math.min(1, Math.max(0, accentWeight));
  return {
    r: Math.round(base.r * (1 - w) + accent.r * w),
    g: Math.round(base.g * (1 - w) + accent.g * w),
    b: Math.round(base.b * (1 - w) + accent.b * w),
  };
}

function shiftLuminance(rgb: Rgb, delta: number): Rgb {
  return {
    r: clamp(rgb.r + delta),
    g: clamp(rgb.g + delta),
    b: clamp(rgb.b + delta),
  };
}

function clamp(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function treatmentToPlate(treatment?: LogoTreatment | string | null): LogoPlateStyle {
  switch (treatment) {
    case "badge":
      return "badge";
    case "card":
      return "card";
    case "glass-surface":
      return "glass";
    case "minimal-mark":
      return "none";
    case "natural-corner":
    default:
      return "frosted";
  }
}

function pickMonochrome(zone: ZoneSample): LogoColorMode {
  return zone.isLight ? "black" : "white";
}

function buildPlateColor(zone: ZoneSample, brandRgb: Rgb | null): Rgb {
  const accent = brandRgb ?? zone.rgb;
  const zoneShift = zone.isLight ? -28 : 34;
  const base = shiftLuminance(zone.rgb, zoneShift);
  return blendRgb(base, accent, brandRgb ? 0.28 : 0.12);
}

export function buildLogoOverlayPlan(input: {
  zone: ZoneSample;
  logo: LogoColorProfile;
  brandColor?: string | null;
  logoAnalysis?: LogoAnalysis | null;
  logoTreatment?: LogoTreatment | string | null;
}): LogoOverlayPlan {
  const brandRgb = parseHexColor(input.brandColor);
  const logoRgb = input.logo.hasOpaqueBackground
    ? blendRgb(input.logo.rgb, brandRgb ?? input.logo.rgb, brandRgb ? 0.65 : 0)
    : input.logo.rgb;

  const contrast = contrastDistance(logoRgb, input.zone.rgb);
  const preferredPlate = treatmentToPlate(input.logoTreatment);
  let colorMode: LogoColorMode = "brand";
  let plateStyle: LogoPlateStyle = preferredPlate;
  let reason = "Marka rengi korunuyor; zemin ile yeterli kontrast var.";

  if (contrast < CONTRAST_THRESHOLD) {
    colorMode = pickMonochrome(input.zone);
    reason =
      colorMode === "white"
        ? "Koyu zemin nedeniyle logo beyaza çevrildi."
        : "Açık zemin nedeniyle logo siyaha çevrildi.";

    if (preferredPlate === "none") {
      plateStyle = "frosted";
      reason += " Hafif buzlu zemin eklendi.";
    }
  } else if (preferredPlate !== "none") {
    reason = `Marka rengi korunuyor; ${preferredPlate} yüzeyi zeminle uyumlu seçildi.`;
  }

  if (input.logo.hasOpaqueBackground) {
    plateStyle = plateStyle === "none" ? "badge" : plateStyle;
    reason =
      "Logodaki düz arka plan kaldırıldı; marka rengi uyumlu bir yüzey üzerine yerleştirildi.";
    if (contrast < CONTRAST_THRESHOLD) {
      colorMode = brandRgb ? "brand" : pickMonochrome(input.zone);
    }
  }

  const plateRgb = buildPlateColor(input.zone, brandRgb);
  const plateOpacity =
    plateStyle === "glass"
      ? 0.42
      : plateStyle === "frosted"
        ? 0.55
        : plateStyle === "badge"
          ? 0.78
          : plateStyle === "card"
            ? 0.84
            : 0;

  return {
    colorMode,
    plateStyle,
    plateRgb,
    plateOpacity,
    reason,
  };
}

export function logoZonePromptHint(input: {
  placement: string;
  treatment: string;
  brandColor: string;
  logoAnalysis?: LogoAnalysis | null;
}): string {
  const colors =
    input.logoAnalysis?.dominantColors?.filter(Boolean).slice(0, 2).join(", ") ||
    input.brandColor;
  const treatmentHint =
    input.treatment === "glass-surface"
      ? "soft frosted-glass pocket"
      : input.treatment === "badge"
        ? "subtle rounded badge surface tinted with brand color"
        : input.treatment === "card"
          ? "minimal card/plinth surface harmonizing with the scene"
          : "calm uncluttered pocket with muted tones";

  return [
    `Logo zone at ${input.placement.replace(/-/g, " ")}: leave a ${treatmentHint}.`,
    `Harmonize with brand color ${input.brandColor} and logo tones (${colors}) — never a harsh black/white sticker box.`,
    "Background in that corner should feel intentionally designed for the real logo overlay.",
  ].join(" ");
}
