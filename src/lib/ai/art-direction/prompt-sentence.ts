import type { LayoutVariant, TypographyMood } from "@/lib/ai/art-direction/types";

const LAYOUT_PHRASES: Record<LayoutVariant, string> = {
  "centered-hero-typography": "centered hero typography layout",
  "image-led-cinematic": "image-led cinematic composition",
  "split-layout": "split layout with balanced text and visual halves",
  "editorial-poster": "editorial poster layout",
  "minimal-emblem": "minimal emblem layout",
  "diagonal-dynamic": "diagonal dynamic composition",
  "full-bleed-overlay": "full-bleed atmospheric background with headline overlay",
  "object-focused-still-life": "object-focused still life composition",
  "pattern-based": "pattern-based festive layout",
  "layered-card": "layered card composition",
};

const TYPOGRAPHY_PHRASES: Record<TypographyMood, string> = {
  "bold-impact": "bold-impact",
  "refined-elegant": "refined elegant",
  "corporate-clean": "corporate-clean",
  "warm-friendly": "warm friendly",
  "premium-editorial": "premium editorial",
};

const FOCUS_PHRASES: Record<string, string> = {
  "symbolic-background": "subtle symbolic background",
  "hero-object": "a strong hero object",
  "typography-first": "typography as the hero",
  "atmospheric-scene": "an atmospheric scene",
  "brand-accent": "brand color as accent",
  "pattern-texture": "pattern and texture depth",
};

const COLOR_PHRASES: Record<string, string> = {
  "occasion-dominant": "occasion-dominant colors",
  "brand-accent": "brand color as gentle accent",
  "brand-dominant": "brand-forward color balance",
  balanced: "balanced brand and occasion colors",
};

export function artDirectionToPromptSentence(
  direction: import("@/lib/ai/art-direction/types").ArtDirection,
): string {
  const layout = LAYOUT_PHRASES[direction.layout];
  const typo = TYPOGRAPHY_PHRASES[direction.typographyMood];
  const focus = FOCUS_PHRASES[direction.visualFocus] ?? direction.visualFocus;
  const color = COLOR_PHRASES[direction.colorBalance] ?? direction.colorBalance;

  let sentence =
    `Art direction: use a ${layout} with ${typo} typography, ` +
    `${direction.density} visual density, ${focus}, and ${color}.`;

  if (direction.motifStrategy) {
    sentence += ` Motif: ${direction.motifStrategy}.`;
  }

  if (direction.antiRepeatNote) {
    sentence += ` ${direction.antiRepeatNote}`;
  }

  if (sentence.length > 320) {
    sentence = `${sentence.slice(0, 317).trim()}…`;
  }

  return sentence;
}
