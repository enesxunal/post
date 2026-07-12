import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatTrendBrainError } from "@/lib/trend-brain/errors";
import type {
  TrendBrainRun,
  TrendBrainSuggestion,
  TrendBrainRunStatus,
  SuggestionStatus,
} from "@/lib/trend-brain/types";

function adminClient() {
  const client = createSupabaseAdminClient();
  if (!client) throw new Error("SUPABASE_SECRET_KEY gerekli");
  return client;
}

function rowToRun(row: Record<string, unknown>): TrendBrainRun {
  return {
    id: row.id as string,
    status: row.status as TrendBrainRun["status"],
    triggerType: row.trigger_type as TrendBrainRun["triggerType"],
    triggeredBy: (row.triggered_by as string | null) ?? null,
    targetsSelected: row.targets_selected as number,
    suggestionsCreated: row.suggestions_created as number,
    summary: (row.summary as Record<string, unknown>) ?? {},
    errorMessage: (row.error_message as string | null) ?? null,
    startedAt: row.started_at as string,
    completedAt: (row.completed_at as string | null) ?? null,
  };
}

function rowToSuggestion(row: Record<string, unknown>): TrendBrainSuggestion {
  return {
    id: row.id as string,
    runId: row.run_id as string,
    targetType: row.target_type as TrendBrainSuggestion["targetType"],
    targetId: row.target_id as string,
    suggestionType: row.suggestion_type as string,
    reason: row.reason as string,
    currentSnapshot: row.current_snapshot as Record<string, unknown>,
    suggestedPatch: row.suggested_patch as Record<string, unknown>,
    confidenceScore: Number(row.confidence_score),
    status: row.status as SuggestionStatus,
    researchSummary: (row.research_summary as string | null) ?? null,
    createdAt: row.created_at as string,
    reviewedAt: (row.reviewed_at as string | null) ?? null,
    reviewedBy: (row.reviewed_by as string | null) ?? null,
  };
}

export async function createTrendBrainRun(triggerType: "cron" | "manual", triggeredBy?: string) {
  const supabase = adminClient();
  const { data, error } = await supabase
    .from("trend_brain_runs")
    .insert({
      status: "running",
      trigger_type: triggerType,
      triggered_by: triggeredBy ?? null,
    })
    .select("*")
    .single();

  if (error) throw new Error(formatTrendBrainError(error));
  return rowToRun(data);
}

export async function completeTrendBrainRun(
  runId: string,
  input: {
    status: TrendBrainRunStatus;
    targetsSelected: number;
    suggestionsCreated: number;
    summary: Record<string, unknown>;
    errorMessage?: string;
  },
) {
  const supabase = adminClient();
  const { data, error } = await supabase
    .from("trend_brain_runs")
    .update({
      status: input.status,
      targets_selected: input.targetsSelected,
      suggestions_created: input.suggestionsCreated,
      summary: input.summary,
      error_message: input.errorMessage ?? null,
      completed_at: new Date().toISOString(),
    })
    .eq("id", runId)
    .select("*")
    .single();

  if (error) throw new Error(formatTrendBrainError(error));
  return rowToRun(data);
}

export async function insertSuggestion(
  suggestion: Omit<TrendBrainSuggestion, "id" | "createdAt" | "reviewedAt" | "reviewedBy">,
) {
  const supabase = adminClient();
  const { data, error } = await supabase
    .from("trend_brain_suggestions")
    .insert({
      run_id: suggestion.runId,
      target_type: suggestion.targetType,
      target_id: suggestion.targetId,
      suggestion_type: suggestion.suggestionType,
      reason: suggestion.reason,
      current_snapshot: suggestion.currentSnapshot,
      suggested_patch: suggestion.suggestedPatch,
      confidence_score: suggestion.confidenceScore,
      status: suggestion.status,
      research_summary: suggestion.researchSummary ?? null,
    })
    .select("*")
    .single();

  if (error) throw new Error(formatTrendBrainError(error));
  return rowToSuggestion(data);
}

export async function listTrendBrainRuns(limit = 20) {
  const supabase = adminClient();
  const { data, error } = await supabase
    .from("trend_brain_runs")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(formatTrendBrainError(error));
  return (data ?? []).map((row) => rowToRun(row));
}

export async function listSuggestions(filters?: { status?: SuggestionStatus; runId?: string }) {
  const supabase = adminClient();
  let query = supabase
    .from("trend_brain_suggestions")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.runId) query = query.eq("run_id", filters.runId);

  const { data, error } = await query.limit(100);
  if (error) throw new Error(formatTrendBrainError(error));
  return (data ?? []).map((row) => rowToSuggestion(row));
}

export async function getSuggestionById(id: string) {
  const supabase = adminClient();
  const { data, error } = await supabase
    .from("trend_brain_suggestions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(formatTrendBrainError(error));
  return data ? rowToSuggestion(data) : null;
}

export async function updateSuggestionStatus(
  id: string,
  status: SuggestionStatus,
  reviewedBy: string,
  patch?: Record<string, unknown>,
) {
  const supabase = adminClient();
  const update: Record<string, unknown> = {
    status,
    reviewed_at: new Date().toISOString(),
    reviewed_by: reviewedBy,
  };

  if (patch) {
    update.suggested_patch = patch;
  }

  const { data, error } = await supabase
    .from("trend_brain_suggestions")
    .update(update)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw new Error(formatTrendBrainError(error));
  return rowToSuggestion(data);
}

export async function recordRevisionFeedback(input: {
  jobId: string;
  userId: string;
  projectId: string;
  dayId: string;
  sector?: string;
  style?: string;
  reason?: string;
  previousArtDirection?: unknown;
  previousPromptVersionRefs?: unknown;
}) {
  const supabase = adminClient();
  const { error } = await supabase.from("revision_feedback").insert({
    job_id: input.jobId,
    user_id: input.userId,
    project_id: input.projectId,
    day_id: input.dayId,
    sector: input.sector ?? null,
    style: input.style ?? null,
    reason: input.reason ?? null,
    signal_type: "regenerate",
    previous_art_direction: input.previousArtDirection ?? null,
    previous_prompt_version_refs: input.previousPromptVersionRefs ?? null,
  });

  if (error) throw new Error(formatTrendBrainError(error));
}

export async function listPerformanceAggregates(limit = 50) {
  const supabase = adminClient();
  const { data, error } = await supabase
    .from("performance_aggregates")
    .select("*")
    .order("computed_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(formatTrendBrainError(error));

  return (data ?? []).map((row) => ({
    id: row.id as string,
    periodStart: row.period_start as string,
    periodEnd: row.period_end as string,
    targetType: row.target_type as string,
    targetId: row.target_id as string,
    dimension: (row.dimension as Record<string, string>) ?? {},
    metrics: row.metrics as import("@/lib/trend-brain/types").PerformanceMetrics,
    sampleSize: row.sample_size as number,
    computedAt: row.computed_at as string,
  }));
}
