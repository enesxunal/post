import { resolveImageProvider, isGeminiConfigured } from "@/lib/ai/gemini-config";
import { generateImageWithGemini } from "@/lib/ai/providers/gemini";
import { generateImageMock } from "@/lib/ai/providers/mock";

export type ImageGenerationOptions = {
  aspectRatio?: string;
};

export function isPlaceholderImageUrl(url: string | null | undefined): boolean {
  if (!url) return true;
  return url.includes("placehold.co") || url.includes("text=AI+Post");
}

export async function generateImage(
  prompt: string,
  inputImageUrls: string[] = [],
  options?: ImageGenerationOptions,
) {
  const provider = resolveImageProvider();

  if (provider === "gemini") {
    return generateImageWithGemini(prompt, inputImageUrls, options);
  }

  if (provider === "nano-banana" && process.env.IMAGE_PROVIDER_API_KEY) {
    // TODO: connect Nano Banana image API
    void options;
  }

  // Mock yalnızca yerel geliştirmede — canlıda Gemini yoksa hata ver
  if (isGeminiConfigured() || process.env.VERCEL === "1") {
    throw new Error(
      "Görsel üretilemedi: IMAGE_PROVIDER=gemini ayarlı ama Gemini görsel API yanıt vermedi.",
    );
  }

  return generateImageMock(prompt, inputImageUrls, options);
}

export async function regenerateImage(
  previousImageUrl: string,
  prompt: string,
  options?: ImageGenerationOptions,
) {
  return generateImage(
    `${prompt}\nUse the reference image as the primary visual source. Preserve brand identity and message.`,
    previousImageUrl ? [previousImageUrl] : [],
    options,
  );
}
