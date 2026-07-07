import { getSectorRule } from "@/lib/sectors/repository";
import { getSpecialDayFromStore } from "@/lib/special-days/repository";
import { getStyleRule } from "@/lib/styles/repository";
import { fetchTrendResearchMock } from "@/lib/trend-brain/research/mock-provider";
import {
  applyPatch,
  snapshotSectorRule,
  snapshotSpecialDay,
  snapshotStyleRule,
} from "@/lib/trend-brain/snapshots";
import type {
  PerformanceAggregate,
  PriorityTarget,
  TrendBrainSuggestion,
  TrendResearchSummary,
} from "@/lib/trend-brain/types";

function uniqueStrings(values: string[], max = 6) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))].slice(0, max);
}

function confidenceFromSignals(perf?: PerformanceAggregate, research?: TrendResearchSummary) {
  let score = 0.45;
  if (perf && perf.metrics.regenerateRate >= 0.3) score += 0.2;
  if (perf && perf.sampleSize >= 10) score += 0.1;
  if (research?.phraseHints.length) score += 0.1;
  if (research?.visualNotes.length) score += 0.05;
  return Math.min(0.95, Number(score.toFixed(3)));
}

async function loadCurrentSnapshot(target: PriorityTarget) {
  if (target.targetType === "special_day") {
    const day = await getSpecialDayFromStore(target.targetId);
    if (!day) return null;
    return snapshotSpecialDay(day);
  }
  if (target.targetType === "sector") {
    const rule = await getSectorRule(target.targetId as import("@/types/domain").SectorKey);
    if (!rule) return null;
    return snapshotSectorRule(rule);
  }
  const rule = await getStyleRule(target.targetId as import("@/types/domain").VisualStyle);
  if (!rule) return null;
  return snapshotStyleRule(rule);
}

function buildSpecialDayPatch(
  snapshot: Record<string, unknown>,
  research: TrendResearchSummary,
  perf?: PerformanceAggregate,
) {
  const headlines = uniqueStrings([
  ...((snapshot.headlineAlternatives as string[]) ?? []),
    ...research.phraseHints,
  ]);

  const visualDirection = [
    research.summary,
    ...research.visualNotes,
    snapshot.visualDirection as string,
  ]
    .filter(Boolean)
    .join(" ")
    .slice(0, 420);

  const avoidRules = uniqueStrings([
    ...((snapshot.avoidRules as string)?.split(",").map((s) => s.trim()) ?? []),
    ...research.avoidNotes,
    "generic stock template",
  ]).join(", ");

  const captionIdeas = uniqueStrings([
    ...((snapshot.captionIdeas as string[]) ?? []),
    `${research.toneNotes.join(", ")} tonda kısa kutlama metni`,
  ], 5);

  const patch: Record<string, unknown> = {
    headlineAlternatives: headlines,
    visualDirection,
    avoidRules,
    captionIdeas,
  };

  if (perf && perf.metrics.regenerateRate >= 0.3) {
    patch.promptTemplate = [
      snapshot.promptTemplate,
      "Prefer editorial composition over standard top-title card layout.",
      research.visualNotes[0],
    ]
      .filter(Boolean)
      .join(" ");
  }

  return patch;
}

function buildSectorPatch(snapshot: Record<string, unknown>, research: TrendResearchSummary) {
  return {
    visualCues: [research.summary, snapshot.visualCues].filter(Boolean).join(" "),
    compositionHints: uniqueStrings([
      snapshot.compositionHints as string,
      ...research.visualNotes,
    ], 3).join("; "),
    promptModifier: [snapshot.promptModifier, research.summary].filter(Boolean).join(" "),
  };
}

function buildStylePatch(snapshot: Record<string, unknown>, research: TrendResearchSummary) {
  return {
    compositionHints: uniqueStrings([
      snapshot.compositionHints as string,
      ...research.visualNotes,
    ], 3).join("; "),
    visualCues: [snapshot.visualCues, research.summary].filter(Boolean).join(" "),
    promptModifier: [snapshot.promptModifier, "Favor editorial and cinematic layouts."].join(" "),
  };
}

export async function generateSuggestionForTarget(
  runId: string,
  target: PriorityTarget,
  aggregates: PerformanceAggregate[],
): Promise<Omit<TrendBrainSuggestion, "id" | "createdAt" | "reviewedAt" | "reviewedBy"> | null> {
  const currentSnapshot = await loadCurrentSnapshot(target);
  if (!currentSnapshot) return null;

  const research = await fetchTrendResearchMock({
    targetType: target.targetType,
    targetId: target.targetId,
    label: target.label,
  });

  const perf = aggregates.find(
    (item) => item.targetType === target.targetType && item.targetId === target.targetId,
  );

  let suggestedPatch: Record<string, unknown>;
  let suggestionType = "content_refresh";

  if (target.targetType === "special_day") {
    suggestedPatch = buildSpecialDayPatch(currentSnapshot, research, perf);
    suggestionType = perf && perf.metrics.regenerateRate >= 0.3 ? "headline_visual_refresh" : "seasonal_refresh";
  } else if (target.targetType === "sector") {
    suggestedPatch = buildSectorPatch(currentSnapshot, research);
    suggestionType = "sector_tone_refresh";
  } else {
    suggestedPatch = buildStylePatch(currentSnapshot, research);
    suggestionType = "style_composition_refresh";
  }

  const reason = [
    ...target.reasons,
    research.summary,
    perf ? `Son dönem revizyon oranı: %${Math.round(perf.metrics.regenerateRate * 100)}` : null,
  ]
    .filter(Boolean)
    .join(" • ");

  return {
    runId,
    targetType: target.targetType,
    targetId: target.targetId,
    suggestionType,
    reason,
    currentSnapshot,
    suggestedPatch,
    confidenceScore: confidenceFromSignals(perf, research),
    status: "pending",
    researchSummary: research.summary,
  };
}

export function previewSuggestionMerge(suggestion: TrendBrainSuggestion) {
  return applyPatch(suggestion.currentSnapshot, suggestion.suggestedPatch);
}
