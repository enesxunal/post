import {
  getDalle3Quality,
  getDalle3Style,
  getGptImageQuality,
  getOpenAIApiKey,
  getOpenAIImageFallbackModel,
  getOpenAIImageModel,
  isOpenAITextFreeMode,
  OPENAI_IMAGE_DEFAULTS,
  resolveOpenAIImageSize,
} from "@/lib/ai/openai-config";

type OpenAIImageResponse = {
  created?: number;
  data?: Array<{ b64_json?: string; url?: string; revised_prompt?: string }>;
  error?: { message?: string; type?: string; code?: string };
};

function extractSection(prompt: string, marker: string) {
  const index = prompt.indexOf(marker);
  if (index === -1) return "";
  const rest = prompt.slice(index + marker.length);
  const next = rest.search(/\n=== /);
  return (next === -1 ? rest : rest.slice(0, next)).trim();
}

function buildOpenAIPrompt(fullPrompt: string, headline?: string) {
  const cultural =
    extractSection(fullPrompt, "=== LAYER 1: EVENT CULTURAL CONTEXT & MESSAGE PURPOSE ===") ||
    extractSection(fullPrompt, "=== EVENT CULTURAL CONTEXT");
  const visual = extractSection(fullPrompt, "Visual direction for this occasion:");

  if (isOpenAITextFreeMode()) {
    return [
      "Premium Turkish small-business Instagram post BACKGROUND ONLY.",
      "Absolutely NO text, NO letters, NO numbers, NO words, NO logos, NO watermarks.",
      "NO social media UI, NO footer bar, NO fake URLs, NO contact info.",
      "Leave top 22% and top-right corner clean for headline and logo overlay.",
      cultural ? `Occasion mood: ${cultural.slice(0, 500)}` : "",
      visual ? `Visual direction: ${visual.slice(0, 400)}` : "",
      fullPrompt.slice(0, 1200),
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  return [
    "Premium Turkish small-business Instagram social media post graphic.",
    headline
      ? `Main headline on image (exact Turkish spelling, large and readable): "${headline}"`
      : "",
    "Only ONE headline — no footer, no extra sentences, no pseudo-Turkish gibberish.",
    "Leave top-right corner clean for logo overlay.",
    cultural ? `Occasion: ${cultural.slice(0, 400)}` : "",
    visual ? `Visual: ${visual.slice(0, 300)}` : "",
    fullPrompt.slice(0, 1500),
  ]
    .filter(Boolean)
    .join("\n\n");
}

async function urlToDataUrl(url: string) {
  const imageResponse = await fetch(url);
  if (!imageResponse.ok) {
    throw new Error("OpenAI görseli indirilemedi");
  }
  const buffer = Buffer.from(await imageResponse.arrayBuffer());
  const mimeType = imageResponse.headers.get("content-type") ?? "image/png";
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

function buildRequestBody(model: string, prompt: string, aspectRatio?: string) {
  const size = resolveOpenAIImageSize(aspectRatio, model);

  if (model.startsWith("dall-e")) {
    return {
      model,
      prompt,
      n: 1,
      size,
      quality: getDalle3Quality(),
      style: getDalle3Style(),
      response_format: "b64_json",
    };
  }

  return {
    model,
    prompt,
    n: 1,
    size,
    quality: getGptImageQuality(),
    output_format: "png",
  };
}

function isModelAccessError(message: string) {
  return /does not have access to model/i.test(message);
}

async function requestOpenAIImage(
  apiKey: string,
  model: string,
  prompt: string,
  aspectRatio?: string,
) {
  const response = await fetch(`${OPENAI_IMAGE_DEFAULTS.apiBase}/images/generations`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buildRequestBody(model, prompt, aspectRatio)),
  });

  const payload = (await response.json()) as OpenAIImageResponse;
  return { response, payload };
}

export async function generateImageWithOpenAI(
  prompt: string,
  _inputImageUrls: string[] = [],
  options?: { aspectRatio?: string; headline?: string },
) {
  void _inputImageUrls;

  const apiKey = getOpenAIApiKey();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY tanımlı değil");
  }

  const primaryModel = getOpenAIImageModel();
  const fallbackModel = getOpenAIImageFallbackModel();
  const textFree = isOpenAITextFreeMode();
  const imagePrompt = buildOpenAIPrompt(prompt, options?.headline);

  let activeModel = primaryModel;
  let { response, payload } = await requestOpenAIImage(
    apiKey,
    activeModel,
    imagePrompt,
    options?.aspectRatio,
  );

  if (
    !response.ok &&
    isModelAccessError(payload.error?.message ?? "") &&
    activeModel !== fallbackModel
  ) {
    console.warn(
      `[openai] ${activeModel} erişilemiyor, ${fallbackModel} ile yeniden deneniyor`,
    );
    activeModel = fallbackModel;
    ({ response, payload } = await requestOpenAIImage(
      apiKey,
      activeModel,
      imagePrompt,
      options?.aspectRatio,
    ));
  }

  if (!response.ok) {
    const message = payload.error?.message ?? `OpenAI HTTP ${response.status}`;
    if (isModelAccessError(message)) {
      throw new Error(
        `${message} — OpenAI proje Limits sayfasında bu modeli açın veya OPENAI_IMAGE_MODEL=gpt-image-1 deneyin.`,
      );
    }
    throw new Error(message);
  }

  const first = payload.data?.[0];
  const b64 = first?.b64_json;
  const dataUrl = b64
    ? `data:image/png;base64,${b64}`
    : first?.url
      ? await urlToDataUrl(first.url)
      : null;

  if (!dataUrl) {
    throw new Error("OpenAI görsel döndürmedi");
  }

  const usedFallback = activeModel !== primaryModel;

  return {
    provider: "openai" as const,
    model: `${activeModel}${textFree ? "-textfree" : ""}${usedFallback ? "-fallback" : ""}`,
    imageUrl: dataUrl,
    thumbnailUrl: dataUrl,
    status: "ready" as const,
  };
}
