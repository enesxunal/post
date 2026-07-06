import type { SpecialDay, SpecialDayCategory, DayType, PromptBuildingBlocks } from "@/types/domain";

export type SpecialDayRow = {
  id: string;
  name: string;
  slug: string;
  category: string;
  date_type: string;
  date_value: string;
  importance: string;
  cultural_context: string;
  popular_usages: string[];
  headline_alternatives: string[];
  caption_ideas: string[];
  visual_direction: string;
  avoid_rules: string;
  prompt_template: string;
  prompt_building_blocks?: PromptBuildingBlocks | Record<string, never>;
  master_prompt_template?: string;
  is_default_selected: boolean;
  is_active: boolean;
};

function parseBuildingBlocks(raw: SpecialDayRow["prompt_building_blocks"]): PromptBuildingBlocks | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const blocks = raw as Partial<PromptBuildingBlocks>;
  if (!blocks.eventBrief && !blocks.brandPersonalizationRules?.length) return undefined;
  return {
    eventBrief: blocks.eventBrief ?? "",
    brandPersonalizationRules: blocks.brandPersonalizationRules ?? [],
    visualRules: blocks.visualRules ?? [],
    avoid: blocks.avoid ?? [],
  };
}

export function rowToSpecialDay(row: SpecialDayRow): SpecialDay {
  const promptBuildingBlocks = parseBuildingBlocks(row.prompt_building_blocks);
  const masterPromptTemplate = row.master_prompt_template?.trim() || undefined;

  return {
    id: row.slug,
    name: row.name,
    slug: row.slug,
    category: row.category as SpecialDayCategory,
    dateType: row.date_type as DayType,
    dateValue: row.date_value,
    importance: row.importance as SpecialDay["importance"],
    culturalContext: row.cultural_context,
    popularUsages: row.popular_usages ?? [],
    headlineAlternatives: row.headline_alternatives ?? [],
    captionIdeas: row.caption_ideas ?? [],
    visualDirection: row.visual_direction,
    avoidRules: row.avoid_rules,
    promptTemplate: row.prompt_template,
    promptBuildingBlocks,
    masterPromptTemplate,
    isDefaultSelected: row.is_default_selected,
  };
}

export function specialDayToRow(day: SpecialDay): Omit<SpecialDayRow, "id" | "is_active"> & {
  is_active?: boolean;
} {
  return {
    name: day.name,
    slug: day.id,
    category: day.category,
    date_type: day.dateType,
    date_value: day.dateValue,
    importance: day.importance,
    cultural_context: day.culturalContext,
    popular_usages: day.popularUsages,
    headline_alternatives: day.headlineAlternatives,
    caption_ideas: day.captionIdeas,
    visual_direction: day.visualDirection,
    avoid_rules: day.avoidRules,
    prompt_template: day.promptTemplate,
    prompt_building_blocks: day.promptBuildingBlocks ?? {},
    master_prompt_template: day.masterPromptTemplate ?? day.promptTemplate ?? "",
    is_default_selected: day.isDefaultSelected,
    is_active: true,
  };
}

/** Katalog metinlerini daha güçlü post brief'ine çevirir. */
export function enrichSpecialDayCopy(day: SpecialDay): SpecialDay {
  const headline = day.headlineAlternatives[0] ?? day.name;

  const culturalContext =
    day.culturalContext.length >= 40
      ? day.culturalContext
      : `${day.culturalContext} KOBİ sosyal medya hesabı için samimi, güven veren ve paylaşılabilir bir ton kullan.`;

  const captionIdeas =
    day.captionIdeas.length >= 2
      ? day.captionIdeas
      : [
          ...day.captionIdeas,
          `${day.name} kutlu olsun — markanıza özel kısa paylaşım metni.`,
          `${headline} temalı, sıcak ve profesyonel bir caption yaz.`,
        ];

  const hasRichTemplate =
    Boolean(day.masterPromptTemplate?.includes("Customer brand context")) ||
    day.promptTemplate.includes("Instagram");

  const promptTemplate = hasRichTemplate
    ? (day.masterPromptTemplate ?? day.promptTemplate)
    : [
        `Türkiye'deki küçük işletmeler için ${day.name} özel günü Instagram kare postu tasarla.`,
        `Görselde Türkçe başlık: "${headline}".`,
        day.promptTemplate,
        `Görsel yön: ${day.visualDirection}.`,
        `Kültürel bağlam: ${culturalContext}`,
        "Marka logosu için alan bırak, okunaklı tipografi, premium KOBİ estetiği.",
      ].join(" ");

  return {
    ...day,
    culturalContext,
    captionIdeas: [...new Set(captionIdeas)],
    promptTemplate,
    masterPromptTemplate: day.masterPromptTemplate ?? promptTemplate,
  };
}
