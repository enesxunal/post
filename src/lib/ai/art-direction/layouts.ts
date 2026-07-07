import type { SpecialDayCategory } from "@/types/domain";
import type { LayoutVariant, TextPosition, VisualFocus } from "@/lib/ai/art-direction/types";
import { LAYOUT_VARIANTS } from "@/lib/ai/art-direction/types";

/** Layout → default text position (anti-repeat may override). */
export const LAYOUT_DEFAULT_TEXT_POSITION: Record<LayoutVariant, TextPosition> = {
  "centered-hero-typography": "center",
  "image-led-cinematic": "integrated",
  "split-layout": "left",
  "editorial-poster": "center",
  "minimal-emblem": "center",
  "diagonal-dynamic": "integrated",
  "full-bleed-overlay": "bottom",
  "object-focused-still-life": "top",
  "pattern-based": "center",
  "layered-card": "bottom",
};

/** Layout → natural visual focus. */
export const LAYOUT_VISUAL_FOCUS: Record<LayoutVariant, VisualFocus> = {
  "centered-hero-typography": "typography-first",
  "image-led-cinematic": "atmospheric-scene",
  "split-layout": "hero-object",
  "editorial-poster": "typography-first",
  "minimal-emblem": "symbolic-background",
  "diagonal-dynamic": "brand-accent",
  "full-bleed-overlay": "atmospheric-scene",
  "object-focused-still-life": "hero-object",
  "pattern-based": "pattern-texture",
  "layered-card": "hero-object",
};

/** Category-preferred layouts (ordered by fit). */
export const CATEGORY_LAYOUT_PREFERENCES: Record<SpecialDayCategory, LayoutVariant[]> = {
  recommended: [...LAYOUT_VARIANTS],
  national: [
    "image-led-cinematic",
    "full-bleed-overlay",
    "editorial-poster",
    "diagonal-dynamic",
    "split-layout",
    "centered-hero-typography",
    "minimal-emblem",
    "pattern-based",
    "layered-card",
    "object-focused-still-life",
  ],
  holiday: [
    "object-focused-still-life",
    "layered-card",
    "editorial-poster",
    "full-bleed-overlay",
    "minimal-emblem",
    "pattern-based",
    "centered-hero-typography",
    "split-layout",
    "image-led-cinematic",
    "diagonal-dynamic",
  ],
  religious: [
    "minimal-emblem",
    "object-focused-still-life",
    "pattern-based",
    "layered-card",
    "full-bleed-overlay",
    "editorial-poster",
    "centered-hero-typography",
    "split-layout",
    "image-led-cinematic",
    "diagonal-dynamic",
  ],
  friday: [
    "minimal-emblem",
    "layered-card",
    "centered-hero-typography",
    "editorial-poster",
    "pattern-based",
    "object-focused-still-life",
    "split-layout",
    "full-bleed-overlay",
    "image-led-cinematic",
    "diagonal-dynamic",
  ],
  popular: [...LAYOUT_VARIANTS],
  sectoral: [
    "object-focused-still-life",
    "split-layout",
    "editorial-poster",
    "layered-card",
    "centered-hero-typography",
    "image-led-cinematic",
    "minimal-emblem",
    "full-bleed-overlay",
    "pattern-based",
    "diagonal-dynamic",
  ],
  campaign: [
    "diagonal-dynamic",
    "centered-hero-typography",
    "split-layout",
    "editorial-poster",
    "full-bleed-overlay",
    "layered-card",
    "image-led-cinematic",
    "minimal-emblem",
    "object-focused-still-life",
    "pattern-based",
  ],
};

export function getCategoryLayouts(category: SpecialDayCategory): LayoutVariant[] {
  return CATEGORY_LAYOUT_PREFERENCES[category] ?? [...LAYOUT_VARIANTS];
}

/** Classic template we want to break: top headline + image below. */
export const TOP_TITLE_LAYOUTS: LayoutVariant[] = [
  "object-focused-still-life",
  "centered-hero-typography",
];

export function isTopTitlePattern(direction: {
  layout: LayoutVariant;
  textPosition: TextPosition;
}): boolean {
  return (
    direction.textPosition === "top" ||
    (TOP_TITLE_LAYOUTS.includes(direction.layout) && direction.textPosition !== "integrated")
  );
}
