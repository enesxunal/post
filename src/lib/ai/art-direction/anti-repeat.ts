import {
  isTopTitlePattern,
  LAYOUT_DEFAULT_TEXT_POSITION,
} from "@/lib/ai/art-direction/layouts";
import type {
  ArtDirection,
  LayoutVariant,
  TextPosition,
} from "@/lib/ai/art-direction/types";
import { LAYOUT_VARIANTS, TEXT_POSITIONS } from "@/lib/ai/art-direction/types";
import type { SpecialDayCategory } from "@/types/domain";

const ANTI_REPEAT_WINDOW = 3;

function countInRecent<T extends string>(
  items: ArtDirection[],
  pick: (d: ArtDirection) => T,
  value: T,
): number {
  const recent = items.slice(-ANTI_REPEAT_WINDOW);
  return recent.filter((d) => pick(d) === value).length;
}

export function filterLayoutsForAntiRepeat(
  previous: ArtDirection[],
  candidates: LayoutVariant[],
): LayoutVariant[] {
  const recent = previous.slice(-ANTI_REPEAT_WINDOW);
  const blocked = new Set<LayoutVariant>();

  for (const layout of candidates) {
    const count = recent.filter((d) => d.layout === layout).length;
    if (count >= 1) {
      blocked.add(layout);
    }
  }

  const filtered = candidates.filter((l) => !blocked.has(l));
  if (filtered.length > 0) return filtered;

  const lastLayout = recent[recent.length - 1]?.layout;
  if (lastLayout) {
    return candidates.filter((l) => l !== lastLayout);
  }

  return candidates;
}

export function pickTextPosition(
  layout: LayoutVariant,
  index: number,
  previous: ArtDirection[],
): TextPosition {
  const defaultPos = LAYOUT_DEFAULT_TEXT_POSITION[layout];
  const alternatives: TextPosition[] = [
    defaultPos,
    ...TEXT_POSITIONS.filter((p) => p !== defaultPos),
  ];

  const topHeavy =
    countInRecent(previous, (d) => d.textPosition, "top") >= 2 ||
    previous.slice(-ANTI_REPEAT_WINDOW).filter(isTopTitlePattern).length >= 2;

  const ordered = topHeavy
    ? alternatives.filter((p) => p !== "top")
    : alternatives;

  if (layout === "split-layout") {
    return index % 2 === 0 ? "left" : "right";
  }

  for (const pos of ordered) {
    if (countInRecent(previous, (d) => d.textPosition, pos) < 2) {
      return pos;
    }
  }

  return ordered[index % ordered.length] ?? defaultPos;
}

export function filterMotifsForCategory(
  category: SpecialDayCategory,
  previous: ArtDirection[],
  motifs: string[],
): string[] {
  const recentSameCategory = previous.slice(-6);
  const usedMotifs = new Set(
    recentSameCategory
      .filter((d) => d.motifStrategy)
      .map((d) => d.motifStrategy.toLowerCase()),
  );

  const fresh = motifs.filter((m) => !usedMotifs.has(m.toLowerCase()));
  return fresh.length > 0 ? fresh : motifs;
}

export function buildAntiRepeatNote(previous: ArtDirection[]): string | undefined {
  const recent = previous.slice(-ANTI_REPEAT_WINDOW);
  const topTitleCount = recent.filter(isTopTitlePattern).length;

  if (topTitleCount >= 2) {
    return "Different from previous top-title layouts; avoid a standard header-above-image composition.";
  }

  const dominantLayout = recent[0]?.layout;
  if (dominantLayout && recent.every((d) => d.layout === dominantLayout)) {
    return `Use a fresh composition; avoid repeating the ${dominantLayout.replace(/-/g, " ")} layout.`;
  }

  return undefined;
}

export function hasMinimumDifference(
  previous: ArtDirection,
  next: ArtDirection,
): boolean {
  const keys: (keyof ArtDirection)[] = [
    "layout",
    "textPosition",
    "visualFocus",
    "typographyMood",
    "density",
    "motifStrategy",
    "colorBalance",
  ];

  return keys.some((key) => previous[key] !== next[key]);
}

export function scoreLayoutDiversity(directions: ArtDirection[]): number {
  const uniqueLayouts = new Set(directions.map((d) => d.layout));
  return uniqueLayouts.size;
}
