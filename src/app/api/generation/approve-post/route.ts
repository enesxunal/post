import { NextResponse } from "next/server";

import { approvePostJob } from "@/lib/generation/story-service";
import { requireSessionUser } from "@/lib/supabase/auth";

export async function POST(request: Request) {
  const user = await requireSessionUser("/login");
  const body = (await request.json()) as { jobId?: string };

  if (!body.jobId) {
    return NextResponse.json({ error: "jobId gerekli" }, { status: 400 });
  }

  try {
    const result = await approvePostJob(body.jobId, user.id);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Onay başarısız";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
