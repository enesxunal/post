import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin/auth";
import {
  createPromptVersionFromSuggestion,
  getSuggestionById,
  updateSuggestionStatus,
} from "@/lib/trend-brain";
import { applyPatch } from "@/lib/trend-brain/snapshots";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json().catch(() => ({}))) as {
    patch?: Record<string, unknown>;
  };

  const suggestion = await getSuggestionById(id);
  if (!suggestion) {
    return NextResponse.json({ error: "Öneri bulunamadı" }, { status: 404 });
  }

  if (!["pending", "approved"].includes(suggestion.status)) {
    return NextResponse.json({ error: "Bu öneri zaten işlendi" }, { status: 400 });
  }

  const finalSuggestion = body.patch
    ? {
        ...suggestion,
        suggestedPatch: applyPatch(suggestion.suggestedPatch, body.patch),
      }
    : suggestion;

  await updateSuggestionStatus(id, "approved", admin.email, finalSuggestion.suggestedPatch);
  const version = await createPromptVersionFromSuggestion(
    { ...finalSuggestion, status: "approved" },
    admin.email,
  );
  await updateSuggestionStatus(id, "applied", admin.email);

  return NextResponse.json({ ok: true, version });
}
