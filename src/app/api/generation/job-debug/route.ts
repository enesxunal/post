import { NextResponse } from "next/server";

import { formatArtDirectionForDisplay } from "@/lib/ai/art-direction/labels";
import type { ArtDirection } from "@/lib/ai/art-direction";
import { getSessionUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function parseArtDirection(raw: unknown): ArtDirection | null {
  if (!raw || typeof raw !== "object") return null;
  const candidate = raw as ArtDirection;
  if (!candidate.layout || !candidate.textPosition) return null;
  return candidate;
}

/** Üretim detayı — art direction, metadata ve prompt. */
export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const jobId = new URL(request.url).searchParams.get("jobId");
  if (!jobId) {
    return NextResponse.json({ error: "jobId gerekli" }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: job } = await supabase
    .from("generation_jobs")
    .select(
      "id, user_id, status, type, prompt, art_direction, design_metadata, provider, created_at, updated_at",
    )
    .eq("id", jobId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!job) {
    return NextResponse.json({ error: "Post bulunamadı" }, { status: 404 });
  }

  const artDirection =
    parseArtDirection(job.art_direction) ?? parseArtDirection(job.design_metadata);

  return NextResponse.json({
    jobId: job.id,
    dayId: job.type,
    status: job.status,
    provider: job.provider,
    createdAt: job.created_at,
    updatedAt: job.updated_at,
    artDirection,
    artDirectionDisplay: artDirection ? formatArtDirectionForDisplay(artDirection) : null,
    designMetadata: job.design_metadata,
    prompt: job.prompt,
    hasPlan: Boolean(job.art_direction),
    hasMetadata: Boolean(job.design_metadata),
  });
}
