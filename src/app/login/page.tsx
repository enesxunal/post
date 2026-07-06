import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md space-y-5">
        <Badge>Magic link login</Badge>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Panel girisi</h1>
        <p className="text-sm leading-7 text-slate-600">
          Supabase Auth entegrasyonu icin giris ekrani hazirlandi. Simdilik gorsel iskelet sunuyor.
        </p>
        <Input type="email" placeholder="E-posta adresiniz" />
        <Button className="w-full">Giris linki gonder</Button>
        <Link href="/" className="block text-center text-sm text-slate-500">
          Anasayfaya don
        </Link>
      </Card>
    </div>
  );
}
