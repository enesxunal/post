import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** Tek job görseli — panel ve üretim sayfası lazy load için. */
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
    .select("id, user_id, status, image_url, story_image_url")
    .eq("id", jobId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!job) {
    return NextResponse.json({ error: "Görsel bulunamadı" }, { status: 404 });
  }

  return NextResponse.json({
    imageUrl: job.image_url,
    storyImageUrl: job.story_image_url,
    status: job.status,
  });
}
