import styleRulesSeed from "@/lib/styles/style-rules-seed.json";
import { normalizeStyleKey } from "@/lib/styles/style-key-map";
import type { StyleOption, StyleRule, VisualStyle } from "@/types/domain";

type SeedRow = {
  key: string;
  name: string;
  description: string;
  visual_cues: string;
  typography_hints: string;
  composition_hints: string;
  color_hints: string;
  best_for: string[];
  avoid_rules: string[];
  prompt_modifier: string;
};

function seedRowToRule(row: SeedRow): StyleRule {
  const key = normalizeStyleKey(row.key);
  return {
    key,
    name: row.name,
    description: row.description,
    visualCues: row.visual_cues,
    typographyHints: row.typography_hints,
    compositionHints: row.composition_hints,
    colorHints: row.color_hints,
    bestFor: row.best_for,
    avoidRules: row.avoid_rules,
    promptModifier: row.prompt_modifier,
  };
}

export function getStyleRulesFromSeed(): StyleRule[] {
  return (styleRulesSeed as SeedRow[]).map(seedRowToRule);
}

/** Onboarding kartları — sadece isim + kısa açıklama */
export function getStyleOptionsFromSeed(): StyleOption[] {
  return getStyleRulesFromSeed().map((rule) => ({
    key: rule.key,
    name: rule.name,
    description: rule.description,
  }));
}

export function getStyleRuleFromSeed(styleKey: string): StyleRule | undefined {
  const normalized = normalizeStyleKey(styleKey);
  return getStyleRulesFromSeed().find((rule) => rule.key === normalized);
}

export function resolveStyleName(styleKey: VisualStyle | string): string {
  return getStyleRuleFromSeed(styleKey)?.name ?? String(styleKey);
}
