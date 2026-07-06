import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BASE_PACKAGE_PRICE, TODO_LABELS } from "@/lib/config";
import { addonOptions } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_0.9fr]">
        <Card className="space-y-5">
          <Badge>Odeme ozetiniz</Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Guvenli odeme</h1>
          <p className="text-sm leading-7 text-slate-600">
            Tosla adapter yapisi mock olarak hazirlandi. Gercek API anahtari geldiginde odeme oturumu bu ekrandan baglanacak.
          </p>
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
            {TODO_LABELS.tosla}
          </div>
        </Card>

        <Card className="space-y-4">
          <p className="text-sm text-slate-500">Ana paket</p>
          <p className="text-3xl font-semibold text-slate-950">{formatCurrency(BASE_PACKAGE_PRICE)}</p>
          <div className="space-y-3 rounded-3xl border border-emerald-100 p-4">
            {addonOptions.map((addon) => (
              <div key={addon.key} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{addon.label}</span>
                <span className="font-medium text-slate-900">+{formatCurrency(addon.price)}</span>
              </div>
            ))}
          </div>
          <Link href="/orders/demo-order/generating">
            <Button className="w-full">Guvenli Ode</Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
