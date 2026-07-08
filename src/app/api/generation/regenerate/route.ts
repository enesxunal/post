import { NextResponse } from "next/server";

import { regenerateGenerationJob } from "@/lib/generation/queue-processor";
import { requireSessionUser } from "@/lib/supabase/auth";

export async function POST(request: Request) {
  const user = await requireSessionUser("/login");

  const body = (await request.json().catch(() => ({}))) as {
    jobId?: string;
    reason?: string;
  };

  if (!body.jobId) {
    return NextResponse.json({ error: "jobId gerekli" }, { status: 400 });
  }

  try {
    const status = await regenerateGenerationJob(body.jobId, user.id, body.reason);
    return NextResponse.json(status);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Yeniden üretilemedi";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
