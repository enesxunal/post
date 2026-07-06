"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { GENERATION_POLL_MS } from "@/lib/config";

type DashboardLiveRefreshProps = {
  isGenerating: boolean;
};

export function DashboardLiveRefresh({ isGenerating }: DashboardLiveRefreshProps) {
  const router = useRouter();

  useEffect(() => {
    if (!isGenerating) return;

    const timer = window.setInterval(() => {
      router.refresh();
    }, GENERATION_POLL_MS);

    return () => window.clearInterval(timer);
  }, [isGenerating, router]);

  return null;
}
