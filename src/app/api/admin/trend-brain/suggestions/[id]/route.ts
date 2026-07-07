import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin/auth";
import {
  diffSnapshots,
  getSuggestionById,
  previewSuggestionMerge,
} from "@/lib/trend-brain";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  const { id } = await context.params;
  const suggestion = await getSuggestionById(id);
  if (!suggestion) {
    return NextResponse.json({ error: "Öneri bulunamadı" }, { status: 404 });
  }

  const merged = previewSuggestionMerge(suggestion);
  const diff = diffSnapshots(suggestion.currentSnapshot, merged);

  return NextResponse.json({ suggestion, merged, diff });
}
