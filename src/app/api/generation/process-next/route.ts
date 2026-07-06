import { NextResponse } from "next/server";

import { processNextProjectJob } from "@/lib/generation/project-service";
import { requireSessionUser } from "@/lib/supabase/auth";

export const maxDuration = 120;

export async function POST(request: Request) {
  const user = await requireSessionUser("/login");
  const body = (await request.json()) as { projectId?: string };

  if (!body.projectId) {
    return NextResponse.json({ error: "projectId gerekli" }, { status: 400 });
  }

  try {
    const result = await processNextProjectJob(body.projectId, user.id);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Üretim başarısız";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
