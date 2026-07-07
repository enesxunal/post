import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin/auth";
import { resetUserGenerationByEmail } from "@/lib/admin/reset-generation";

export async function POST(request: Request) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { email?: string };

  if (!body.email?.trim()) {
    return NextResponse.json({ error: "email gerekli" }, { status: 400 });
  }

  try {
    const result = await resetUserGenerationByEmail(body.email);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sıfırlama başarısız";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
