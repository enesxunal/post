import { NextResponse } from "next/server";

import { restoreJobImageVersion } from "@/lib/generation/queue-processor";
import { getSessionUser } from "@/lib/supabase/auth";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    jobId?: string;
    versionId?: string;
  };

  if (!body.jobId || !body.versionId) {
    return NextResponse.json({ error: "jobId ve versionId gerekli" }, { status: 400 });
  }

  try {
    const result = await restoreJobImageVersion(body.jobId, user.id, body.versionId);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Versiyon geri yüklenemedi";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
