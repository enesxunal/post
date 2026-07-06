import { NextResponse } from "next/server";

import { resumeAllStuckProjects } from "@/lib/generation/queue-processor";

export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET ?? "";
  const authHeader = request.headers.get("authorization");

  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  try {
    const result = await resumeAllStuckProjects();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Cron başarısız";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
