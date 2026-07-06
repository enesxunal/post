import { NextResponse } from "next/server";

import { isGeminiConfigured, resolveImageProvider } from "@/lib/ai/gemini-config";
import { processGenerationJob } from "@/lib/jobs";
import { TODO_LABELS } from "@/lib/config";
import type { BrandContext } from "@/types/domain";

const demoContext: BrandContext = {
  brandName: "Liva Güzellik",
  sector: "beauty",
  primaryColor: "#16A34A",
  brandColors: ["#16A34A", "#EAB308", "#FFFFFF"],
  visualStyle: "premium",
  brandDescription: "Premium cilt bakımı hizmetleri sunan bir güzellik salonu.",
  selectedDayIds: ["29-ekim"],
  purchasedAddons: ["caption"],
};

export async function POST() {
  if (!isGeminiConfigured()) {
    return NextResponse.json(
      {
        error: "GEMINI_API_KEY tanımlı değil. Vercel env veya .env.local dosyasına ekleyin.",
        imageProvider: resolveImageProvider(),
      },
      { status: 503 },
    );
  }

  const result = await processGenerationJob(demoContext, "29-ekim");

  return NextResponse.json({
    ...result,
    notes: [TODO_LABELS.cronWorker],
  });
}
