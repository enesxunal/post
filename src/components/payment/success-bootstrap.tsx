"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { loadOnboardingDraft } from "@/lib/onboarding/draft";

type SuccessBootstrapProps = {
  orderId?: string;
};

export function SuccessBootstrap({ orderId }: SuccessBootstrapProps) {
  const router = useRouter();
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    async function start() {
      const draft = loadOnboardingDraft();
      const resolvedOrderId = draft?.orderId ?? orderId;

      if (resolvedOrderId) {
        router.replace(`/orders/${resolvedOrderId}/generating`);
        return;
      }

      try {
        const response = await fetch("/api/generation/bootstrap", { method: "POST" });
        const data = (await response.json()) as { provisioned?: boolean };
        if (response.ok && data.provisioned) {
          router.replace("/dashboard");
          return;
        }
      } catch {
        // Aşağıdaki dashboard yönlendirmesine düş
      }

      router.replace("/dashboard");
    }

    void start();
  }, [orderId, router]);

  return (
    <p className="text-sm text-slate-500">Paketiniz hazırlanıyor, lütfen bekleyin…</p>
  );
}
