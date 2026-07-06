import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateImageWithGemini(
  prompt: string,
  inputImageUrls: string[] = [],
) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY tanımlı değil");
  }

  void inputImageUrls;

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelName =
    process.env.GEMINI_IMAGE_MODEL ?? "gemini-2.0-flash-preview-image-generation";

  const model = genAI.getGenerativeModel({ model: modelName });

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      responseModalities: ["TEXT", "IMAGE"],
    } as Record<string, unknown>,
  });

  const parts = result.response.candidates?.[0]?.content?.parts ?? [];
  const imagePart = parts.find(
    (part) => "inlineData" in part && Boolean(part.inlineData?.data),
  );

  if (!imagePart || !("inlineData" in imagePart) || !imagePart.inlineData?.data) {
    throw new Error("Gemini görsel döndürmedi");
  }

  const mimeType = imagePart.inlineData.mimeType ?? "image/png";
  const dataUrl = `data:${mimeType};base64,${imagePart.inlineData.data}`;

  return {
    provider: "gemini" as const,
    imageUrl: dataUrl,
    thumbnailUrl: dataUrl,
    status: "ready" as const,
  };
}

export async function generateTextWithGemini(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY tanımlı değil");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_TEXT_MODEL ?? "gemini-2.0-flash",
  });

  const result = await model.generateContent(prompt);
  return result.response.text();
}
