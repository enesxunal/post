import { NextResponse } from "next/server";

import {
  GEMINI_DEFAULTS,
  getGeminiImageModel,
  getGeminiTextModel,
  isGeminiConfigured,
  resolveCaptionProvider,
  resolveImageProvider,
} from "@/lib/ai/gemini-config";
import {
  getIdeogramRenderingSpeed,
  IDEOGRAM_DEFAULTS,
  isIdeogramConfigured,
} from "@/lib/ai/ideogram-config";
import {
  getOpenAIImageModel,
  isOpenAIConfigured,
  OPENAI_IMAGE_DEFAULTS,
} from "@/lib/ai/openai-config";

/** AI bağlantı durumu — API key dönmez. */
export async function GET() {
  const imageProvider = resolveImageProvider();

  const imageModel =
    imageProvider === "openai"
      ? getOpenAIImageModel()
      : imageProvider === "ideogram"
        ? `ideogram-4.0-${getIdeogramRenderingSpeed().toLowerCase()}`
        : getGeminiImageModel();

  const note =
    imageProvider === "openai"
      ? `Görsel: OpenAI ${getOpenAIImageModel()} | Caption/kalite kontrolü: Gemini`
      : imageProvider === "ideogram"
        ? "Görsel: Ideogram 4.0 | Caption/kalite kontrolü: Gemini"
        : "Görsel ve metin: Gemini";

  return NextResponse.json({
    geminiConfigured: isGeminiConfigured(),
    ideogramConfigured: isIdeogramConfigured(),
    openaiConfigured: isOpenAIConfigured(),
    imageProvider,
    captionProvider: resolveCaptionProvider(),
    models: {
      image: imageModel,
      text: getGeminiTextModel(),
      geminiDefaults: GEMINI_DEFAULTS,
      ideogramDefaults: IDEOGRAM_DEFAULTS,
      openaiDefaults: OPENAI_IMAGE_DEFAULTS,
    },
    note,
  });
}
