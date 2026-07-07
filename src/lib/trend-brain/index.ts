export type * from "@/lib/trend-brain/types";
export { runTrendBrain } from "@/lib/trend-brain/run-orchestrator";
export {
  listTrendBrainRuns,
  listSuggestions,
  getSuggestionById,
  updateSuggestionStatus,
  listPerformanceAggregates,
  recordRevisionFeedback,
} from "@/lib/trend-brain/repository";
export {
  createPromptVersionFromSuggestion,
  resolvePromptVersionRefs,
  getActivePromptVersion,
} from "@/lib/trend-brain/prompt-versions";
export { previewSuggestionMerge } from "@/lib/trend-brain/suggestion-generator";
export { diffSnapshots } from "@/lib/trend-brain/snapshots";
