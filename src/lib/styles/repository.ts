import { normalizeStyleKey } from "@/lib/styles/style-key-map";
import {
  getStyleOptionsFromSeed,
  getStyleRuleFromSeed,
  getStyleRulesFromSeed,
} from "@/lib/styles/seed-data";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { StyleRule } from "@/types/domain";

type StyleRuleRow = {
  style_key: string;
  style_name: string;
  description: string;
  visual_cues?: string | null;
  typography_hints?: string | null;
  composition_hints?: string | null;
  color_hints?: string | null;
  best_for?: string[] | null;
  avoid_rules_items?: string[] | null;
  avoid_rules?: string | null;
  prompt_modifier: string;
};

async function getClient() {
  return createSupabaseAdminClient() ?? (await createSupabaseServerClient());
}

function rowToRule(row: StyleRuleRow): StyleRule {
  const avoidFromJson = Array.isArray(row.avoid_rules_items) ? row.avoid_rules_items : [];
  const avoidFromText = row.avoid_rules
    ? row.avoid_rules.split(",").map((part) => part.trim()).filter(Boolean)
    : [];

  return {
    key: normalizeStyleKey(row.style_key),
    name: row.style_name,
    description: row.description,
    visualCues: row.visual_cues ?? "",
    typographyHints: row.typography_hints ?? "",
    compositionHints: row.composition_hints ?? "",
    colorHints: row.color_hints ?? "",
    bestFor: row.best_for?.length ? row.best_for : [],
    avoidRules: avoidFromJson.length ? avoidFromJson : avoidFromText,
    promptModifier: row.prompt_modifier,
  };
}

function ruleToRow(rule: StyleRule): StyleRuleRow {
  return {
    style_key: rule.key,
    style_name: rule.name,
    description: rule.description,
    visual_cues: rule.visualCues,
    typography_hints: rule.typographyHints,
    composition_hints: rule.compositionHints,
    color_hints: rule.colorHints,
    best_for: rule.bestFor,
    avoid_rules_items: rule.avoidRules,
    avoid_rules: rule.avoidRules.join(", "),
    prompt_modifier: rule.promptModifier,
  };
}

export { getStyleOptionsFromSeed, getStyleRuleFromSeed, getStyleRulesFromSeed };

export async function listStyleRules(): Promise<StyleRule[]> {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from("style_modifiers")
    .select("*")
    .order("style_name", { ascending: true });

  if (error || !data?.length) {
    return getStyleRulesFromSeed();
  }

  return (data as StyleRuleRow[]).map(rowToRule);
}

export async function getStyleRule(styleKey: string): Promise<StyleRule | undefined> {
  const normalized = normalizeStyleKey(styleKey);
  const supabase = await getClient();

  const { data } = await supabase
    .from("style_modifiers")
    .select("*")
    .eq("style_key", normalized)
    .maybeSingle();

  if (data) {
    return rowToRule(data as StyleRuleRow);
  }

  return getStyleRuleFromSeed(normalized);
}

export async function updateStyleRule(
  styleKey: string,
  payload: Partial<StyleRule>,
): Promise<StyleRule> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    throw new Error("Güncelleme için SUPABASE_SECRET_KEY gerekli");
  }

  const normalized = normalizeStyleKey(styleKey);
  const existing = (await getStyleRule(normalized)) ?? getStyleRuleFromSeed(normalized);

  if (!existing) {
    throw new Error("Stil bulunamadı");
  }

  const merged: StyleRule = {
    ...existing,
    ...payload,
    key: normalized,
    bestFor: payload.bestFor ?? existing.bestFor,
    avoidRules: payload.avoidRules ?? existing.avoidRules,
  };

  const row = {
    ...ruleToRow(merged),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("style_modifiers")
    .upsert(row, { onConflict: "style_key" })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Stil güncellenemedi");
  }

  return rowToRule(data as StyleRuleRow);
}

export async function seedStyleRulesFromCatalog(): Promise<number> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    throw new Error("Seed için SUPABASE_SECRET_KEY gerekli");
  }

  const rows = getStyleRulesFromSeed().map(ruleToRow);
  const { error } = await supabase.from("style_modifiers").upsert(rows, {
    onConflict: "style_key",
  });

  if (error) {
    throw new Error(error.message);
  }

  return rows.length;
}
