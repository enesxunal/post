import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin/auth";
import { getSuggestionById, updateSuggestionStatus } from "@/lib/trend-brain";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  const { id } = await context.params;
  const suggestion = await getSuggestionById(id);
  if (!suggestion) {
    return NextResponse.json({ error: "Öneri bulunamadı" }, { status: 404 });
  }

  if (suggestion.status !== "pending") {
    return NextResponse.json({ error: "Sadece bekleyen öneriler reddedilebilir" }, { status: 400 });
  }

  const updated = await updateSuggestionStatus(id, "rejected", admin.email);
  return NextResponse.json({ ok: true, suggestion: updated });
}
