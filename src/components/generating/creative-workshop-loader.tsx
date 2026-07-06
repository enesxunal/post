"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GENERATING_MESSAGES } from "@/lib/config";
import { loadOnboardingDraft } from "@/lib/onboarding/draft";

const floatingPosts = ["29 Ekim", "Kandil", "Cuma", "Bayram", "Anneler Günü"];

type GenerationPhase = "starting" | "running" | "done" | "error";

type GenerationStatus = {
  projectId: string;
  total: number;
  ready: number;
  failed: number;
  queued: number;
  inProgress: number;
  progress: number;
  done: boolean;
  brandName?: string;
};

type CreativeWorkshopLoaderProps = {
  orderId: string;
};

export function CreativeWorkshopLoader({ orderId }: CreativeWorkshopLoaderProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<GenerationPhase>("starting");
  const [messageIndex, setMessageIndex] = useState(0);
  const [status, setStatus] = useState<GenerationStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isRunningRef = useRef(false);

  const progress = status?.progress ?? (phase === "starting" ? 8 : 0);

  const runPipeline = useCallback(async () => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;
    setPhase("running");
    setError(null);

    try {
      const draft = loadOnboardingDraft();
      if (!draft) {
        throw new Error("Marka bilgileri bulunamadı. Onboarding adımını tekrar tamamlayın.");
      }

      const draftWithOrder = { ...draft, orderId };

      const startResponse = await fetch("/api/generation/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft: { ...draftWithOrder, orderId }, orderId }),
      });

      const startData = (await startResponse.json()) as GenerationStatus & {
        error?: string;
        projectId?: string;
      };

      if (!startResponse.ok || !startData.projectId) {
        throw new Error(startData.error ?? "Üretim başlatılamadı");
      }

      let currentStatus = startData;
      setStatus(currentStatus);

      while (!currentStatus.done) {
        const nextResponse = await fetch("/api/generation/process-next", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId: currentStatus.projectId }),
        });

        const nextData = (await nextResponse.json()) as {
          status?: GenerationStatus;
          error?: string;
        };

        if (!nextResponse.ok || !nextData.status) {
          throw new Error(nextData.error ?? "Görsel üretimi durdu");
        }

        currentStatus = nextData.status;
        setStatus(currentStatus);

        if (!nextData.status.done && nextData.status.queued === 0 && nextData.status.inProgress === 0) {
          break;
        }
      }

      setPhase("done");
      setTimeout(() => {
        router.push(`/projects/${currentStatus.projectId}`);
      }, 1500);
    } catch (pipelineError) {
      setPhase("error");
      setError(
        pipelineError instanceof Error
          ? pipelineError.message
          : "Üretim sırasında bir hata oluştu",
      );
      isRunningRef.current = false;
    }
  }, [orderId, router]);

  useEffect(() => {
    runPipeline();
  }, [runPipeline]);

  useEffect(() => {
    const messageTimer = window.setInterval(() => {
      setMessageIndex((current) => (current + 1) % GENERATING_MESSAGES.length);
    }, 2200);
    return () => window.clearInterval(messageTimer);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#04150d] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-emerald-500/20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[360px] w-[360px] rounded-full bg-lime-400/10 blur-[100px]" />
        <GridOverlay />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-10 sm:px-6">
        <div className="mb-8 text-center lg:text-left">
          <Badge className="border-emerald-400/30 bg-emerald-500/10 text-emerald-200">
            {phase === "done" ? "Tamamlandı" : "Dijital atölye çalışıyor"}
          </Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">
            {status?.brandName
              ? `${status.brandName} için postlar üretiliyor`
              : "Markanız için postlar üretiliyor"}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-emerald-100/80 sm:text-base">
            {phase === "done"
              ? "Görseller hazır! Panele yönlendiriliyorsunuz..."
              : "Gemini AI görsellerinizi oluşturuyor. Bu işlem birkaç dakika sürebilir."}
          </p>
        </div>

        <div className="grid items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-5">
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="text-emerald-200">İlerleme</span>
                <span className="font-semibold">{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-lime-300 to-emerald-500"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              {status ? (
                <p className="mt-3 text-xs text-emerald-200/80">
                  {status.ready} / {status.total} görsel hazır
                  {status.failed > 0 ? ` • ${status.failed} hata` : ""}
                </p>
              ) : null}
            </div>

            {phase === "error" ? (
              <div className="rounded-[28px] border border-red-400/30 bg-red-500/10 p-5">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />
                  <div>
                    <p className="font-semibold text-red-100">Üretim durdu</p>
                    <p className="mt-2 text-sm leading-6 text-red-100/80">{error}</p>
                    <Button
                      variant="secondary"
                      className="mt-4"
                      onClick={() => {
                        isRunningRef.current = false;
                        setPhase("starting");
                        runPipeline();
                      }}
                    >
                      Tekrar dene
                    </Button>
                  </div>
                </div>
              </div>
            ) : phase === "done" ? (
              <div className="rounded-[28px] border border-emerald-400/30 bg-emerald-500/10 p-5">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                  <p className="font-semibold">Tüm görseller üretildi!</p>
                </div>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={messageIndex}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="rounded-[28px] border border-emerald-400/30 bg-emerald-500/10 p-5"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">
                    Şu an
                  </p>
                  <p className="mt-2 flex items-center gap-2 text-xl font-semibold text-white">
                    <Loader2 className="h-5 w-5 animate-spin text-emerald-300" />
                    {GENERATING_MESSAGES[messageIndex]}
                  </p>
                </motion.div>
              </AnimatePresence>
            )}

            {status?.projectId ? (
              <Link href={`/projects/${status.projectId}`}>
                <Button variant="secondary" className="w-full sm:w-auto">
                  Panele git
                </Button>
              </Link>
            ) : (
              <Link href="/dashboard">
                <Button variant="secondary" className="w-full sm:w-auto">
                  Panele git
                </Button>
              </Link>
            )}
          </div>

          <WorkshopStage activeIndex={messageIndex} readyCount={status?.ready ?? 0} />
        </div>
      </div>
    </div>
  );
}

