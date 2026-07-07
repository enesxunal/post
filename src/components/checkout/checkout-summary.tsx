"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CheckoutPayment } from "@/components/checkout/checkout-payment";
import {
  calculatePackageTotal,
  getSelectedAddonLines,
} from "@/lib/checkout/calculate-total";
import { BASE_PACKAGE_PRICE } from "@/lib/config";
import { loadOnboardingDraft } from "@/lib/onboarding/draft";
import { formatCurrency } from "@/lib/utils";
import type { AddonKey } from "@/types/domain";

export function CheckoutSummary() {
  const [addons, setAddons] = useState<AddonKey[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const draft = loadOnboardingDraft();
    setAddons(draft?.purchasedAddons ?? []);
    setReady(true);
  }, []);

  const total = calculatePackageTotal(addons);
  const selectedLines = getSelectedAddonLines(addons);

  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-sm text-slate-500">Yükleniyor…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1fr_0.9fr]">
        <Card className="space-y-5">
          <Badge>Ödeme özetiniz</Badge>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
            Ödeme yöntemi seçin
          </h1>
          <p className="text-sm leading-7 text-slate-600">
            Havale/EFT ile ödeyebilir veya kredi kartı ile anında ödeme yapabilirsiniz.
            EFT ödemeleri admin onayından sonra tasarım üretimi başlar.
          </p>
        </Card>

        <Card className="relative z-10 space-y-4">
          <div className="space-y-3 rounded-3xl border border-emerald-100 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Ana paket</span>
              <span className="font-medium text-slate-900">
                {formatCurrency(BASE_PACKAGE_PRICE)}
              </span>
            </div>
            {selectedLines.map((addon) => (
              <div key={addon.key} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{addon.label}</span>
                <span className="font-medium text-slate-900">
                  +{formatCurrency(addon.price)}
                </span>
              </div>
            ))}
            <div className="border-t border-emerald-100 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Toplam</span>
                <span className="text-2xl font-semibold text-slate-950">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          </div>
          <CheckoutPayment amount={total} addons={addons} />
        </Card>
      </div>
    </div>
  );
}
