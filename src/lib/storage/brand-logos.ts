import { randomUUID } from "crypto";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const BUCKET = "generated-images";

function parseDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  return { contentType: match[1], buffer: Buffer.from(match[2], "base64") };
}

function extensionFor(contentType: string) {
  if (contentType.includes("svg")) return "svg";
  if (contentType.includes("jpeg") || contentType.includes("jpg")) return "jpg";
  if (contentType.includes("webp")) return "webp";
  return "png";
}

/** Yüklenen logo (data URL) kalıcı depoya alınır; link zaten varsa olduğu gibi döner. */
export async function persistBrandLogo(logoUrl: string, userId: string): Promise<string> {
  if (!logoUrl.startsWith("data:")) {
    return logoUrl;
  }

  const admin = createSupabaseAdminClient();
  const parsed = parseDataUrl(logoUrl);
  if (!admin || !parsed) {
    return logoUrl;
  }

  const ext = extensionFor(parsed.contentType);
  const path = `logos/${userId}/${randomUUID()}.${ext}`;

  const { error } = await admin.storage.from(BUCKET).upload(path, parsed.buffer, {
    contentType: parsed.contentType,
    upsert: false,
  });

  if (error) {
    console.error("[storage] brand logo upload failed:", error.message);
    return logoUrl;
  }

  const {
    data: { publicUrl },
  } = admin.storage.from(BUCKET).getPublicUrl(path);

  return publicUrl;
}
