import { enrichSpecialDayCopy } from "@/lib/special-days/db-mapper";
import {
  specialDaysPromptSeed,
  type PromptSeedBuildingBlocks,
} from "@/lib/special-days/prompt-seed";
import { specialDaysCatalog } from "@/lib/special-days-data";
import type { PromptBuildingBlocks, SpecialDay } from "@/types/domain";

function mapBuildingBlocks(blocks: PromptSeedBuildingBlocks): PromptBuildingBlocks {
  return {
    eventBrief: blocks.event_brief,
    brandPersonalizationRules: blocks.brand_personalization_rules,
    visualRules: blocks.visual_rules,
    avoid: blocks.avoid,
  };
}

/** Katalog tarih bilgileri + GPT prompt seed metinlerini birleştirir. */
export function buildSpecialDaysFromPromptSeed(): SpecialDay[] {
  return specialDaysCatalog.map((catalogDay) => {
    const seed = specialDaysPromptSeed.find((item) => item.slug === catalogDay.id);
    if (!seed) {
      return enrichSpecialDayCopy(catalogDay);
    }

    const blocks = mapBuildingBlocks(seed.prompt_building_blocks);

    return enrichSpecialDayCopy({
      ...catalogDay,
      name: seed.name,
      culturalContext: seed.cultural_context,
      visualDirection: seed.visual_direction,
      headlineAlternatives: [...seed.headline_alternatives],
      captionIdeas: [...seed.caption_ideas],
      importance: seed.importance,
      isDefaultSelected: seed.is_default_selected,
      promptBuildingBlocks: blocks,
      masterPromptTemplate: seed.master_prompt_template,
      promptTemplate: seed.master_prompt_template,
      avoidRules: blocks.avoid.join(", "),
    });
  });
}
