import {
  getDalle3Quality,
  getDalle3Style,
  getGptImageQuality,
  getOpenAIApiKey,
  getOpenAIImageFallbackModel,
  getOpenAIImageModel,
  OPENAI_IMAGE_DEFAULTS,
  resolveOpenAIImageSize,
} from "@/lib/ai/openai-config";

type OpenAIImageResponse = {
  created?: number;
  data?: Array<{ b64_json?: string; url?: string; revised_prompt?: string }>;
  error?: { message?: string; type?: string; code?: string };
};

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

function buildModelChain(primaryModel: string) {
  const configuredFallback = getOpenAIImageFallbackModel();
  const candidates = [primaryModel, configuredFallback, "gpt-image-1-mini", "gpt-image-1"];
  return [...new Set(candidates)];
}

export async function generateImageWithOpenAI(
  prompt: string,
  _inputImageUrls: string[] = [],
  options?: { aspectRatio?: string; headline?: string },
) {
  void _inputImageUrls;
  void options?.headline;

  const apiKey = getOpenAIApiKey();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY tanımlı değil");
  }

  const primaryModel = getOpenAIImageModel();
  const modelChain = buildModelChain(primaryModel);
  let activeModel = primaryModel;
  let response: Response | null = null;
  let payload: OpenAIImageResponse = {};

  for (const model of modelChain) {
    activeModel = model;
    ({ response, payload } = await requestOpenAIImage(
      apiKey,
      model,
      prompt,
      options?.aspectRatio,
    ));

    if (response.ok) break;

    const message = payload.error?.message ?? "";
    if (!isModelAccessError(message)) break;

    console.warn(`[openai] ${model} erişilemiyor, sıradaki model deneniyor`);
  }

  if (!response?.ok) {
    const message = payload.error?.message ?? `OpenAI HTTP ${response?.status ?? 500}`;
    if (isModelAccessError(message)) {
      throw new Error(
        `${message} — OpenAI proje Limits sayfasında gpt-image-1.5 / gpt-image-1-mini modellerini açın ve API key'in doğru projeye bağlı olduğundan emin olun.`,
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
    model: `${activeModel}${usedFallback ? "-fallback" : ""}`,
    imageUrl: dataUrl,
    thumbnailUrl: dataUrl,
    status: "ready" as const,
  };
}
