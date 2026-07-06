import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin/auth";
import { updateStyleRule } from "@/lib/styles/repository";
import type { StyleRule } from "@/types/domain";

type RouteContext = {
  params: Promise<{ key: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  try {
    const { key } = await context.params;
    const body = (await request.json()) as Partial<StyleRule>;
    const data = await updateStyleRule(key, body);
    return NextResponse.json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Kayıt güncellenemedi";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
