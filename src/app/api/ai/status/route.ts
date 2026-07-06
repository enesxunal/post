import { NextResponse } from "next/server";

import {
  GEMINI_DEFAULTS,
  getGeminiImageModel,
  getGeminiTextModel,
  isGeminiConfigured,
  resolveCaptionProvider,
  resolveImageProvider,
} from "@/lib/ai/gemini-config";

/** Vercel'de Gemini bağlantısını kontrol etmek için — API key dönmez. */
export async function GET() {
  return NextResponse.json({
    geminiConfigured: isGeminiConfigured(),
    imageProvider: resolveImageProvider(),
    captionProvider: resolveCaptionProvider(),
    models: {
      image: getGeminiImageModel(),
      text: getGeminiTextModel(),
      defaults: GEMINI_DEFAULTS,
    },
    note: "Tek GEMINI_API_KEY ile hem görsel (gemini-2.5-flash-image) hem metin (gemini-2.5-flash) çalışır.",
  });
}
