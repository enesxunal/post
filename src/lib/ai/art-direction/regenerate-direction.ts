import {
  filterLayoutsForAntiRepeat,
  hasMinimumDifference,
} from "@/lib/ai/art-direction/anti-repeat";
import {
  assignArtDirectionForDay,
  buildBrandProfile,
} from "@/lib/ai/art-direction/collection-planner";
import { getCategoryLayouts } from "@/lib/ai/art-direction/layouts";
import { buildSectorLayer } from "@/lib/ai/art-direction/sector-layer";
import type {
  ArtDirection,
  BrandCreativeProfile,
  CollectionDayInput,
} from "@/lib/ai/art-direction/types";
import type { SpecialDayCategory } from "@/types/domain";

function hashSeed(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function pickAlternateLayout(
  current: ArtDirection["layout"],
  category: SpecialDayCategory,
  memory: ArtDirection[],
): ArtDirection["layout"] {
  const candidates = filterLayoutsForAntiRepeat(memory, getCategoryLayouts(category)).filter(
    (l) => l !== current,
  );
  if (!candidates.length) {
    return getCategoryLayouts(category).find((l) => l !== current) ?? current;
  }
  return candidates[hashSeed(`${current}:${memory.length}`) % candidates.length]!;
}

export function regenerateArtDirection(
  previous: ArtDirection | null,
  projectMemory: ArtDirection[],
  day: CollectionDayInput,
  brandProfile: BrandCreativeProfile,
): ArtDirection {
  const index = projectMemory.length;
  let next = assignArtDirectionForDay(day, index, projectMemory, brandProfile);

  if (!previous) return next;

  // Always force a fresh sector element set on regenerate so results don't collapse
  // back into the same greeting-card + sector prop combo.
  const forcedSectorLayer = buildSectorLayer(
    brandProfile,
    day.category,
    index + 17,
    [previous, ...projectMemory],
    `${day.dayId}:regen`,
  );

  next = {
    ...next,
    sectorLayer: forcedSectorLayer,
    antiRepeatNote:
      "Regenerate: keep the same special day and brand, but change composition and sector-native elements. Avoid a generic greeting-card layout. Must look visibly different from the rejected version.",
  };

  if (hasMinimumDifference(previous, next)) return next;

  const alternateLayout = pickAlternateLayout(previous.layout, day.category, projectMemory);
  next = {
    ...next,
    layout: alternateLayout,
  };

  if (!hasMinimumDifference(previous, next)) {
    next = {
      ...next,
      visualFocus:
        next.visualFocus === previous.visualFocus ? "atmospheric-scene" : next.visualFocus,
      typographyMood:
        next.typographyMood === previous.typographyMood
          ? "premium-editorial"
          : next.typographyMood,
    };
  }

  return next;
}

export { buildBrandProfile };
