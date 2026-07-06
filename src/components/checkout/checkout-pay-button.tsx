"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type CheckoutPayButtonProps = {
  amount: number;
  label?: string;
};

export function CheckoutPayButton({
  amount,
  label = "Güvenli Öde",
}: CheckoutPayButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePay() {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/payments/tosla/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      const data = (await response.json()) as {
        redirectUrl?: string;
        error?: string;
      };

      if (!response.ok || !data.redirectUrl) {
        throw new Error(data.error ?? "Ödeme sayfası açılamadı");
      }

      window.location.href = data.redirectUrl;
    } catch (payError) {
      setError(
        payError instanceof Error ? payError.message : "Ödeme başlatılamadı",
      );
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <Button className="w-full" onClick={handlePay} disabled={isLoading}>
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : label}
      </Button>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
