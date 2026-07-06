import { GoogleGenerativeAI, type Part } from "@google/generative-ai";

import {
  GEMINI_DEFAULTS,
  getGeminiApiKey,
  getGeminiImageModel,
  getGeminiTextModel,
} from "@/lib/ai/gemini-config";

async function imageUrlToPart(url: string): Promise<Part | null> {
  try {
    if (url.startsWith("data:")) {
      const match = url.match(/^data:([^;]+);base64,(.+)$/);
      if (!match) return null;
      return {
        inlineData: {
          mimeType: match[1],
          data: match[2],
        },
      };
    }

    const response = await fetch(url);
    if (!response.ok) return null;

    const mimeType = response.headers.get("content-type") ?? "image/png";
    const buffer = Buffer.from(await response.arrayBuffer());
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

export async function generateImageWithGemini(
  prompt: string,
  inputImageUrls: string[] = [],
) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY tanımlı değil");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelName = getGeminiImageModel();
  const model = genAI.getGenerativeModel({ model: modelName });

  const parts: Part[] = [{ text: prompt }];

  for (const imageUrl of inputImageUrls) {
    const imagePart = await imageUrlToPart(imageUrl);
    if (imagePart) {
      parts.push(imagePart);
    }
  }

  const result = await model.generateContent({
    contents: [{ role: "user", parts }],
    generationConfig: {
      responseModalities: ["IMAGE"],
      imageConfig: {
        aspectRatio: GEMINI_DEFAULTS.aspectRatio,
      },
    } as Record<string, unknown>,
  });

  const responseParts = result.response.candidates?.[0]?.content?.parts ?? [];
  const imagePart = responseParts.find(
    (part) => "inlineData" in part && Boolean(part.inlineData?.data),
  );

  if (!imagePart || !("inlineData" in imagePart) || !imagePart.inlineData?.data) {
    const textPart = responseParts.find((part) => "text" in part && part.text);
    throw new Error(
      textPart && "text" in textPart
        ? `Gemini görsel döndürmedi: ${textPart.text}`
        : "Gemini görsel döndürmedi",
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

export async function generateTextWithGemini(prompt: string) {
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
