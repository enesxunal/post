import sectorRulesSeed from "@/lib/sectors/sector-rules-seed.json";
import { normalizeSectorKey } from "@/lib/sectors/sector-key-map";
import type { SectorKey, SectorRule } from "@/types/domain";

type SeedRow = {
  key: string;
  name: string;
  description: string;
  visual_cues: string;
  tone_hints: string;
  composition_hints: string;
  color_hints: string;
  suitable_elements: string[];
  avoid_rules: string[];
  prompt_modifier: string;
};

function seedRowToRule(row: SeedRow): SectorRule {
  const key = normalizeSectorKey(row.key);
  return {
    key,
    name: row.name,
    description: row.description,
    visualCues: row.visual_cues,
    toneHints: row.tone_hints,
    compositionHints: row.composition_hints,
    colorHints: row.color_hints,
    suitableElements: row.suitable_elements,
    avoidRules: row.avoid_rules,
    promptModifier: row.prompt_modifier,
  };
}

export function getSectorRulesFromSeed(): SectorRule[] {
  return (sectorRulesSeed as SeedRow[]).map(seedRowToRule);
}

export function getSectorOptionsFromSeed(): Array<{ key: SectorKey; label: string }> {
  return getSectorRulesFromSeed().map((rule) => ({
    key: rule.key,
    label: rule.name,
  }));
}

export function getSectorRuleFromSeed(sectorKey: string): SectorRule | undefined {
  const normalized = normalizeSectorKey(sectorKey);
  return getSectorRulesFromSeed().find((rule) => rule.key === normalized);
}
