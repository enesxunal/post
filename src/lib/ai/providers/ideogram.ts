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

type V4JsonPrompt = {
  high_level_description: string;
  style_description?: {
    aesthetics?: string;
    art_style?: string;
    medium?: string;
    lighting?: string;
  };
  compositional_deconstruction: {
    background: string;
    elements: Array<
      | { type: "text"; text: string; desc: string; bbox?: number[] }
      | { type: "obj"; desc: string; bbox?: number[] }
    >;
  };
};

function extractSection(prompt: string, marker: string) {
  const index = prompt.indexOf(marker);
  if (index === -1) return "";
  const rest = prompt.slice(index + marker.length);
  const next = rest.search(/\n=== /);
  return (next === -1 ? rest : rest.slice(0, next)).trim();
}

function extractOccasionContext(prompt: string) {
  return (
    extractSection(prompt, "=== LAYER 1: EVENT CULTURAL CONTEXT & MESSAGE PURPOSE ===") ||
    extractSection(prompt, "=== EVENT CULTURAL CONTEXT") ||
    extractSection(prompt, "=== EVENT CULTURAL CONTEXT (read and embody) ===")
  );
}

function extractVisualDirection(prompt: string) {
  return (
    extractSection(prompt, "Visual direction for this occasion:") ||
    extractSection(prompt, "=== EVENT VISUAL DIRECTION ===")
  );
}

/** Metinsiz arka plan — başlık sonradan bindirilir (Türkçe yazım garantisi). */
function buildTextFreeJsonPrompt(prompt: string): V4JsonPrompt {
  const cultural = extractOccasionContext(prompt);
  const visual = extractVisualDirection(prompt);

  return {
    high_level_description: [
      "Premium Turkish Instagram post BACKGROUND ONLY.",
      "Absolutely ZERO text, ZERO letters, ZERO numbers, ZERO words anywhere in the image.",
      "NO logos, NO brand names, NO watermarks, NO social media UI, NO footer bar, NO contact info.",
      "NO fake URLs, NO icons with text, NO pseudo-Turkish gibberish.",
      "Pure visual illustration / photo-style scene for a special day social post.",
      cultural ? `Occasion mood: ${cultural.slice(0, 350)}` : "",
      "Leave top 22% and top-right corner visually clean for text and logo overlay.",
    ]
      .filter(Boolean)
      .join(" "),
    style_description: {
      aesthetics: "clean professional social media background, premium, shareable",
      medium: "digital illustration or polished photo composite",
      lighting: "balanced contrast, mobile-friendly",
      art_style: "modern branded social post background without typography",
    },
    compositional_deconstruction: {
      background:
        visual ||
        cultural ||
        "Rich but uncluttered occasion-themed visual atmosphere with brand-friendly colors",
      elements: [
        {
          type: "obj",
          desc:
            "Occasion-themed visual elements only (decor, atmosphere, subtle symbols) — no typography, no UI chrome",
        },
      ],
    },
  };
}

/** Eski yol: başlığı Ideogram'a yazdır (Türkçe'de güvenilir değil). */
function buildLegacyTextJsonPrompt(prompt: string, headline: string): V4JsonPrompt {
  const cultural = extractOccasionContext(prompt);
  const visual = extractVisualDirection(prompt);

  return {
    high_level_description: [
      "Premium Turkish small-business Instagram social media post.",
      cultural ? `Occasion mood: ${cultural.slice(0, 400)}` : "",
      "Only ONE headline text allowed. No footer, no extra sentences.",
      "Leave top-right corner clean for logo overlay.",
    ]
      .filter(Boolean)
      .join(" "),
    style_description: {
      aesthetics: "professional Turkish KOBİ social media, premium, shareable",
      medium: "digital graphic design",
      lighting: "polished, balanced contrast",
      art_style: "modern branded social post",
    },
    compositional_deconstruction: {
      background: visual || cultural || "Occasion-themed background",
      elements: [
        {
          type: "text",
          text: headline,
          desc: "Single large headline only, exact Turkish spelling, no other text on image",
          bbox: [90, 50, 340, 950],
        },
        {
          type: "obj",
          desc: visual || "Occasion visual accents without clutter",
        },
      ],
    },
  };
}

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

  const apiKey = getIdeogramApiKey();
  if (!apiKey) {
    throw new Error("IDEOGRAM_API_KEY tanımlı değil");
  }

  const resolution = resolveIdeogramResolution(options?.aspectRatio);
  const renderingSpeed = getIdeogramRenderingSpeed();
  const headline = options?.headline?.trim();
  const textFree = process.env.IDEOGRAM_TEXT_FREE !== "false";

  const form = new FormData();

  if (textFree) {
    form.append("json_prompt", JSON.stringify(buildTextFreeJsonPrompt(prompt)));
  } else if (headline) {
    form.append("json_prompt", JSON.stringify(buildLegacyTextJsonPrompt(prompt, headline)));
  } else {
    form.append("text_prompt", prompt.slice(0, 4000));
  }

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
