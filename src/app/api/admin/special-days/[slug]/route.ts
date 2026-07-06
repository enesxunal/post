import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin/auth";
import { updateSpecialDay } from "@/lib/special-days/repository";
import type { SpecialDay } from "@/types/domain";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  try {
    const { slug } = await context.params;
    const body = (await request.json()) as Partial<SpecialDay>;
    const data = await updateSpecialDay(slug, body);
    return NextResponse.json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Kayıt güncellenemedi";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
