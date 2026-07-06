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

/** AI bağlantı durumu — API key dönmez. */
export async function GET() {
  const imageProvider = resolveImageProvider();

  return NextResponse.json({
    geminiConfigured: isGeminiConfigured(),
    ideogramConfigured: isIdeogramConfigured(),
    imageProvider,
    captionProvider: resolveCaptionProvider(),
    models: {
      image:
        imageProvider === "ideogram"
          ? `ideogram-4.0-${getIdeogramRenderingSpeed().toLowerCase()}`
          : getGeminiImageModel(),
      text: getGeminiTextModel(),
      geminiDefaults: GEMINI_DEFAULTS,
      ideogramDefaults: IDEOGRAM_DEFAULTS,
    },
    note:
      imageProvider === "ideogram"
        ? "Görsel: Ideogram 4.0 | Caption/kalite kontrolü: Gemini"
        : "Görsel ve metin: Gemini",
  });
}
