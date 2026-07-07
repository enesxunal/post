"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { AddonKey } from "@/types/domain";

type PaymentMethod = "card" | "eft";

type CheckoutPaymentProps = {
  amount: number;
  addons?: AddonKey[];
};

export function CheckoutPayment({ amount, addons = [] }: CheckoutPaymentProps) {
  const [method, setMethod] = useState<PaymentMethod>("eft");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay() {
    setIsLoading(true);
    setError(null);

    try {
      if (method === "card") {
        const response = await fetch("/api/payments/tosla/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount, addons }),
        });
        const data = (await response.json()) as {
          redirectUrl?: string;
          error?: string;
        };
        if (!response.ok || !data.redirectUrl) {
          throw new Error(data.error ?? "Kart ödemesi başlatılamadı");
        }
        window.location.href = data.redirectUrl;
        return;
      }

      const response = await fetch("/api/payments/eft/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const data = (await response.json()) as {
        redirectUrl?: string;
        orderId?: string;
        error?: string;
      };
      if (!response.ok || !data.redirectUrl) {
        throw new Error(data.error ?? "EFT siparişi oluşturulamadı");
      }

      if (data.orderId && typeof window !== "undefined") {
        const raw = sessionStorage.getItem("post_onboarding_draft");
        if (raw) {
          try {
            const draft = JSON.parse(raw) as Record<string, unknown>;
            draft.orderId = data.orderId;
            sessionStorage.setItem("post_onboarding_draft", JSON.stringify(draft));
          } catch {
            // ignore
          }
        }
      }

      window.location.href = data.redirectUrl;
    } catch (payError) {
      setError(payError instanceof Error ? payError.message : "Ödeme başlatılamadı");
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative z-10 grid grid-cols-2 gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-1">
        <button
          type="button"
          onClick={() => setMethod("eft")}
          className={cn(
            "relative z-10 cursor-pointer rounded-xl px-3 py-2.5 text-sm font-medium transition touch-manipulation",
            method === "eft" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500",
          )}
        >
          Havale / EFT
        </button>
        <button
          type="button"
          onClick={() => setMethod("card")}
          className={cn(
            "relative z-10 cursor-pointer rounded-xl px-3 py-2.5 text-sm font-medium transition touch-manipulation",
            method === "card" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500",
          )}
        >
          Kredi kartı
        </button>
      </div>

      {method === "eft" ? (
        <p className="text-xs leading-5 text-slate-500">
          IBAN bilgilerini görürsünüz. Ödeme admin tarafından onaylandıktan sonra tasarım
          üretimi başlar.
        </p>
      ) : (
        <p className="text-xs leading-5 text-slate-500">
          Tosla güvenli ödeme sayfasına yönlendirilirsiniz. Ödeme sonrası üretim hemen başlar.
        </p>
      )}

      <Button className="w-full" onClick={handlePay} disabled={isLoading}>
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : method === "eft" ? (
          "EFT ile devam et"
        ) : (
          "Kart ile öde"
        )}
      </Button>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
