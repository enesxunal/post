import { NextResponse } from "next/server";
import { z } from "zod";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Ad soyad gerekli."),
  email: z.string().trim().email("Geçerli bir e-posta girin."),
  message: z.string().trim().min(10, "Mesaj en az 10 karakter olmalı."),
});

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Form hatalı." },
      { status: 400 },
    );
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Mesaj şu an kaydedilemiyor. Lütfen e-posta ile yazın." },
      { status: 503 },
    );
  }

  const { error } = await supabase.from("contact_messages").insert({
    name: parsed.data.name,
    email: parsed.data.email,
    message: parsed.data.message,
  });

  if (error) {
    console.error("[contact]", error.message);
    return NextResponse.json(
      { error: "Mesaj kaydedilemedi. Lütfen e-posta ile yazın." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
