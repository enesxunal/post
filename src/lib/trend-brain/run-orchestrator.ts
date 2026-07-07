import {
  aggregatePerformanceSignals,
  pickUnderperformingTargets,
} from "@/lib/trend-brain/performance-aggregator";
import {
  selectPriorityTargets,
  selectSectorStyleTargets,
} from "@/lib/trend-brain/priority-targets";
import {
  completeTrendBrainRun,
  createTrendBrainRun,
  insertSuggestion,
} from "@/lib/trend-brain/repository";
import { generateSuggestionForTarget } from "@/lib/trend-brain/suggestion-generator";
import type { PriorityTarget } from "@/lib/trend-brain/types";

const MAX_TARGETS = 10;

export async function runTrendBrain(input: {
  triggerType: "cron" | "manual";
  triggeredBy?: string;
}) {
  const run = await createTrendBrainRun(input.triggerType, input.triggeredBy);

  try {
    const aggregates = await aggregatePerformanceSignals(30);
    const dayTargets = await selectPriorityTargets(aggregates, MAX_TARGETS - 2);
    const comboTargets = await selectSectorStyleTargets(aggregates, 2);

    const targets: PriorityTarget[] = [...dayTargets, ...comboTargets].slice(0, MAX_TARGETS);
    const underperforming = pickUnderperformingTargets(aggregates, 5);

    let suggestionsCreated = 0;

    for (const target of targets) {
      const suggestion = await generateSuggestionForTarget(run.id, target, aggregates);
      if (!suggestion) continue;
      await insertSuggestion(suggestion);
      suggestionsCreated += 1;
    }

    const completed = await completeTrendBrainRun(run.id, {
      status: "completed",
      targetsSelected: targets.length,
      suggestionsCreated,
      summary: {
        aggregatesCount: aggregates.length,
        underperforming: underperforming.map((item) => ({
          targetType: item.targetType,
          targetId: item.targetId,
          regenerateRate: item.metrics.regenerateRate,
          sampleSize: item.sampleSize,
        })),
        targets: targets.map((target) => ({
          targetType: target.targetType,
          targetId: target.targetId,
          label: target.label,
          priorityScore: target.priorityScore,
          reasons: target.reasons,
        })),
        researchProvider: "mock",
      },
    });

    return completed;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Trend Brain başarısız";
    await completeTrendBrainRun(run.id, {
      status: "failed",
      targetsSelected: 0,
      suggestionsCreated: 0,
      summary: {},
      errorMessage: message,
    });
    throw error;
  }
}
