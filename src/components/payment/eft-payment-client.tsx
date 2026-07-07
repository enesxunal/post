"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Copy, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EFT_BANK_DETAILS } from "@/lib/payments/eft-config";
import { formatCurrency } from "@/lib/utils";

type EftPaymentClientProps = {
  orderId: string;
};

export function EftPaymentClient({ orderId }: EftPaymentClientProps) {
  const [status, setStatus] = useState<"pending" | "paid" | "loading" | "error">("loading");
  const [amount, setAmount] = useState<number | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function poll() {
      try {
        const response = await fetch(`/api/payments/eft/${orderId}/status`);
        const data = (await response.json()) as {
          paid?: boolean;
          status?: string;
          amount?: number;
        };

        if (!active) return;

        if (typeof data.amount === "number") {
          setAmount(data.amount);
        }

        if (data.paid || data.status === "paid") {
          setStatus("paid");
          return;
        }

        setStatus("pending");
      } catch {
        if (active) setStatus("error");
      }
    }

    poll();
    const timer = window.setInterval(poll, 8000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [orderId]);

  async function copyText(label: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(null), 2000);
  }

  const ibanPlain = EFT_BANK_DETAILS.iban.replace(/\s/g, "");
  const amountLabel = amount !== null ? formatCurrency(amount) : "…";

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (status === "paid") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <Card className="w-full max-w-lg space-y-4 p-8 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
          <h1 className="text-2xl font-semibold text-slate-950">Ödemeniz onaylandı!</h1>
          <p className="text-sm text-slate-600">
            Profilinizde boş kartlar hazır. İstediğiniz posta tıklayıp tek tek üretebilirsiniz.
          </p>
          <Button
            className="mt-5 w-full"
            onClick={() => {
              window.location.href = "/dashboard";
            }}
          >
            Profilime git
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-lg space-y-5">
        <Card className="space-y-5 p-6">
          <div>
            <Badge>EFT / Havale</Badge>
            <h1 className="mt-3 text-2xl font-semibold text-slate-950">Ödeme bilgileri</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Aşağıdaki hesaba <strong>{amountLabel}</strong> gönderin.
              Ödeme onaylandığında bu sayfa otomatik güncellenir.
            </p>
          </div>

          <div className="space-y-3 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 text-sm">
            <InfoRow label="Alıcı" value={EFT_BANK_DETAILS.accountHolder} />
            <InfoRow label="Banka" value={EFT_BANK_DETAILS.bankName} />
            <div>
              <p className="text-xs text-slate-500">IBAN</p>
              <p className="mt-1 font-mono text-sm font-medium text-slate-900">
                {EFT_BANK_DETAILS.iban}
              </p>
              <Button
                variant="outline"
                className="mt-2 h-9 px-3 text-xs"
                onClick={() => copyText("iban", ibanPlain)}
              >
                <Copy className="mr-2 h-3.5 w-3.5" />
                {copied === "iban" ? "Kopyalandı" : "IBAN kopyala"}
              </Button>
            </div>
            <InfoRow label="Tutar" value={amountLabel} />
            <InfoRow label="Açıklama" value={EFT_BANK_DETAILS.description} />
            <InfoRow label="Sipariş no" value={orderId.slice(0, 8).toUpperCase()} />
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            Ödemeyi yaptıktan sonra admin onayı beklenir (genelde aynı gün). Onaylanınca
            &quot;Tasarımları oluştur&quot; butonu çıkar.
          </div>

          {status === "error" ? (
            <p className="text-sm text-red-600">Durum kontrol edilemedi. Sayfayı yenileyin.</p>
          ) : (
            <p className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Onay bekleniyor...
            </p>
          )}
        </Card>

        <Link href="/dashboard" className="block text-center text-sm text-slate-500">
          Panele dön
        </Link>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-0.5 font-medium text-slate-900">{value}</p>
    </div>
  );
}
