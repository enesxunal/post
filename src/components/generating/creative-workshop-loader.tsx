"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GENERATING_MESSAGES, GENERATION_POLL_MS } from "@/lib/config";
import { loadOnboardingDraft } from "@/lib/onboarding/draft";

const floatingPosts = ["29 Ekim", "Kandil", "Cuma", "Bayram", "Anneler Günü"];

type GenerationPhase = "starting" | "running" | "done";

type JobPreview = {
  id: string;
  status: string;
  type: string;
  image_url?: string | null;
};

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
  jobs?: JobPreview[];
};

type CreativeWorkshopLoaderProps = {
  orderId: string;
};

function saveActiveProjectId(projectId: string) {
  try {
    sessionStorage.setItem("post_active_project_id", projectId);
  } catch {
    // ignore
  }
}

export function CreativeWorkshopLoader({ orderId }: CreativeWorkshopLoaderProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<GenerationPhase>("starting");
  const [messageIndex, setMessageIndex] = useState(0);
  const [status, setStatus] = useState<GenerationStatus | null>(null);
  const startedRef = useRef(false);

  const progress = status?.progress ?? (phase === "starting" ? 5 : 0);
  const readyJobs = status?.jobs?.filter((job) => job.status === "ready" && job.image_url) ?? [];

  const pollStatus = useCallback(async (projectId: string) => {
    const response = await fetch(`/api/generation/start?projectId=${projectId}`, {
      cache: "no-store",
    });
    const data = (await response.json()) as GenerationStatus & { error?: string };
    if (!response.ok) throw new Error(data.error ?? "Durum alınamadı");
    return data;
  }, []);

  const kickQueue = useCallback(async (projectId: string) => {
    await fetch("/api/generation/process-queue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId }),
    }).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    async function start() {
      const draft = loadOnboardingDraft();
      if (!draft) {
        setPhase("running");
        return;
      }

      const startResponse = await fetch("/api/generation/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft: { ...draft, orderId }, orderId }),
      });

      const startData = (await startResponse.json()) as GenerationStatus & {
        error?: string;
        projectId?: string;
      };

      if (!startResponse.ok || !startData.projectId) {
        setPhase("running");
        return;
      }

      saveActiveProjectId(startData.projectId);
      setStatus(startData);
      setPhase(startData.done ? "done" : "running");

      if (!startData.done) {
        await kickQueue(startData.projectId);
      }
    }

    void start();
  }, [orderId, kickQueue]);

  useEffect(() => {
    if (!status?.projectId || status.done) return;

    const projectId = status.projectId;
    let active = true;

    const timer = window.setInterval(async () => {
      try {
        const next = await pollStatus(projectId);
        if (!active) return;
        setStatus(next);
        if (next.done) {
          setPhase("done");
          window.setTimeout(() => router.push(`/projects/${projectId}`), 2000);
        }
      } catch {
        // Sessizce tekrar dene — sunucu kuyruğu arka planda çalışıyor
      }
    }, GENERATION_POLL_MS);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [status?.projectId, status?.done, pollStatus, router]);

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
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-10 sm:px-6">
        <div className="mb-8 text-center lg:text-left">
          <Badge className="border-emerald-400/30 bg-emerald-500/10 text-emerald-200">
            {phase === "done" ? "Tamamlandı" : "Arka planda üretiliyor"}
          </Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">
            {status?.brandName
              ? `${status.brandName} için postlar üretiliyor`
              : "Markanız için postlar üretiliyor"}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-emerald-100/80 sm:text-base">
            {phase === "done"
              ? "Tüm görseller hazır! Panele yönlendiriliyorsunuz..."
              : "Görseller sırayla üretiliyor. Bu sayfayı kapatabilirsiniz — hazır olanlar profilinizde görünür."}
          </p>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[0.95fr_1.05fr]">
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
                  {status.inProgress > 0 ? " • 1 görsel üretiliyor" : ""}
                  {status.queued > 0 ? ` • ${status.queued} sırada` : ""}
                </p>
              ) : null}
            </div>

            {phase === "done" ? (
              <div className="rounded-[28px] border border-emerald-400/30 bg-emerald-500/10 p-5">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                  <p className="font-semibold">Üretim tamamlandı!</p>
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
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Şu an</p>
                  <p className="mt-2 flex items-center gap-2 text-xl font-semibold text-white">
                    <Loader2 className="h-5 w-5 animate-spin text-emerald-300" />
                    {GENERATING_MESSAGES[messageIndex]}
                  </p>
                </motion.div>
              </AnimatePresence>
            )}

            {readyJobs.length > 0 ? (
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-4">
                <p className="mb-3 text-sm font-medium text-emerald-100">Hazır görseller</p>
                <div className="grid grid-cols-3 gap-2">
                  {readyJobs.slice(0, 6).map((job) => (
                    <div
                      key={job.id}
                      className="aspect-square overflow-hidden rounded-xl border border-emerald-400/20"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={job.image_url!}
                        alt="Hazır post"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {status?.projectId ? (
              <Button
                variant="secondary"
                className="w-full sm:w-auto"
                onClick={() => router.push(`/projects/${status.projectId}`)}
              >
                Profilde gör
              </Button>
            ) : (
              <Link
                href="/dashboard"
                className="inline-flex h-11 items-center justify-center rounded-full bg-emerald-50 px-5 text-sm font-semibold text-emerald-700"
              >
                Panele git
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
