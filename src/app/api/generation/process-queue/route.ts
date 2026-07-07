import { after, NextResponse } from "next/server";

import { processOneQueuedJob } from "@/lib/generation/queue-processor";
import { scheduleQueueProcessing } from "@/lib/generation/schedule-queue";
import { userOwnsProject } from "@/lib/generation/project-service";
import { getSessionUser } from "@/lib/supabase/auth";

export const maxDuration = 300;

async function authorizeQueue(request: Request, projectId: string) {
  const secret = process.env.CRON_SECRET ?? process.env.GENERATION_QUEUE_SECRET ?? "";
  const authHeader = request.headers.get("authorization");

  if (secret && authHeader === `Bearer ${secret}`) {
    return true;
  }

  const user = await getSessionUser();
  if (!user) return false;

  return userOwnsProject(projectId, user.id);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { projectId?: string };

  if (!body.projectId) {
    return NextResponse.json({ error: "projectId gerekli" }, { status: 400 });
  }

  if (!(await authorizeQueue(request, body.projectId))) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  try {
    const result = await processOneQueuedJob(body.projectId);

    if (result.shouldContinue) {
      after(() => {
        scheduleQueueProcessing(body.projectId!);
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Kuyruk işlenemedi";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
