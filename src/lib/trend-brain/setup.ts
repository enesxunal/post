import { createSupabaseAdminClient } from "@/lib/supabase/admin";

import { isTrendBrainSetupError } from "@/lib/trend-brain/errors";

export type TrendBrainSetupStatus = {
  ready: boolean;
  missingTables: string[];
};

const REQUIRED_TABLES = [
  "trend_brain_runs",
  "trend_brain_suggestions",
  "performance_aggregates",
  "revision_feedback",
  "prompt_versions",
] as const;

export async function checkTrendBrainSetup(): Promise<TrendBrainSetupStatus> {
  const client = createSupabaseAdminClient();
  if (!client) {
    return { ready: false, missingTables: [...REQUIRED_TABLES] };
  }

  const missingTables: string[] = [];

  for (const table of REQUIRED_TABLES) {
    const { error } = await client.from(table).select("id").limit(1);
    if (error && isTrendBrainSetupError(error)) {
      missingTables.push(table);
    }
  }

  return {
    ready: missingTables.length === 0,
    missingTables,
  };
}
