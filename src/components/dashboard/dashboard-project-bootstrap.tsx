"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type DashboardProjectBootstrapProps = {
  hasProject: boolean;
};

export function DashboardProjectBootstrap({ hasProject }: DashboardProjectBootstrapProps) {
  const router = useRouter();
  const startedRef = useRef(false);

  useEffect(() => {
    if (hasProject || startedRef.current) return;
    startedRef.current = true;

    async function bootstrap() {
      try {
        const response = await fetch("/api/generation/bootstrap", {
          method: "POST",
        });
        const data = (await response.json()) as { provisioned?: boolean };
        if (response.ok && data.provisioned) {
          router.refresh();
        }
      } catch {
        // Sessizce bırak — kullanıcı onboarding'i tekrar yapabilir
      }
    }

    void bootstrap();
  }, [hasProject, router]);

  return null;
}
