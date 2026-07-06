import { sectorModifiers, styles } from "@/lib/mock-data";
import { getPromptLibraryEntry } from "@/lib/ai/prompt-library";
import type { BrandContext, PromptPreview } from "@/types/domain";

export function composeImagePrompt(context: BrandContext, dayId: string): PromptPreview {
  const day = getPromptLibraryEntry(dayId);
  const sector = sectorModifiers.find((item) => item.key === context.sector);
  const style = styles.find((item) => item.key === context.visualStyle);

  const headline =
    day?.headlineAlternatives[0] ?? `${context.brandName} için özel gün paylaşımı`;

  const prompt = [
    day?.promptTemplate,
    `Brand name: ${context.brandName}.`,
    `Brand colors in order (1=primary): ${(context.brandColors?.length ? context.brandColors : [context.primaryColor]).join(", ")}.`,
    `Brand description: ${context.brandDescription ?? "Not provided"}.`,
    `Sector modifier: ${sector?.promptModifier ?? context.customSector ?? "general small business"}.`,
    `Style modifier: ${style?.promptModifier ?? "clean modern style"}.`,
    `Cultural context: ${day?.culturalContext ?? "Respect Turkish cultural expectations."}`,
    `Visual direction: ${day?.visualDirection ?? "premium, clean, mobile-friendly social media design"}.`,
    "Instagram square post, clean social media design, readable Turkish text, include selected headline inside the visual.",
    "Place the uploaded brand logo clearly without distortion, preserve logo proportions, do not alter the logo text.",
    "Use the brand primary color naturally, leave safe margins, avoid clutter, avoid unreadable typography, avoid random extra text.",
    "If using cultural or religious elements, keep them respectful and subtle.",
  ]
    .filter(Boolean)
    .join(" ");

  const negativePrompt = [
    day?.avoidRules,
    "avoid unreadable Turkish",
    "avoid distorted flags",
    "avoid distorted religious symbols",
    "avoid distorted brand logo",
    "avoid extra random text",
  ]
    .filter(Boolean)
    .join(", ");

  return { headline, prompt, negativePrompt };
}
