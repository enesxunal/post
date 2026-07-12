import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin/auth";
import { formatTrendBrainError, listSuggestions } from "@/lib/trend-brain";

export async function GET(request: Request) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status") as
    | "pending"
    | "approved"
    | "rejected"
    | "applied"
    | null;
  const runId = url.searchParams.get("runId");

  try {
    const suggestions = await listSuggestions({
      status: status ?? undefined,
      runId: runId ?? undefined,
    });

    return NextResponse.json({ suggestions });
  } catch (error) {
    return NextResponse.json({ error: formatTrendBrainError(error) }, { status: 500 });
  }
}
