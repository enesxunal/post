import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin/auth";
import { formatTrendBrainError, runTrendBrain } from "@/lib/trend-brain";

export async function POST() {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  try {
    const run = await runTrendBrain({
      triggerType: "manual",
      triggeredBy: admin.email,
    });
    return NextResponse.json({ ok: true, run });
  } catch (error) {
    const message = formatTrendBrainError(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
