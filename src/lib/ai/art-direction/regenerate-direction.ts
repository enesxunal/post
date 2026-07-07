import {
  filterLayoutsForAntiRepeat,
  hasMinimumDifference,
} from "@/lib/ai/art-direction/anti-repeat";
import {
  assignArtDirectionForDay,
  buildBrandProfile,
} from "@/lib/ai/art-direction/collection-planner";
import { getCategoryLayouts } from "@/lib/ai/art-direction/layouts";
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

  if (hasMinimumDifference(previous, next)) return next;

  const alternateLayout = pickAlternateLayout(previous.layout, day.category, projectMemory);
  next = {
    ...next,
    layout: alternateLayout,
    antiRepeatNote:
      "Different from the previous version of this post; avoid repeating the same composition.",
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
