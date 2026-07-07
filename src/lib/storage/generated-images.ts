import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const BUCKET = "generated-images";

function parseDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  return { contentType: match[1], buffer: Buffer.from(match[2], "base64") };
}

function extensionFor(contentType: string) {
  if (contentType.includes("jpeg") || contentType.includes("jpg")) return "jpg";
  if (contentType.includes("webp")) return "webp";
  return "png";
}

/** Base64 data URL'yi Supabase Storage'a yükler; başarısızsa orijinali döner. */
export async function persistGeneratedImage(
  imageUrl: string,
  projectId: string,
  jobId: string,
  variant: "feed" | "story" = "feed",
): Promise<string> {
  if (!imageUrl.startsWith("data:")) {
    return imageUrl;
  }

  const admin = createSupabaseAdminClient();
  const parsed = parseDataUrl(imageUrl);
  if (!admin || !parsed) {
    return imageUrl;
  }

  const ext = extensionFor(parsed.contentType);
  const path = `${projectId}/${jobId}-${variant}.${ext}`;

  const { error } = await admin.storage.from(BUCKET).upload(path, parsed.buffer, {
    contentType: parsed.contentType,
    upsert: true,
  });

  if (error) {
    console.error("[storage] generated image upload failed:", error.message);
    return imageUrl;
  }

  const {
    data: { publicUrl },
  } = admin.storage.from(BUCKET).getPublicUrl(path);

  return publicUrl;
}
