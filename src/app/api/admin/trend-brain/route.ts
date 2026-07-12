import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin/auth";
import {
  checkTrendBrainSetup,
  formatTrendBrainError,
  listPerformanceAggregates,
  listTrendBrainRuns,
} from "@/lib/trend-brain";

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  try {
    const setup = await checkTrendBrainSetup();
    if (!setup.ready) {
      return NextResponse.json({
        runs: [],
        performance: [],
        setupRequired: true,
        missingTables: setup.missingTables,
        error:
          "Trend Brain tabloları kurulmamış. Supabase SQL Editor'da supabase/migrations/20260710_trend_brain.sql dosyasını çalıştırın.",
      });
    }

    const [runs, performance] = await Promise.all([
      listTrendBrainRuns(30),
      listPerformanceAggregates(40),
    ]);

    return NextResponse.json({ runs, performance, setupRequired: false });
  } catch (error) {
    return NextResponse.json({ error: formatTrendBrainError(error) }, { status: 500 });
  }
}
