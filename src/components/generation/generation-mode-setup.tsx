"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Hand, Loader2, Sparkles, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { loadOnboardingDraft } from "@/lib/onboarding/draft";
import { cn } from "@/lib/utils";

type GenerationModeSetupProps = {
  orderId: string;
};

type Phase = "bootstrapping" | "ready" | "submitting" | "failed";

function saveActiveProjectId(projectId: string) {
  try {
    sessionStorage.setItem("post_active_project_id", projectId);
  } catch {
    // ignore
  }
}

export function GenerationModeSetup({ orderId }: GenerationModeSetupProps) {
  const router = useRouter();
  const startedRef = useRef(false);
  const [phase, setPhase] = useState<Phase>("bootstrapping");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [brandName, setBrandName] = useState("Markanız");
  const [selectedMode, setSelectedMode] = useState<"manual" | "bulk" | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    async function bootstrap() {
      const draft = loadOnboardingDraft();
      if (draft?.brandName) setBrandName(draft.brandName);

      try {
        const startResponse = await fetch("/api/generation/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            draft: draft ? { ...draft, orderId } : { orderId },
            orderId,
          }),
        });

        const startData = (await startResponse.json()) as {
          projectId?: string;
          brandName?: string;
          error?: string;
        };

        if (startResponse.ok && startData.projectId) {
          saveActiveProjectId(startData.projectId);
          setProjectId(startData.projectId);
          if (startData.brandName) setBrandName(startData.brandName);
          setPhase("ready");
          return;
        }

        const bootstrapResponse = await fetch("/api/generation/bootstrap", {
          method: "POST",
        });
        const bootstrapData = (await bootstrapResponse.json()) as {
          projectId?: string;
        };

        if (bootstrapResponse.ok && bootstrapData.projectId) {
          saveActiveProjectId(bootstrapData.projectId);
          setProjectId(bootstrapData.projectId);
          setPhase("ready");
          return;
        }

        setErrorMessage(startData.error ?? "Paket kurulumu tamamlanamadı.");
        setPhase("failed");
      } catch {
        setErrorMessage("Bağlantı hatası. Sayfayı yenileyip tekrar deneyin.");
        setPhase("failed");
      }
    }

    void bootstrap();
  }, [orderId]);

  async function confirmMode(mode: "manual" | "bulk") {
    if (!projectId || phase === "submitting") return;

    setSelectedMode(mode);
    setPhase("submitting");

    try {
      const response = await fetch("/api/generation/generation-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, orderId, mode }),
      });
      const data = (await response.json()) as { redirectUrl?: string; error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Tercih kaydedilemedi");
      }

      router.replace(data.redirectUrl ?? (mode === "bulk" ? `/projects/${projectId}/generating` : "/dashboard"));
    } catch (error) {
      setPhase("ready");
      setSelectedMode(null);
      setErrorMessage(error instanceof Error ? error.message : "Tercih kaydedilemedi");
    }
  }

  if (phase === "bootstrapping") {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
        <p className="text-lg font-medium text-slate-900">Paketiniz hazırlanıyor…</p>
        <p className="max-w-md text-sm text-slate-500">
          Ödeme onaylandı. Görsellerinizi nasıl üretmek istediğinizi birazdan soracağız.
        </p>
      </div>
    );
  }

  if (phase === "failed") {
    return (
      <div className="mx-auto max-w-lg space-y-4 text-center">
        <p className="text-lg font-medium text-slate-900">Kurulum tamamlanamadı</p>
        <p className="text-sm text-red-600">{errorMessage}</p>
        <Button onClick={() => router.replace("/dashboard")}>Panele git</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 py-4">
      <div className="space-y-2 text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-600">
          Son adım
        </p>
        <h1 className="text-2xl font-semibold text-slate-950 sm:text-3xl">
          Görselleri nasıl üretelim?
        </h1>
        <p className="mx-auto max-w-xl text-sm leading-6 text-slate-600">
          <strong>{brandName}</strong> için postlarınız hazır. İsterseniz tek tek seçerek
          üretebilir, isterseniz poust AI&apos;nın hepsini sırayla üretmesini sağlayabilirsiniz.
        </p>
      </div>

      {errorMessage ? (
        <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          disabled={phase === "submitting"}
          onClick={() => void confirmMode("manual")}
          className={cn(
            "text-left transition",
            phase === "submitting" && selectedMode !== "manual" && "opacity-50",
          )}
        >
          <Card
            className={cn(
              "h-full border-2 p-6 transition hover:border-emerald-300 hover:shadow-md",
              selectedMode === "manual" ? "border-emerald-500 ring-4 ring-emerald-100" : "border-slate-200",
            )}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <Hand className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">Tek tek üreteceğim</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Panelde her postu kendiniz seçersiniz. İsterseniz görsel tercihinizi yazıp
              &quot;Üret&quot; dersiniz — tam kontrol sizde.
            </p>
            {phase === "submitting" && selectedMode === "manual" ? (
              <p className="mt-4 flex items-center text-sm text-emerald-700">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Panele yönlendiriliyor…
              </p>
            ) : null}
          </Card>
        </button>

        <button
          type="button"
          disabled={phase === "submitting"}
          onClick={() => void confirmMode("bulk")}
          className={cn(
            "text-left transition",
            phase === "submitting" && selectedMode !== "bulk" && "opacity-50",
          )}
        >
          <Card
            className={cn(
              "h-full border-2 p-6 transition hover:border-emerald-300 hover:shadow-md",
              selectedMode === "bulk" ? "border-emerald-500 ring-4 ring-emerald-100" : "border-slate-200",
            )}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <Wand2 className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">poust AI hepsini üretsin</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Tüm postlar sırayla otomatik üretilir. Siz kahvenizi içerken atölye çalışır; bitince
              panelden onaylarsınız.
            </p>
            {phase === "submitting" && selectedMode === "bulk" ? (
              <p className="mt-4 flex items-center text-sm text-emerald-700">
                <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                Üretim başlatılıyor…
              </p>
            ) : null}
          </Card>
        </button>
      </div>

      <p className="text-center text-xs text-slate-500">
        Bu tercihi daha sonra panelden değiştirebilirsiniz — tek tek üretim her zaman mümkün.
      </p>
    </div>
  );
}
