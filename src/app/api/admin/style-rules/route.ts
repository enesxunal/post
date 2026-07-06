import { NextResponse } from "next/server";

import { getAdminSession } from "@/lib/admin/auth";
import { listStyleRules } from "@/lib/styles/repository";

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  const data = await listStyleRules();
  return NextResponse.json({ data });
}