function WorkshopStage({
  activeIndex,
  readyCount,
}: {
  activeIndex: number;
  readyCount: number;
}) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px]">
      <motion.div
        className="absolute inset-0 rounded-[40px] border border-emerald-400/20 bg-white/[0.03] backdrop-blur"
        animate={{ rotate: [0, 1.5, 0, -1.5, 0] }}
        transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-300/30"
        animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.7, 0.35] }}
        transition={{ duration: 2.4, repeat: Number.POSITIVE_INFINITY }}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-emerald-400 to-lime-300 shadow-[0_0_60px_rgba(52,211,153,0.45)]"
        animate={{ scale: activeIndex === 3 ? [1, 1.12, 1] : [1, 1.04, 1] }}
        transition={{ duration: 1.4, repeat: Number.POSITIVE_INFINITY }}
      >
        <div className="flex h-full flex-col items-center justify-center text-sm font-bold text-emerald-950">
          <span>AI</span>
          {readyCount > 0 ? (
            <span className="mt-1 text-[10px] font-semibold">{readyCount} hazır</span>
          ) : null}
        </div>
      </motion.div>

      {floatingPosts.map((label, postIndex) => {
        const angle = (postIndex / floatingPosts.length) * Math.PI * 2;
        const radius = 150;

        return (
          <motion.div
            key={label}
            className="absolute left-1/2 top-1/2 w-28 -translate-x-1/2 -translate-y-1/2"
            animate={{
              x: Math.cos(angle + activeIndex * 0.4) * radius,
              y: Math.sin(angle + activeIndex * 0.4) * radius,
              rotate: [0, 6, 0],
            }}
            transition={{
              duration: 3 + postIndex * 0.2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <div className="rounded-2xl border border-emerald-300/30 bg-[#0f2f22]/90 p-3 text-center text-xs font-medium shadow-lg backdrop-blur">
              {label}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function GridOverlay() {
  return (
    <div
      className="absolute inset-0 opacity-[0.08]"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.35) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    />
  );
}
