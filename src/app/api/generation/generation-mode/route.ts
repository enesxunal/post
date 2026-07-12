import { NextResponse } from "next/server";

import { applyProjectGenerationMode, findProjectIdByOrderId } from "@/lib/generation/queue-processor";
import { getSessionUser } from "@/lib/supabase/auth";
import type { ProjectGenerationMode } from "@/lib/generation/project-service";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    projectId?: string;
    orderId?: string;
    mode?: ProjectGenerationMode;
  };

  if (!body.mode || !["manual", "bulk"].includes(body.mode)) {
    return NextResponse.json({ error: "Geçerli bir mod seçin" }, { status: 400 });
  }

  let projectId = body.projectId;

  if (!projectId && body.orderId) {
    const linked = await findProjectIdByOrderId(user.id, body.orderId);
    projectId = linked?.id;
  }

  if (!projectId) {
    return NextResponse.json({ error: "Proje bulunamadı" }, { status: 404 });
  }

  try {
    const status = await applyProjectGenerationMode(projectId, user.id, body.mode);
    return NextResponse.json({
      mode: body.mode,
      redirectUrl:
        body.mode === "bulk"
          ? `/projects/${projectId}/generating`
          : `/dashboard`,
      ...status,
      projectId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Tercih kaydedilemedi";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
