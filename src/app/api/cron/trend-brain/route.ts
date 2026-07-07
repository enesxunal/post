import { NextResponse } from "next/server";

import { runTrendBrain } from "@/lib/trend-brain";

export const maxDuration = 120;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET ?? "";
  const authHeader = request.headers.get("authorization");

  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  try {
    const run = await runTrendBrain({ triggerType: "cron", triggeredBy: "vercel-cron" });
    return NextResponse.json({ ok: true, run });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Trend Brain cron başarısız";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
