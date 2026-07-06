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

/** Ideogram 4.0 json_prompt — Türkçe başlık yazımı için yapılandırılmış istek */
function buildJsonPrompt(prompt: string, headline: string): V4JsonPrompt {
  const cultural = extractSection(prompt, "=== EVENT CULTURAL CONTEXT");
  const visual = extractSection(prompt, "=== EVENT VISUAL DIRECTION");
  const brand = extractSection(prompt, "=== BRAND ACCENT");

  return {
    high_level_description: [
      "Premium Turkish small-business Instagram social media post.",
      cultural ? `Occasion mood: ${cultural.slice(0, 400)}` : "",
      visual ? `Visual direction: ${visual.slice(0, 400)}` : "",
      brand ? `Brand accent: ${brand.slice(0, 200)}` : "",
      "Agency-quality, warm, culturally authentic, not a generic template.",
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
      background: visual || cultural || "Rich occasion-themed background with brand color accents",
      elements: [
        {
          type: "text",
          text: headline,
          desc: "Large bold headline, EXACT Turkish spelling with ğ ü ş ı ö ç characters, premium typography, high contrast, mobile-readable, centered upper area",
          bbox: [90, 50, 340, 950],
        },
        {
          type: "obj",
          desc:
            visual ||
            "Occasion-themed visual elements (symbols, decor, atmosphere) harmonized with the special day — emotional and authentic, not clip art",
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

  const form = new FormData();

  if (headline) {
    form.append("json_prompt", JSON.stringify(buildJsonPrompt(prompt, headline)));
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
    model: `ideogram-4.0-${renderingSpeed.toLowerCase()}`,
    imageUrl: dataUrl,
    thumbnailUrl: dataUrl,
    status: "ready" as const,
  };
}
