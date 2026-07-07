import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin/auth";
import { composeImagePrompt } from "@/lib/ai/prompt-composer";
import { applyHeadlineOverlay, useHeadlineOverlayForProvider } from "@/lib/ai/headline-pipeline";
import { generateImage, isPlaceholderImageUrl } from "@/lib/ai/image-provider";
import {
  isGeminiConfigured,
  resolveImageProvider,
} from "@/lib/ai/gemini-config";
import { isIdeogramConfigured } from "@/lib/ai/ideogram-config";
import { isOpenAIConfigured } from "@/lib/ai/openai-config";
import type { BrandContext, PostFormat, SectorKey, VisualStyle } from "@/types/domain";

export const maxDuration = 180;

type TestRequest = {
  dayId?: string;
  brandName?: string;
  sector?: SectorKey;
  visualStyle?: VisualStyle;
  primaryColor?: string;
  brandDescription?: string;
  count?: number;
  postFormat?: PostFormat;
};

export async function POST(request: Request) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  const provider = resolveImageProvider();
  if (provider === "openai" && !isOpenAIConfigured()) {
    return NextResponse.json({ error: "OPENAI_API_KEY tanımlı değil" }, { status: 400 });
  }
  if (provider === "ideogram" && !isIdeogramConfigured()) {
    return NextResponse.json({ error: "IDEOGRAM_API_KEY tanımlı değil" }, { status: 400 });
  }
  if (provider === "gemini" && !isGeminiConfigured()) {
    return NextResponse.json({ error: "GEMINI_API_KEY tanımlı değil" }, { status: 400 });
  }

  const body = (await request.json().catch(() => ({}))) as TestRequest;
  const dayId = body.dayId?.trim();
  if (!dayId) {
    return NextResponse.json({ error: "Özel gün seçin" }, { status: 400 });
  }

  const count = Math.min(4, Math.max(1, body.count ?? 1));
  const postFormat = body.postFormat ?? "square";

  const context: BrandContext = {
    brandName: body.brandName?.trim() || "Test Marka",
    sector: body.sector ?? "cafe",
    brandDescription: body.brandDescription?.trim() || "Yerel KOBİ test markası",
    primaryColor: body.primaryColor?.trim() || "#10B981",
    brandColors: [body.primaryColor?.trim() || "#10B981"],
    visualStyle: body.visualStyle ?? "modern",
    selectedDayIds: [dayId],
    purchasedAddons: [],
    postFormat,
  };

  try {
    const preview = await composeImagePrompt(context, dayId);
    const aspectRatio = postFormat === "landscape-1350x1080" ? "5:4" : "1:1";

    const results = await Promise.all(
      Array.from({ length: count }, async (_, index) => {
        const started = Date.now();
        try {
          const image = await generateImage(preview.prompt, [], {
            aspectRatio,
            headline: preview.headline,
          });

          if (isPlaceholderImageUrl(image.imageUrl)) {
            throw new Error("Placeholder görsel döndü — API yanıt vermedi");
          }

          let imageUrl = image.imageUrl;
          if (useHeadlineOverlayForProvider(image.provider)) {
            imageUrl = await applyHeadlineOverlay(imageUrl, preview.headline, {
              brandColor: context.primaryColor,
            });
          }

          return {
            index: index + 1,
            ok: true as const,
            imageUrl,
            provider: image.provider,
            model: "model" in image ? String(image.model) : provider,
            durationMs: Date.now() - started,
          };
        } catch (error) {
          return {
            index: index + 1,
            ok: false as const,
            error: error instanceof Error ? error.message : "Üretim hatası",
            durationMs: Date.now() - started,
          };
        }
      }),
    );

    return NextResponse.json({
      provider,
      headline: preview.headline,
      negativePrompt: preview.negativePrompt,
      prompt: preview.prompt,
      results,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Test üretimi başarısız";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
