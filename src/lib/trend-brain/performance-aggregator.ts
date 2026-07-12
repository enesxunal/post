import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatTrendBrainError } from "@/lib/trend-brain/errors";
import type { PerformanceAggregate, PerformanceMetrics, TrendTargetType } from "@/lib/trend-brain/types";

type JobRow = {
  id: string;
  type: string;
  status: string;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  project_id: string;
};

type ProjectRow = {
  id: string;
  sector: string;
  visual_style: string;
};

type RevisionRow = {
  day_id: string;
  sector: string | null;
  style: string | null;
  created_at: string;
};

type MetricBucket = {
  total: number;
  ready: number;
  failed: number;
  regenerates: number;
  approvals: number;
};

function metricsFromCounts(input: MetricBucket): PerformanceMetrics {
  const total = input.total || 1;
  return {
    totalJobs: input.total,
    readyJobs: input.ready,
    failedJobs: input.failed,
    regenerateCount: input.regenerates,
    approvalCount: input.approvals,
    regenerateRate: Number((input.regenerates / total).toFixed(3)),
    failureRate: Number((input.failed / total).toFixed(3)),
    approvalRate: Number((input.approvals / total).toFixed(3)),
  };
}

function adminClient() {
  const client = createSupabaseAdminClient();
  if (!client) throw new Error("SUPABASE_SECRET_KEY gerekli");
  return client;
}

export async function aggregatePerformanceSignals(days = 30) {
  const supabase = adminClient();
  const periodEnd = new Date();
  const periodStart = new Date();
  periodStart.setDate(periodStart.getDate() - days);

  const startIso = periodStart.toISOString();
  const endIso = periodEnd.toISOString();

  const { data: jobs, error: jobsError } = await supabase
    .from("generation_jobs")
    .select("id, type, status, approved_at, created_at, updated_at, project_id")
    .gte("created_at", startIso)
    .lte("created_at", endIso);

  if (jobsError) throw new Error(formatTrendBrainError(jobsError));

  const jobList = (jobs ?? []) as JobRow[];
  const projectIds = [...new Set(jobList.map((job) => job.project_id))];

  const { data: projects } = await supabase
    .from("projects")
    .select("id, sector, visual_style")
    .in("id", projectIds.length ? projectIds : ["00000000-0000-0000-0000-000000000000"]);

  const projectMap = new Map(
    ((projects ?? []) as ProjectRow[]).map((project) => [project.id, project]),
  );

  const { data: revisions, error: revisionsError } = await supabase
    .from("revision_feedback")
    .select("day_id, sector, style, created_at")
    .gte("created_at", startIso)
    .lte("created_at", endIso);

  if (revisionsError) throw new Error(formatTrendBrainError(revisionsError));

  const revisionList = (revisions ?? []) as RevisionRow[];

  const byDay = new Map<string, MetricBucket>();
  const bySector = new Map<string, MetricBucket>();
  const byStyle = new Map<string, MetricBucket>();

  const bump = (map: Map<string, MetricBucket>, key: string, job: JobRow) => {
    const current = map.get(key) ?? { total: 0, ready: 0, failed: 0, regenerates: 0, approvals: 0 };
    current.total += 1;
    if (job.status === "ready") current.ready += 1;
    if (job.status === "failed") current.failed += 1;
    if (job.approved_at) current.approvals += 1;
    map.set(key, current);
  };

  for (const job of jobList) {
    bump(byDay, job.type, job);
    const project = projectMap.get(job.project_id);
    if (project?.sector) bump(bySector, project.sector, job);
    if (project?.visual_style) bump(byStyle, project.visual_style, job);
  }

  for (const revision of revisionList) {
    const dayBucket = byDay.get(revision.day_id);
    if (dayBucket) dayBucket.regenerates += 1;
    if (revision.sector) {
      const sectorBucket = bySector.get(revision.sector);
      if (sectorBucket) sectorBucket.regenerates += 1;
    }
    if (revision.style) {
      const styleBucket = byStyle.get(revision.style);
      if (styleBucket) styleBucket.regenerates += 1;
    }
  }

  const aggregates: PerformanceAggregate[] = [];

  const persist = async (
    targetType: TrendTargetType | "combo",
    targetId: string,
    bucket: MetricBucket,
    dimension: Record<string, string> = {},
  ) => {
    if (bucket.total === 0) return;
    const metrics = metricsFromCounts(bucket);
    const row = {
      period_start: periodStart.toISOString().slice(0, 10),
      period_end: periodEnd.toISOString().slice(0, 10),
      target_type: targetType,
      target_id: targetId,
      dimension,
      metrics,
      sample_size: bucket.total,
      computed_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("performance_aggregates")
      .insert({
        period_start: row.period_start,
        period_end: row.period_end,
        target_type: row.target_type,
        target_id: row.target_id,
        dimension: row.dimension,
        metrics: row.metrics,
        sample_size: row.sample_size,
        computed_at: row.computed_at,
      })
      .select("id")
      .single();

    if (error) throw new Error(formatTrendBrainError(error));

    aggregates.push({
      id: data.id as string,
      periodStart: row.period_start,
      periodEnd: row.period_end,
      targetType: targetType,
      targetId: targetId,
      dimension,
      metrics,
      sampleSize: bucket.total,
      computedAt: row.computed_at,
    });
  };

  for (const [dayId, bucket] of byDay) {
    await persist("special_day", dayId, bucket);
  }
  for (const [sector, bucket] of bySector) {
    await persist("sector", sector, bucket);
  }
  for (const [style, bucket] of byStyle) {
    await persist("style", style, bucket);
  }

  return aggregates;
}

export function pickUnderperformingTargets(
  aggregates: PerformanceAggregate[],
  limit = 5,
): PerformanceAggregate[] {
  return [...aggregates]
    .filter((item) => item.sampleSize >= 3)
    .sort((a, b) => {
      const scoreA = a.metrics.regenerateRate * 2 + a.metrics.failureRate;
      const scoreB = b.metrics.regenerateRate * 2 + b.metrics.failureRate;
      return scoreB - scoreA;
    })
    .slice(0, limit);
}
