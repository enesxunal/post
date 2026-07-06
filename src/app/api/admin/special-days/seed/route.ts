import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin/auth";
import { seedSpecialDaysFromCatalog } from "@/lib/special-days/repository";

export async function POST() {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  try {
    const count = await seedSpecialDaysFromCatalog();
    return NextResponse.json({ ok: true, count });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Seed başarısız";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
