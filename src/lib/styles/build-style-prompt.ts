import type { BrandContext, StyleRule } from "@/types/domain";

function brandColors(context: BrandContext): string {
  return (context.brandColors?.length ? context.brandColors : [context.primaryColor]).join(", ");
}

/** Seçilen stilin tasarım dilini final prompta ekler — sektör/özel günü ezmemeli. */
export function appendStyleRuleSections(
  sections: string[],
  rule: StyleRule,
  context: BrandContext,
) {
  const colors = brandColors(context);

  sections.push(
    "",
    "=== STYLE DESIGN LANGUAGE (layer 3 — adapt occasion + sector, never override them) ===",
    `Style: ${rule.name}`,
    `About this style: ${rule.description}`,
    "",
    "Visual language:",
    rule.visualCues,
    "",
    "Typography:",
    rule.typographyHints,
    "",
    "Composition:",
    rule.compositionHints,
    "",
    `Color approach (blend with brand color ${colors}):`,
    rule.colorHints,
    "",
    "Style creative direction:",
    rule.promptModifier,
    "",
    "Style must differentiate the SAME special day:",
    "- Modern: cleaner, contemporary, social-first.",
    "- Minimal: more whitespace, fewer elements, calm elegance.",
    "- Corporate: more serious, trustworthy, structured grid.",
    "- Friendly: warmer, softer, local-business feel.",
    "- Premium: more agency-quality, refined, luxury-inspired.",
    "- Vibrant: bolder colors, higher energy, scroll-stopping contrast.",
    "",
    "Style accents only (~15% influence). Occasion leads (~50%), sector shapes identity (~35%).",
  );
}

export function styleAvoidList(rule: StyleRule): string[] {
  return rule.avoidRules;
}

export function formatStyleRuleForBrief(rule: StyleRule): string {
  return [
    `Stil: ${rule.name}`,
    `Açıklama: ${rule.description}`,
    `Görsel dil: ${rule.visualCues}`,
    `Tipografi: ${rule.typographyHints}`,
    `Kompozisyon: ${rule.compositionHints}`,
    `Renk: ${rule.colorHints}`,
    `Kaçınılacak: ${rule.avoidRules.join(", ")}`,
    `Yaratıcı yön: ${rule.promptModifier}`,
  ].join("\n");
}
