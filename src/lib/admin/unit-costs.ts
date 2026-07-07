import { QUALITY_CHECK_ENABLED } from "@/lib/config";

export type UnitCosts = {
  usdTry: number;
  openaiImageUsd: number;
  openaiStoryUsd: number;
  geminiCaptionUsd: number;
  geminiQcUsd: number;
};

export function getUnitCosts(): UnitCosts {
  return {
    usdTry: Number(process.env.ADMIN_USD_TRY ?? 34),
    openaiImageUsd: Number(process.env.ADMIN_COST_OPENAI_IMAGE_USD ?? 0.04),
    openaiStoryUsd: Number(process.env.ADMIN_COST_OPENAI_STORY_USD ?? 0.04),
    geminiCaptionUsd: Number(process.env.ADMIN_COST_GEMINI_CAPTION_USD ?? 0.001),
    geminiQcUsd: Number(process.env.ADMIN_COST_GEMINI_QC_USD ?? 0.008),
  };
}

export type JobCostInput = {
  image_url: string | null;
  caption_text: string | null;
  story_image_url: string | null;
  retry_count: number | null;
};

export type AiCostEstimate = {
  feedImages: number;
  stories: number;
  captions: number;
  qcChecks: number;
  totalUsd: number;
  totalTry: number;
  breakdownTry: {
    images: number;
    stories: number;
    captions: number;
    qualityChecks: number;
  };
};

export function estimateAiCostForJobs(jobs: JobCostInput[]): AiCostEstimate {
  const costs = getUnitCosts();
  const qcEnabled = QUALITY_CHECK_ENABLED;

  let feedImages = 0;
  let stories = 0;
  let captions = 0;
  let qcChecks = 0;

  for (const job of jobs) {
    const retries = job.retry_count ?? 0;

    if (job.image_url) {
      feedImages += 1;
      feedImages += retries;
      if (qcEnabled) qcChecks += 1 + retries;
    } else if (retries > 0) {
      feedImages += retries;
      if (qcEnabled) qcChecks += retries;
    }

    if (job.caption_text) captions += 1;
    if (job.story_image_url) stories += 1;
  }

  const imagesUsd = feedImages * costs.openaiImageUsd;
  const storiesUsd = stories * costs.openaiStoryUsd;
  const captionsUsd = captions * costs.geminiCaptionUsd;
  const qcUsd = qcChecks * costs.geminiQcUsd;
  const totalUsd = imagesUsd + storiesUsd + captionsUsd + qcUsd;

  const toTry = (usd: number) => Math.round(usd * costs.usdTry * 100) / 100;

  return {
    feedImages,
    stories,
    captions,
    qcChecks,
    totalUsd: Math.round(totalUsd * 10000) / 10000,
    totalTry: toTry(totalUsd),
    breakdownTry: {
      images: toTry(imagesUsd),
      stories: toTry(storiesUsd),
      captions: toTry(captionsUsd),
      qualityChecks: toTry(qcUsd),
    },
  };
}

export function formatUsdTry(usd: number, rate: number) {
  const tryAmount = usd * rate;
  return { usd, tryAmount };
}
