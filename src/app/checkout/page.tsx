import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CheckoutPayment } from "@/components/checkout/checkout-payment";
import { BASE_PACKAGE_PRICE } from "@/lib/config";
import { addonOptions } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

export default function CheckoutPage() {
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

        <Card className="space-y-4">
          <p className="text-sm text-slate-500">Ana paket</p>
          <p className="text-3xl font-semibold text-slate-950">
            {formatCurrency(BASE_PACKAGE_PRICE)}
          </p>
          <div className="space-y-3 rounded-3xl border border-emerald-100 p-4">
            {addonOptions.map((addon) => (
              <div key={addon.key} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{addon.label}</span>
                <span className="font-medium text-slate-900">
                  +{formatCurrency(addon.price)}
                </span>
              </div>
            ))}
          </div>
          <CheckoutPayment amount={BASE_PACKAGE_PRICE} />
        </Card>
      </div>
    </div>
  );
}
