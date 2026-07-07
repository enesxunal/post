import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin/auth";
import { listPerformanceAggregates, listTrendBrainRuns } from "@/lib/trend-brain";

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  const [runs, performance] = await Promise.all([
    listTrendBrainRuns(30),
    listPerformanceAggregates(40),
  ]);

  return NextResponse.json({ runs, performance });
}
