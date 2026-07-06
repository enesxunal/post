import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function SuccessPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-lg space-y-4 text-center">
        <h1 className="text-3xl font-semibold text-slate-950">Odeme basarili</h1>
        <p className="text-sm leading-7 text-slate-600">
          Siparisiniz alindi. Uretim isleri olusturulup hazirlaniyor ekranina yonlendirilebilir.
        </p>
        <Link href="/orders/demo-order/generating">
          <Button>Postlarimi hazirla</Button>
        </Link>
      </Card>
    </div>
  );
}
