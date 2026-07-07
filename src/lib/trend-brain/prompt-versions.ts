import { updateSectorRule } from "@/lib/sectors/repository";
import { updateSpecialDay } from "@/lib/special-days/repository";
import { updateStyleRule } from "@/lib/styles/repository";
import { applyPatch } from "@/lib/trend-brain/snapshots";
import type { PromptVersion, PromptVersionRefs, TrendBrainSuggestion, TrendTargetType } from "@/lib/trend-brain/types";
import type { SectorKey, SpecialDay, StyleRule, VisualStyle } from "@/types/domain";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

function adminClient() {
  const client = createSupabaseAdminClient();
  if (!client) throw new Error("SUPABASE_SECRET_KEY gerekli");
  return client;
}

function rowToVersion(row: Record<string, unknown>): PromptVersion {
  return {
    id: row.id as string,
    targetType: row.target_type as TrendTargetType,
    targetId: row.target_id as string,
    versionNumber: row.version_number as number,
    snapshot: row.snapshot as Record<string, unknown>,
    changeSummary: (row.change_summary as string | null) ?? null,
    sourceRunId: (row.source_run_id as string | null) ?? null,
    sourceSuggestionId: (row.source_suggestion_id as string | null) ?? null,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at as string,
    createdBy: (row.created_by as string | null) ?? null,
  };
}

export async function getActivePromptVersion(targetType: TrendTargetType, targetId: string) {
  const supabase = adminClient();
  const { data } = await supabase
    .from("prompt_versions")
    .select("*")
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .eq("is_active", true)
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data ? rowToVersion(data) : null;
}

export async function resolvePromptVersionRefs(input: {
  dayId: string;
  sector: string;
  style: string;
}): Promise<PromptVersionRefs> {
  const [specialDay, sector, style] = await Promise.all([
    getActivePromptVersion("special_day", input.dayId),
    getActivePromptVersion("sector", input.sector),
    getActivePromptVersion("style", input.style),
  ]);

  return {
    ...(specialDay
      ? { specialDay: { id: specialDay.id, version: specialDay.versionNumber } }
      : {}),
    ...(sector ? { sector: { id: sector.id, version: sector.versionNumber } } : {}),
    ...(style ? { style: { id: style.id, version: style.versionNumber } } : {}),
  };
}

async function nextVersionNumber(targetType: TrendTargetType, targetId: string) {
  const supabase = adminClient();
  const { data } = await supabase
    .from("prompt_versions")
    .select("version_number")
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  return ((data?.version_number as number | undefined) ?? 0) + 1;
}

async function deactivateVersions(targetType: TrendTargetType, targetId: string) {
  const supabase = adminClient();
  await supabase
    .from("prompt_versions")
    .update({ is_active: false })
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .eq("is_active", true);
}

async function applyToLiveTables(
  suggestion: TrendBrainSuggestion,
  merged: Record<string, unknown>,
) {
  if (suggestion.targetType === "special_day") {
    await updateSpecialDay(suggestion.targetId, {
      headlineAlternatives: merged.headlineAlternatives as string[] | undefined,
      captionIdeas: merged.captionIdeas as string[] | undefined,
      visualDirection: merged.visualDirection as string | undefined,
      avoidRules: merged.avoidRules as string | undefined,
      promptTemplate: merged.promptTemplate as string | undefined,
      culturalContext: merged.culturalContext as string | undefined,
      promptBuildingBlocks: merged.promptBuildingBlocks as SpecialDay["promptBuildingBlocks"],
      masterPromptTemplate: merged.masterPromptTemplate as string | undefined,
      popularUsages: merged.popularUsages as string[] | undefined,
    });
    return;
  }

  if (suggestion.targetType === "sector") {
    await updateSectorRule(suggestion.targetId as SectorKey, {
      description: merged.description as string | undefined,
      visualCues: merged.visualCues as string | undefined,
      toneHints: merged.toneHints as string | undefined,
      compositionHints: merged.compositionHints as string | undefined,
      colorHints: merged.colorHints as string | undefined,
      suitableElements: merged.suitableElements as string[] | undefined,
      avoidRules: merged.avoidRules as string[] | undefined,
      promptModifier: merged.promptModifier as string | undefined,
    });
    return;
  }

  await updateStyleRule(suggestion.targetId as VisualStyle, {
    description: merged.description as string | undefined,
    visualCues: merged.visualCues as string | undefined,
    typographyHints: merged.typographyHints as string | undefined,
    compositionHints: merged.compositionHints as string | undefined,
    colorHints: merged.colorHints as string | undefined,
    bestFor: merged.bestFor as string[] | undefined,
    avoidRules: merged.avoidRules as string[] | undefined,
    promptModifier: merged.promptModifier as string | undefined,
  });
}

export async function createPromptVersionFromSuggestion(
  suggestion: TrendBrainSuggestion,
  reviewedBy: string,
) {
  const merged = applyPatch(suggestion.currentSnapshot, suggestion.suggestedPatch);
  await applyToLiveTables(suggestion, merged);

  const versionNumber = await nextVersionNumber(suggestion.targetType, suggestion.targetId);
  await deactivateVersions(suggestion.targetType, suggestion.targetId);

  const supabase = adminClient();
  const { data, error } = await supabase
    .from("prompt_versions")
    .insert({
      target_type: suggestion.targetType,
      target_id: suggestion.targetId,
      version_number: versionNumber,
      snapshot: merged,
      change_summary: suggestion.reason,
      source_run_id: suggestion.runId,
      source_suggestion_id: suggestion.id,
      is_active: true,
      created_by: reviewedBy,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return rowToVersion(data);
}

export async function ensureInitialPromptVersion(
  targetType: TrendTargetType,
  targetId: string,
  snapshot: Record<string, unknown>,
  createdBy = "system",
) {
  const existing = await getActivePromptVersion(targetType, targetId);
  if (existing) return existing;

  const supabase = adminClient();
  const { data, error } = await supabase
    .from("prompt_versions")
    .insert({
      target_type: targetType,
      target_id: targetId,
      version_number: 1,
      snapshot,
      change_summary: "Initial seed version",
      is_active: true,
      created_by: createdBy,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return rowToVersion(data);
}
