import { isOpenAITextFreeMode } from "@/lib/ai/openai-config";
import { isIdeogramConfigured } from "@/lib/ai/ideogram-config";
import { isOpenAIConfigured } from "@/lib/ai/openai-config";

type CompositionOptions = {
  hasLogo?: boolean;
};

/**
 * Müşteri görsellerinde metin/logo bindirmesi politikası.
 * Logo varsa AI'ya metin ve marka çizdirilmez — programatik bindirme zorunlu.
 */
export function shouldUseTextFreeBackground(options?: CompositionOptions): boolean {
  if (process.env.HEADLINE_OVERLAY === "true") return true;
  if (process.env.HEADLINE_OVERLAY === "false") return false;
  if (options?.hasLogo) return true;

  const provider = process.env.IMAGE_PROVIDER?.trim();
  if (provider === "openai") return isOpenAITextFreeMode();
  if (provider === "ideogram") return process.env.IDEOGRAM_TEXT_FREE !== "false";
  if (!provider) {
    if (isOpenAIConfigured()) return isOpenAITextFreeMode();
    if (isIdeogramConfigured()) return process.env.IDEOGRAM_TEXT_FREE !== "false";
  }
  return false;
}

export function shouldApplyHeadlineOverlay(
  provider: string,
  hasLogo: boolean,
): boolean {
  if (process.env.HEADLINE_OVERLAY === "true") return true;
  if (process.env.HEADLINE_OVERLAY === "false") return false;
  if (hasLogo) return true;
  if (provider === "ideogram") return process.env.IDEOGRAM_TEXT_FREE !== "false";
  if (provider === "openai") return isOpenAITextFreeMode();
  return false;
}
