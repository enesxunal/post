import { GEMINI_DEFAULTS, getGeminiApiKey, getGeminiImageModel } from "@/lib/ai/gemini-config";
import { rasterizeLogo } from "@/lib/ai/logo-pipeline";

type GeminiPart = {
  text?: string;
  inlineData?: { mimeType: string; data: string };
};

async function imageUrlToPart(url: string): Promise<GeminiPart | null> {
  try {
    if (url.startsWith("data:")) {
      const match = url.match(/^data:([^;]+);base64,(.+)$/);
      if (!match) return null;

      let mimeType = match[1];
      let data = match[2];

      if (mimeType.includes("svg")) {
        const raster = await rasterizeLogo(url);
        if (!raster) return null;
        mimeType = "image/png";
        data = raster.toString("base64");
      }

      return {
        inlineData: {
          mimeType,
          data,
        },
      };
    }

    const response = await fetch(url);
    if (!response.ok) return null;

    let mimeType = response.headers.get("content-type") ?? "image/png";
    let buffer = Buffer.from(await response.arrayBuffer());

    if (mimeType.includes("svg") || url.toLowerCase().includes(".svg")) {
      const raster = await rasterizeLogo(url);
      if (!raster) return null;
      mimeType = "image/png";
      buffer = Buffer.from(raster);
    }

    return {
      inlineData: {
        mimeType,
        data: buffer.toString("base64"),
      },
    };
  } catch {
    return null;
  }
}

type GeminiGenerateResponse = {
  candidates?: Array<{
    content?: { parts?: GeminiPart[] };
  }>;
  error?: { message?: string };
};

/** Gemini REST API ile görsel üretimi — SDK'daki responseModalities sorunlarını aşar. */
async function generateImageViaRest(
  modelName: string,
  apiKey: string,
  parts: GeminiPart[],
  aspectRatio: string,
) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        generationConfig: {
          responseModalities: ["IMAGE"],
          imageConfig: { aspectRatio },
        },
      }),
    },
  );

  const payload = (await response.json()) as GeminiGenerateResponse;

  if (!response.ok) {
    throw new Error(payload.error?.message ?? `Gemini HTTP ${response.status}`);
  }

  const responseParts = payload.candidates?.[0]?.content?.parts ?? [];
  const imagePart = responseParts.find((part) => part.inlineData?.data);

  if (!imagePart?.inlineData?.data) {
    const textPart = responseParts.find((part) => part.text);
    throw new Error(
      textPart?.text
        ? `Gemini görsel döndürmedi: ${textPart.text}`
        : "Gemini görsel döndürmedi (boş yanıt)",
    );
  }

  const mimeType = imagePart.inlineData.mimeType ?? "image/png";
  const dataUrl = `data:${mimeType};base64,${imagePart.inlineData.data}`;

  return {
    provider: "gemini" as const,
    model: modelName,
    imageUrl: dataUrl,
    thumbnailUrl: dataUrl,
    status: "ready" as const,
  };
}

export async function generateImageWithGemini(
  prompt: string,
  inputImageUrls: string[] = [],
  options?: { aspectRatio?: string },
) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY tanımlı değil");
  }

  const modelName = getGeminiImageModel();
  const aspectRatio = options?.aspectRatio ?? GEMINI_DEFAULTS.aspectRatio;

  const parts: GeminiPart[] = [{ text: prompt }];

  for (const imageUrl of inputImageUrls) {
    const imagePart = await imageUrlToPart(imageUrl);
    if (imagePart) {
      parts.push(imagePart);
    }
  }

  return generateImageViaRest(modelName, apiKey, parts, aspectRatio);
}

export async function generateTextWithGemini(prompt: string) {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const { getGeminiTextModel } = await import("@/lib/ai/gemini-config");

  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY tanımlı değil");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelName = getGeminiTextModel();
  const model = genAI.getGenerativeModel({ model: modelName });

  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function analyzeImageWithGemini(prompt: string, imageUrl: string) {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const { getGeminiTextModel } = await import("@/lib/ai/gemini-config");

  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY tanımlı değil");
  }

  const rawPart = await imageUrlToPart(imageUrl);
  if (!rawPart?.inlineData) {
    throw new Error("Görsel analiz için yüklenemedi");
  }

  const imagePart = {
    inlineData: rawPart.inlineData,
  } as import("@google/generative-ai").Part;

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelName = getGeminiTextModel();
  const model = genAI.getGenerativeModel({ model: modelName });

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [imagePart, { text: prompt }],
      },
    ],
  });

  return result.response.text();
}
