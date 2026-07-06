import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin/auth";
import { listSectorRules } from "@/lib/sectors/repository";

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  const data = await listSectorRules();
  return NextResponse.json({ data });
}
