import seedData from "./prompt-seed.json";

export type PromptSeedBuildingBlocks = {
  event_brief: string;
  brand_personalization_rules: string[];
  visual_rules: string[];
  avoid: string[];
};

export type PromptSeedEntry = {
  slug: string;
  name: string;
  category: string;
  is_default_selected: boolean;
  importance: "high" | "medium" | "low";
  cultural_context: string;
  visual_direction: string;
  headline_alternatives: string[];
  caption_ideas: string[];
  prompt_building_blocks: PromptSeedBuildingBlocks;
  master_prompt_template: string;
};

export const specialDaysPromptSeed = seedData as PromptSeedEntry[];
