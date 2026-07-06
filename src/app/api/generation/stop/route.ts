import { NextResponse } from "next/server";

import { stopProjectGeneration } from "@/lib/generation/queue-processor";
import { requireSessionUser } from "@/lib/supabase/auth";

export async function POST(request: Request) {
  const user = await requireSessionUser("/login");

  const body = (await request.json().catch(() => ({}))) as { projectId?: string };

  if (!body.projectId) {
    return NextResponse.json({ error: "projectId gerekli" }, { status: 400 });
  }

  try {
    const status = await stopProjectGeneration(body.projectId, user.id);
    if (!status) {
      return NextResponse.json({ error: "Proje bulunamadı" }, { status: 404 });
    }
    return NextResponse.json(status);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Durdurulamadı";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
