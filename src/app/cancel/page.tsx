import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function CancelPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-lg space-y-4 text-center">
        <h1 className="text-3xl font-semibold text-slate-950">Odeme tamamlanmadi</h1>
        <p className="text-sm leading-7 text-slate-600">
          Siparisiniz aktiflesmedi. Dilerseniz tekrar odeme akisina donebilirsiniz.
        </p>
        <Link href="/checkout">
          <Button>Odeme ekranina don</Button>
        </Link>
      </Card>
    </div>
  );
}
