import JSZip from "jszip";
import { NextResponse } from "next/server";

import { slugifyDownloadName } from "@/lib/share/download-filename";
import { getSpecialDayById } from "@/lib/special-days-data";
import { getSessionUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function loadImageBuffer(imageUrl: string): Promise<Buffer | null> {
  if (imageUrl.startsWith("data:")) {
    const base64 = imageUrl.split(",")[1];
    if (!base64) return null;
    return Buffer.from(base64, "base64");
  }

  const response = await fetch(imageUrl);
  if (!response.ok) return null;
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

function extensionFromUrl(url: string) {
  if (url.startsWith("data:image/png")) return "png";
  if (url.startsWith("data:image/jpeg") || url.startsWith("data:image/jpg")) return "jpg";
  if (url.startsWith("data:image/webp")) return "webp";
  const match = url.match(/\.(png|jpe?g|webp)(?:\?|$)/i);
  return match?.[1]?.toLowerCase().replace("jpeg", "jpg") ?? "png";
}

/** Hazır görselleri ZIP olarak indir */
export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const url = new URL(request.url);
  const projectId = url.searchParams.get("projectId");
  const includeStory = url.searchParams.get("includeStory") === "1";

  if (!projectId) {
    return NextResponse.json({ error: "projectId gerekli" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: project } = await supabase
    .from("projects")
    .select("id, brand_name, user_id")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!project) {
    return NextResponse.json({ error: "Proje bulunamadı" }, { status: 404 });
  }

  const { data: jobs } = await supabase
    .from("generation_jobs")
    .select("id, type, status, image_url, story_image_url, caption_text, hashtags")
    .eq("project_id", projectId)
    .eq("user_id", user.id)
    .eq("status", "ready")
    .not("image_url", "is", null)
    .order("created_at", { ascending: true });

  const readyJobs = (jobs ?? []).filter((job) => Boolean(job.image_url));

  if (readyJobs.length === 0) {
    return NextResponse.json({ error: "İndirilecek hazır görsel yok" }, { status: 400 });
  }

  const zip = new JSZip();
  const captionLines: string[] = [];
  const usedNames = new Set<string>();

  for (const [index, job] of readyJobs.entries()) {
    const day = getSpecialDayById(job.type);
    const dayName = day?.name ?? "Ozel gun postu";
    const baseName = `${String(index + 1).padStart(2, "0")}-${slugifyDownloadName(dayName)}`;
    let fileName = `${baseName}.${extensionFromUrl(job.image_url!)}`;
    let suffix = 2;
    while (usedNames.has(fileName)) {
      fileName = `${baseName}-${suffix}.${extensionFromUrl(job.image_url!)}`;
      suffix += 1;
    }
    usedNames.add(fileName);

    const imageBuffer = await loadImageBuffer(job.image_url!);
    if (imageBuffer) {
      zip.file(`postlar/${fileName}`, imageBuffer);
    }

    if (includeStory && job.story_image_url) {
      const storyName = `${baseName}-story.${extensionFromUrl(job.story_image_url)}`;
      const storyBuffer = await loadImageBuffer(job.story_image_url);
      if (storyBuffer) {
        zip.file(`story/${storyName}`, storyBuffer);
      }
    }

    const tags = Array.isArray(job.hashtags) ? job.hashtags.join(" ") : "";
    captionLines.push(
      [
        `--- ${dayName} ---`,
        job.caption_text?.trim() || "(caption yok)",
        tags ? `Hashtag: ${tags}` : "",
        `Dosya: postlar/${fileName}`,
        "",
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }

  zip.file(
    "paylasim-metinleri.txt",
    `poust — ${project.brand_name}\nToplam ${readyJobs.length} görsel\n\n${captionLines.join("\n")}`,
  );

  const zipBuffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  const zipName = `${slugifyDownloadName(project.brand_name, "poust")}-postlar.zip`;

  return new NextResponse(new Uint8Array(zipBuffer), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${zipName}"`,
      "Cache-Control": "no-store",
    },
  });
}
