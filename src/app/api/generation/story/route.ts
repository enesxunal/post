import { NextResponse } from "next/server";

import { generateStoryForJob } from "@/lib/generation/story-service";
import { requireSessionUser } from "@/lib/supabase/auth";

export const maxDuration = 120;

export async function POST(request: Request) {
  const user = await requireSessionUser("/login");
  const body = (await request.json()) as { jobId?: string };

  if (!body.jobId) {
    return NextResponse.json({ error: "jobId gerekli" }, { status: 400 });
  }

  try {
    const result = await generateStoryForJob(body.jobId, user.id);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Story üretilemedi";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
