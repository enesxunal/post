import { NextResponse } from "next/server";

import { requestJobGeneration } from "@/lib/generation/queue-processor";
import { getSessionUser } from "@/lib/supabase/auth";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    jobId?: string;
    visualNote?: string;
  };

  if (!body.jobId) {
    return NextResponse.json({ error: "jobId gerekli" }, { status: 400 });
  }

  try {
    const status = await requestJobGeneration(body.jobId, user.id, {
      visualNote: body.visualNote,
    });
    return NextResponse.json(status);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Üretim başlatılamadı";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
