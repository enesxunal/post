import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin/auth";
import { seedStyleRulesFromCatalog } from "@/lib/styles/repository";

export async function POST() {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  try {
    const count = await seedStyleRulesFromCatalog();
    return NextResponse.json({ ok: true, count });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Seed başarısız";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
