import type { BrandContext } from "@/types/domain";
import type { SectorRule } from "@/types/domain";

/** Sektör kurallarını final görsel promptuna güçlü şekilde ekler. */
export function appendSectorRuleSections(
  sections: string[],
  rule: SectorRule,
  context: BrandContext,
) {
  const isAgency = rule.key === "agency";
  const brandColors = (context.brandColors?.length
    ? context.brandColors
    : [context.primaryColor]
  ).join(", ");

  sections.push(
    "",
    "=== SECTOR IDENTITY (must strongly shape the design — same occasion, different sector = different feel) ===",
    `Sector: ${rule.name}`,
    `About this business type: ${rule.description}`,
    "",
    "Visual language:",
    rule.visualCues,
    "",
    "Tone of voice:",
    rule.toneHints,
    "",
    "Composition rules:",
    rule.compositionHints,
    "",
    "Color palette hints (blend with brand color " + brandColors + "):",
    rule.colorHints,
    "",
    "Suitable visual elements (pick 1–3 subtly, never clutter):",
    ...rule.suitableElements.map((item) => `- ${item}`),
    "",
    "Sector creative direction:",
    rule.promptModifier,
    "",
    isAgency
      ? "Agency/digital brand: premium layered design IS allowed for this sector — but the special day theme must still lead."
      : "Non-agency brand: sector elements are accents only — the special day cultural identity leads the scene (65% occasion, 35% sector).",
    "",
    "EXAMPLES of sector differentiation for the SAME national day:",
    "- Beauty salon: elegant, soft red-white, premium beauty aesthetic, refined typography.",
    "- Cafe: warm inviting table/coffee atmosphere, cozy celebration.",
    "- Dental clinic: clean, hygienic, trustworthy, minimal corporate health tone.",
    "- Digital agency: modern layered premium design, sophisticated digital aesthetic.",
  );
}

export function sectorAvoidList(rule: SectorRule): string[] {
  return rule.avoidRules;
}

/** Gemini kreatif brief ve admin önizleme için sektör kurallarını metin bloğuna çevirir. */
export function formatSectorRuleForBrief(rule: SectorRule): string {
  return [
    `Sektör: ${rule.name}`,
    `İşletme tipi: ${rule.description}`,
    `Görsel dil: ${rule.visualCues}`,
    `Ton: ${rule.toneHints}`,
    `Kompozisyon: ${rule.compositionHints}`,
    `Renk paleti: ${rule.colorHints}`,
    `Uygun elementler (1–3 tanesi ince aksan): ${rule.suitableElements.join(", ")}`,
    `Kaçınılacak: ${rule.avoidRules.join(", ")}`,
    `Yaratıcı yön: ${rule.promptModifier}`,
  ].join("\n");
}
