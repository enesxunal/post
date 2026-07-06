import { NextResponse } from "next/server";

import { getSupabaseEnvDebug } from "@/lib/supabase/env";

export async function GET() {
  return NextResponse.json(getSupabaseEnvDebug());
}
