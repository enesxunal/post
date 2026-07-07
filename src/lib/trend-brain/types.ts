export type TrendTargetType = "special_day" | "sector" | "style";

export type SuggestionStatus = "pending" | "approved" | "rejected" | "applied";

export type TrendBrainRunStatus = "running" | "completed" | "failed";

export type TrendBrainTrigger = "cron" | "manual";

export type PromptVersionRefs = {
  specialDay?: { id: string; version: number };
  sector?: { id: string; version: number };
  style?: { id: string; version: number };
};

export type PerformanceMetrics = {
  totalJobs: number;
  readyJobs: number;
  failedJobs: number;
  regenerateCount: number;
  approvalCount: number;
  regenerateRate: number;
  failureRate: number;
  approvalRate: number;
};

export type PerformanceAggregate = {
  id: string;
  periodStart: string;
  periodEnd: string;
  targetType: TrendTargetType | "combo";
  targetId: string;
  dimension: Record<string, string>;
  metrics: PerformanceMetrics;
  sampleSize: number;
  computedAt: string;
};

export type TrendBrainRun = {
  id: string;
  status: TrendBrainRunStatus;
  triggerType: TrendBrainTrigger;
  triggeredBy?: string | null;
  targetsSelected: number;
  suggestionsCreated: number;
  summary: Record<string, unknown>;
  errorMessage?: string | null;
  startedAt: string;
  completedAt?: string | null;
};

export type TrendBrainSuggestion = {
  id: string;
  runId: string;
  targetType: TrendTargetType;
  targetId: string;
  suggestionType: string;
  reason: string;
  currentSnapshot: Record<string, unknown>;
  suggestedPatch: Record<string, unknown>;
  confidenceScore: number;
  status: SuggestionStatus;
  researchSummary?: string | null;
  createdAt: string;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
};

export type PromptVersion = {
  id: string;
  targetType: TrendTargetType;
  targetId: string;
  versionNumber: number;
  snapshot: Record<string, unknown>;
  changeSummary?: string | null;
  sourceRunId?: string | null;
  sourceSuggestionId?: string | null;
  isActive: boolean;
  createdAt: string;
  createdBy?: string | null;
};

export type PriorityTarget = {
  targetType: TrendTargetType;
  targetId: string;
  label: string;
  priorityScore: number;
  reasons: string[];
};

export type TrendResearchSummary = {
  targetType: TrendTargetType;
  targetId: string;
  summary: string;
  toneNotes: string[];
  phraseHints: string[];
  visualNotes: string[];
  avoidNotes: string[];
};
