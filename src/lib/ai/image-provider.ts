import {
  isGeminiConfigured,
  resolveImageProvider,
} from "@/lib/ai/gemini-config";
import { isIdeogramConfigured } from "@/lib/ai/ideogram-config";
import { generateImageWithGemini } from "@/lib/ai/providers/gemini";
import { generateImageWithIdeogram } from "@/lib/ai/providers/ideogram";
import { generateImageMock } from "@/lib/ai/providers/mock";

export type ImageGenerationOptions = {
  aspectRatio?: string;
  /** Ideogram json_prompt için — Türkçe başlık yazımı */
  headline?: string;
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

  if (provider === "ideogram") {
    return generateImageWithIdeogram(prompt, inputImageUrls, options);
  }

  if (provider === "gemini") {
    return generateImageWithGemini(prompt, inputImageUrls, options);
  }

  if (provider === "nano-banana" && process.env.IMAGE_PROVIDER_API_KEY) {
    // TODO: connect Nano Banana image API
    void options;
  }

  if (isIdeogramConfigured() || isGeminiConfigured() || process.env.VERCEL === "1") {
    throw new Error(
      `Görsel üretilemedi: IMAGE_PROVIDER=${provider} ayarlı ama API yanıt vermedi.`,
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
