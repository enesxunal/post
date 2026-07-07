import {
  getIdeogramApiKey,
  getIdeogramRenderingSpeed,
  IDEOGRAM_DEFAULTS,
  resolveIdeogramResolution,
} from "@/lib/ai/ideogram-config";

type IdeogramImageObject = {
  url?: string | null;
  prompt?: string;
  resolution?: string;
  is_image_safe?: boolean;
  seed?: number;
};

type IdeogramGenerateResponse = {
  data?: IdeogramImageObject[];
  error?: string;
};

async function downloadAsDataUrl(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Ideogram görseli indirilemedi (${response.status})`);
  }

  const mimeType = response.headers.get("content-type") ?? "image/png";
  const buffer = Buffer.from(await response.arrayBuffer());
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

export async function generateImageWithIdeogram(
  prompt: string,
  _inputImageUrls: string[] = [],
  options?: { aspectRatio?: string; headline?: string },
) {
  void _inputImageUrls;
  void options?.headline;

  const apiKey = getIdeogramApiKey();
  if (!apiKey) {
    throw new Error("IDEOGRAM_API_KEY tanımlı değil");
  }

  const resolution = resolveIdeogramResolution(options?.aspectRatio);
  const renderingSpeed = getIdeogramRenderingSpeed();
  const textFree = process.env.IDEOGRAM_TEXT_FREE !== "false";

  const form = new FormData();
  form.append("text_prompt", prompt.slice(0, 4000));
  form.append("resolution", resolution);
  form.append("rendering_speed", renderingSpeed);

  const response = await fetch(
    `${IDEOGRAM_DEFAULTS.apiBase}/v1/ideogram-v4/generate`,
    {
      method: "POST",
      headers: { "Api-Key": apiKey },
      body: form,
    },
  );

  const payload = (await response.json()) as IdeogramGenerateResponse & {
    message?: string;
  };

  if (!response.ok) {
    throw new Error(payload.error ?? payload.message ?? `Ideogram HTTP ${response.status}`);
  }

  const first = payload.data?.[0];
  if (!first?.url) {
    if (first?.is_image_safe === false) {
      throw new Error("Ideogram güvenlik filtresine takıldı");
    }
    throw new Error("Ideogram görsel URL döndürmedi");
  }

  const dataUrl = await downloadAsDataUrl(first.url);

  return {
    provider: "ideogram" as const,
    model: `ideogram-4.0-${renderingSpeed.toLowerCase()}${textFree ? "-textfree" : ""}`,
    imageUrl: dataUrl,
    thumbnailUrl: dataUrl,
    status: "ready" as const,
  };
}
