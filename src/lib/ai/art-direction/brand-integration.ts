import type {
  ArtDirection,
  BrandColorUsage,
  BrandIntegration,
  ColorBalance,
  LogoPlacement,
  LogoTreatment,
} from "@/lib/ai/art-direction/types";
import { LOGO_PLACEMENTS, LOGO_TREATMENTS } from "@/lib/ai/art-direction/types";
import type { SpecialDayCategory, VisualStyle } from "@/types/domain";

function hashSeed(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function pickBySeed<T>(items: T[], seed: string, fallback: T): T {
  if (!items.length) return fallback;
  return items[hashSeed(seed) % items.length]!;
}

const TREATMENTS_BY_STYLE: Record<VisualStyle, LogoTreatment[]> = {
  modern: ["natural-corner", "minimal-mark", "glass-surface", "badge"],
  minimal: ["minimal-mark", "natural-corner", "glass-surface"],
  corporate: ["badge", "card", "natural-corner", "minimal-mark"],
  friendly: ["natural-corner", "badge", "card"],
  premium: ["glass-surface", "card", "minimal-mark", "natural-corner"],
  vibrant: ["badge", "card", "natural-corner"],
};

function colorUsageFromBalance(balance: ColorBalance): BrandColorUsage {
  switch (balance) {
    case "brand-dominant":
      return "dominant";
    case "occasion-dominant":
    case "brand-accent":
      return "accent";
    default:
      return "balanced";
  }
}

export function filterLogoPlacementsForAntiRepeat(
  previous: ArtDirection[],
  candidates: LogoPlacement[] = [...LOGO_PLACEMENTS],
): LogoPlacement[] {
  const recent = previous.slice(-3).map((d) => d.brandIntegration?.logoPlacement);
  const fresh = candidates.filter((p) => !recent.includes(p));
  return fresh.length ? fresh : candidates;
}

export function buildBrandIntegration(
  visualStyle: VisualStyle,
  colorBalance: ColorBalance,
  index: number,
  previous: ArtDirection[],
  seedBase: string,
): BrandIntegration {
  const placements = filterLogoPlacementsForAntiRepeat(previous);
  const logoPlacement = pickBySeed(placements, `${seedBase}:logo-place`, placements[0]!);

  const treatmentPool = TREATMENTS_BY_STYLE[visualStyle] ?? [...LOGO_TREATMENTS];
  const recentTreatments = previous.slice(-3).map((d) => d.brandIntegration?.logoTreatment);
  const freshTreatments = treatmentPool.filter((t) => !recentTreatments.includes(t));
  const logoTreatment = pickBySeed(
    freshTreatments.length ? freshTreatments : treatmentPool,
    `${seedBase}:logo-treat:${index}`,
    treatmentPool[0]!,
  );

  return {
    logoPlacement,
    logoTreatment,
    colorUsage: colorUsageFromBalance(colorBalance),
  };
}

export function brandIntegrationToPromptPhrase(integration: BrandIntegration): string {
  const treatment =
    integration.logoTreatment === "natural-corner"
      ? "as a natural compositional corner mark"
      : integration.logoTreatment === "badge"
        ? "on a soft badge-like surface"
        : integration.logoTreatment === "card"
          ? "on a subtle card/plinth surface"
          : integration.logoTreatment === "glass-surface"
            ? "on a frosted glass-like surface"
            : "as a minimal clean mark";

  return (
    `Brand integration: leave a clean reserved area at ${integration.logoPlacement.replace(/-/g, " ")} ` +
    `for the real logo ${treatment}. Brand color usage: ${integration.colorUsage}. ` +
    `Logo zone must harmonize with brand colors — soft tinted surface, frosted pocket, or calm muted background; never a harsh black/white sticker box. ` +
    `Do NOT draw the logo yourself — composition must feel intentionally designed for logo placement.`
  );
}

export function defaultBrandIntegrationForCategory(
  category: SpecialDayCategory,
): BrandIntegration {
  return {
    logoPlacement: category === "campaign" ? "top-right" : "bottom-right",
    logoTreatment: "natural-corner",
    colorUsage:
      category === "campaign"
        ? "dominant"
        : category === "national" || category === "religious" || category === "friday"
          ? "accent"
          : "balanced",
  };
}
