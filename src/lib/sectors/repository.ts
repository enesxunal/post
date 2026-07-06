import { normalizeSectorKey, SECTOR_KEY_FROM_SEED } from "@/lib/sectors/sector-key-map";
import {
  getSectorOptionsFromSeed,
  getSectorRuleFromSeed,
  getSectorRulesFromSeed,
} from "@/lib/sectors/seed-data";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SectorRule } from "@/types/domain";

type SectorRuleRow = {
  sector_key: string;
  sector_name: string;
  description?: string | null;
  visual_cues: string;
  tone_hints: string;
  composition_hints?: string | null;
  color_hints?: string | null;
  suitable_elements?: string[] | null;
  avoid_rules_items?: string[] | null;
  avoid_rules: string;
  prompt_modifier: string;
};

async function getClient() {
  return createSupabaseAdminClient() ?? (await createSupabaseServerClient());
}

function rowToRule(row: SectorRuleRow): SectorRule {
  const avoidFromJson = Array.isArray(row.avoid_rules_items) ? row.avoid_rules_items : [];
  const avoidFromText = row.avoid_rules
    ? row.avoid_rules.split(",").map((part) => part.trim()).filter(Boolean)
    : [];

  return {
    key: normalizeSectorKey(row.sector_key),
    name: row.sector_name,
    description: row.description ?? "",
    visualCues: row.visual_cues,
    toneHints: row.tone_hints,
    compositionHints: row.composition_hints ?? "",
    colorHints: row.color_hints ?? "",
    suitableElements: row.suitable_elements?.length ? row.suitable_elements : [],
    avoidRules: avoidFromJson.length ? avoidFromJson : avoidFromText,
    promptModifier: row.prompt_modifier,
  };
}

function ruleToRow(rule: SectorRule): SectorRuleRow {
  return {
    sector_key: rule.key,
    sector_name: rule.name,
    description: rule.description,
    visual_cues: rule.visualCues,
    tone_hints: rule.toneHints,
    composition_hints: rule.compositionHints,
    color_hints: rule.colorHints,
    suitable_elements: rule.suitableElements,
    avoid_rules_items: rule.avoidRules,
    avoid_rules: rule.avoidRules.join(", "),
    prompt_modifier: rule.promptModifier,
  };
}

export { getSectorOptionsFromSeed, getSectorRuleFromSeed, getSectorRulesFromSeed };

export async function listSectorRules(): Promise<SectorRule[]> {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from("sector_modifiers")
    .select("*")
    .order("sector_name", { ascending: true });

  if (error || !data?.length) {
    return getSectorRulesFromSeed();
  }

  return (data as SectorRuleRow[]).map(rowToRule);
}

export async function getSectorRule(sectorKey: string): Promise<SectorRule | undefined> {
  const normalized = normalizeSectorKey(sectorKey);
  const supabase = await getClient();

  const { data } = await supabase
    .from("sector_modifiers")
    .select("*")
    .eq("sector_key", normalized)
    .maybeSingle();

  if (data) {
    return rowToRule(data as SectorRuleRow);
  }

  return getSectorRuleFromSeed(normalized);
}

export async function updateSectorRule(
  sectorKey: string,
  payload: Partial<SectorRule>,
): Promise<SectorRule> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    throw new Error("Güncelleme için SUPABASE_SECRET_KEY gerekli");
  }

  const normalized = normalizeSectorKey(sectorKey);
  const existing = (await getSectorRule(normalized)) ?? getSectorRuleFromSeed(normalized);

  if (!existing) {
    throw new Error("Sektör bulunamadı");
  }

  const merged: SectorRule = {
    ...existing,
    ...payload,
    key: normalized,
    suitableElements: payload.suitableElements ?? existing.suitableElements,
    avoidRules: payload.avoidRules ?? existing.avoidRules,
  };

  const row = {
    ...ruleToRow(merged),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("sector_modifiers")
    .upsert(row, { onConflict: "sector_key" })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Sektör güncellenemedi");
  }

  return rowToRule(data as SectorRuleRow);
}

export async function seedSectorRulesFromCatalog(): Promise<number> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    throw new Error("Seed için SUPABASE_SECRET_KEY gerekli");
  }

  const rows = getSectorRulesFromSeed().map(ruleToRow);
  const { error } = await supabase.from("sector_modifiers").upsert(rows, {
    onConflict: "sector_key",
  });

  if (error) {
    throw new Error(error.message);
  }

  return rows.length;
}

/** Seed key → canonical key lookup (tests/admin) */
export { SECTOR_KEY_FROM_SEED };
