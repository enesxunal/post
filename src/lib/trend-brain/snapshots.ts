import type { SectorRule, SpecialDay, StyleRule } from "@/types/domain";
import type { TrendTargetType } from "@/lib/trend-brain/types";

export function snapshotSpecialDay(day: SpecialDay): Record<string, unknown> {
  return {
    name: day.name,
    category: day.category,
    culturalContext: day.culturalContext,
    visualDirection: day.visualDirection,
    avoidRules: day.avoidRules,
    headlineAlternatives: day.headlineAlternatives,
    captionIdeas: day.captionIdeas,
    promptTemplate: day.promptTemplate,
    promptBuildingBlocks: day.promptBuildingBlocks,
    masterPromptTemplate: day.masterPromptTemplate,
    popularUsages: day.popularUsages,
  };
}

export function snapshotSectorRule(rule: SectorRule): Record<string, unknown> {
  return {
    name: rule.name,
    description: rule.description,
    visualCues: rule.visualCues,
    toneHints: rule.toneHints,
    compositionHints: rule.compositionHints,
    colorHints: rule.colorHints,
    suitableElements: rule.suitableElements,
    avoidRules: rule.avoidRules,
    promptModifier: rule.promptModifier,
  };
}

export function snapshotStyleRule(rule: StyleRule): Record<string, unknown> {
  return {
    name: rule.name,
    description: rule.description,
    visualCues: rule.visualCues,
    typographyHints: rule.typographyHints,
    compositionHints: rule.compositionHints,
    colorHints: rule.colorHints,
    bestFor: rule.bestFor,
    avoidRules: rule.avoidRules,
    promptModifier: rule.promptModifier,
  };
}

export function applyPatch(
  snapshot: Record<string, unknown>,
  patch: Record<string, unknown>,
): Record<string, unknown> {
  return { ...snapshot, ...patch };
}

export function diffSnapshots(
  current: Record<string, unknown>,
  patched: Record<string, unknown>,
): Array<{ key: string; before: unknown; after: unknown }> {
  const keys = new Set([...Object.keys(current), ...Object.keys(patched)]);
  const rows: Array<{ key: string; before: unknown; after: unknown }> = [];

  for (const key of keys) {
    const before = current[key];
    const after = patched[key];
    if (JSON.stringify(before) !== JSON.stringify(after)) {
      rows.push({ key, before, after });
    }
  }

  return rows;
}

export function targetLabel(targetType: TrendTargetType, targetId: string, name?: string) {
  if (name) return name;
  if (targetType === "special_day") return targetId;
  return targetId;
}
