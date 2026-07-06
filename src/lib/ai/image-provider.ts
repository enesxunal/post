import { generateImageWithGemini } from "@/lib/ai/providers/gemini";
import { generateImageMock } from "@/lib/ai/providers/mock";

export async function generateImage(
  prompt: string,
  inputImageUrls: string[] = [],
  options?: Record<string, string | number | boolean>,
) {
  const provider = process.env.IMAGE_PROVIDER ?? "mock";

  if (provider === "gemini" && process.env.GEMINI_API_KEY) {
    try {
      return await generateImageWithGemini(prompt, inputImageUrls);
    } catch (error) {
      console.error("Gemini image generation failed, falling back to mock:", error);
    }
  }

  if (provider === "nano-banana" && process.env.IMAGE_PROVIDER_API_KEY) {
    // TODO: connect Nano Banana image API
    void options;
  }

  return generateImageMock(prompt, inputImageUrls, options);
}

export async function regenerateImage(
  previousImageUrl: string,
  prompt: string,
  options?: Record<string, string | number | boolean>,
) {
  void previousImageUrl;
  return generateImage(prompt, [], options);
}
