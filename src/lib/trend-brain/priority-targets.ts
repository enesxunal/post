import { listSpecialDays } from "@/lib/special-days/repository";
import type { PerformanceAggregate, PriorityTarget, TrendTargetType } from "@/lib/trend-brain/types";
import type { SpecialDay } from "@/types/domain";

type MetricBucket = {
  total: number;
  ready: number;
  failed: number;
  regenerates: number;
  approvals: number;
};

function parseMonthDay(dateValue: string): { month: number; day: number } | null {
  const match = dateValue.match(/(\d{1,2})[./](\d{1,2})/);
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  if (!day || !month || month > 12) return null;
  return { month, day };
}

function daysUntil(day: SpecialDay, from = new Date()): number | null {
  const parts = parseMonthDay(day.dateValue);
  if (!parts) return null;

  const year = from.getFullYear();
  let target = new Date(year, parts.month - 1, parts.day);
  if (target.getTime() < from.getTime()) {
    target = new Date(year + 1, parts.month - 1, parts.day);
  }

  return Math.ceil((target.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

function importanceScore(day: SpecialDay) {
  if (day.importance === "high") return 30;
  if (day.importance === "medium") return 15;
  return 5;
}

function categoryBoost(category: SpecialDay["category"]) {
  if (category === "national" || category === "religious" || category === "holiday") return 20;
  if (category === "friday") return 10;
  return 0;
}

export async function selectPriorityTargets(
  aggregates: PerformanceAggregate[],
  maxTargets = 10,
): Promise<PriorityTarget[]> {
  const days = await listSpecialDays();
  const underperforming = new Map(
    aggregates
      .filter((item) => item.targetType === "special_day")
      .map((item) => [item.targetId, item]),
  );

  const scored: PriorityTarget[] = days
    .map((day) => {
      const until = daysUntil(day);
      const perf = underperforming.get(day.id) ?? underperforming.get(day.slug);
      const reasons: string[] = [];
      let score = importanceScore(day) + categoryBoost(day.category);

      if (until !== null && until >= 0 && until <= 60) {
        score += Math.max(0, 60 - until);
        reasons.push(`Yaklaşan gün (${until} gün)`);
      }

      if (perf && perf.metrics.regenerateRate >= 0.25) {
        score += 40;
        reasons.push(`Yüksek revizyon oranı (%${Math.round(perf.metrics.regenerateRate * 100)})`);
      }

      if (perf && perf.metrics.failureRate >= 0.2) {
        score += 25;
        reasons.push(`Üretim hata oranı yüksek`);
      }

      if (reasons.length === 0) {
        reasons.push("Periyodik içerik tazeleme");
      }

      return {
        targetType: "special_day" as TrendTargetType,
        targetId: day.slug || day.id,
        label: day.name,
        priorityScore: score,
        reasons,
      };
    })
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, maxTargets);

  return scored;
}

export async function selectSectorStyleTargets(
  aggregates: PerformanceAggregate[],
  maxEach = 2,
): Promise<PriorityTarget[]> {
  const targets: PriorityTarget[] = [];

  for (const targetType of ["sector", "style"] as const) {
    const rows = aggregates
      .filter((item) => item.targetType === targetType && item.sampleSize >= 5)
      .sort((a, b) => b.metrics.regenerateRate - a.metrics.regenerateRate)
      .slice(0, maxEach);

    for (const row of rows) {
      targets.push({
        targetType,
        targetId: row.targetId,
        label: row.targetId,
        priorityScore: Math.round(row.metrics.regenerateRate * 100 + row.metrics.failureRate * 50),
        reasons: [
          `Revizyon oranı %${Math.round(row.metrics.regenerateRate * 100)}`,
          `${row.sampleSize} örneklem`,
        ],
      });
    }
  }

  return targets;
}
