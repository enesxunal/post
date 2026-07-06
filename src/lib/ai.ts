import { specialDays, sectorModifiers } from "@/lib/mock-data";
import { getStyleRuleFromSeed } from "@/lib/styles/seed-data";
import type { BrandContext, PromptPreview, SpecialDay } from "@/types/domain";

export function buildBrandContext(input: BrandContext) {
  return {
    ...input,
    normalizedBrandName: input.brandName.trim(),
    normalizedDescription: input.brandDescription?.trim() ?? "",
  };
}

export function getPromptLibraryEntry(dayId: string): SpecialDay | undefined {
  return specialDays.find((item) => item.id === dayId);
}

export function composeImagePrompt(context: BrandContext, dayId: string): PromptPreview {
  const day = getPromptLibraryEntry(dayId);
  const sector = sectorModifiers.find((item) => item.key === context.sector);
  const style = getStyleRuleFromSeed(context.visualStyle);

  const headline =
    day?.headlineAlternatives[0] ?? `${context.brandName} için özel gün paylaşımı`;

  const prompt = [
    day?.promptTemplate,
    `Brand name: ${context.brandName}.`,
    `Brand primary color: ${context.primaryColor}.`,
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
    ...(style?.avoidRules ?? []),
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

export async function generateImage(
  prompt: string,
  inputImageUrls: string[] = [],
  options?: Record<string, string | number | boolean>,
) {
  void prompt;
  void inputImageUrls;
  void options;
  // TODO: connect Nano Banana image API
  return {
    provider: process.env.IMAGE_PROVIDER ?? "nano-banana",
    imageUrl: "https://placehold.co/1080x1080/png?text=AI+Post",
    thumbnailUrl: "https://placehold.co/540x540/png?text=AI+Post",
    status: "ready" as const,
  };
}

export async function generateCaption(context: BrandContext, dayId: string) {
  const day = getPromptLibraryEntry(dayId);

  return {
    caption: `${day?.name ?? "Özel gün"} için ${context.brandName} adına kısa, saygılı ve paylaşılabilir bir açıklama.`,
    hashtags: ["#ozelgun", "#sosyalmedya", "#markapostlari"],
  };
}
