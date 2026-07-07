"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { CheckCircle2, Loader2, Octagon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GENERATING_MESSAGES, GENERATION_POLL_MS } from "@/lib/config";
import { loadOnboardingDraft } from "@/lib/onboarding/draft";
import { getSpecialDayById } from "@/lib/special-days-data";
import { cn } from "@/lib/utils";

const floatingPosts = ["29 Ekim", "Kandil", "Cuma", "Bayram", "Anneler Günü"];

const REGENERATE_MESSAGES = [
  "Görsel brief'i hazırlanıyor...",
  "Markanıza özel tasarım oluşturuluyor...",
  "AI atölyesi çalışıyor...",
  "Son dokunuşlar yapılıyor...",
  "Görseliniz neredeyse hazır...",
];

type GenerationPhase = "starting" | "running" | "done" | "stopped" | "failed";

type JobPreview = {
  id: string;
  status: string;
  type: string;
  error_message?: string | null;
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
  stopped?: boolean;
  brandName?: string;
  jobs?: JobPreview[];
};

type CreativeWorkshopLoaderProps = {
  orderId?: string;
  mode?: "order" | "regenerate";
  projectId?: string;
  focusJobId?: string;
  focusDayName?: string;
};

function saveActiveProjectId(projectId: string) {
  try {
    sessionStorage.setItem("post_active_project_id", projectId);
  } catch {
    // ignore
  }
}

function getFocusJobProgress(job: JobPreview | undefined) {
  if (!job) return 12;
  if (job.status === "ready") return 100;
  if (job.status === "failed") return 8;
  if (job.status === "queued") return 28;
  if (job.status === "composing_prompt") return 42;
  if (job.status === "generating_image") return 68;
  if (job.status === "generating_caption") return 88;
  return 55;
}

function getFocusJobStatusLabel(job: JobPreview | undefined) {
  switch (job?.status) {
    case "queued":
      return "Sırada bekliyor";
    case "composing_prompt":
      return "Tasarım brief'i hazırlanıyor";
    case "generating_image":
      return "AI görsel üretiyor (30–90 sn sürebilir)";
    case "generating_caption":
      return "Son kontroller yapılıyor";
    case "ready":
      return "Görsel hazır";
    case "failed":
      return job.error_message ? `Üretim başarısız: ${job.error_message}` : "Üretim başarısız";
    default:
      return "Şu an üretiliyor";
  }
}

export function CreativeWorkshopLoader({
  orderId,
  mode = "order",
  projectId: initialProjectId,
  focusJobId,
  focusDayName,
}: CreativeWorkshopLoaderProps) {
  const isRegenerateMode = mode === "regenerate" && Boolean(initialProjectId);
  const [phase, setPhase] = useState<GenerationPhase>("starting");
  const [messageIndex, setMessageIndex] = useState(0);
  const [status, setStatus] = useState<GenerationStatus | null>(null);
  const [previewImages, setPreviewImages] = useState<Record<string, string>>({});
  const [stopping, setStopping] = useState(false);
  const [showSlowHint, setShowSlowHint] = useState(false);
  const startedRef = useRef(false);
  const pollTickRef = useRef(0);

  const focusJob = useMemo(
    () => status?.jobs?.find((job) => job.id === focusJobId),
    [status?.jobs, focusJobId],
  );

  const resolvedDayName = useMemo(() => {
    if (focusDayName) return focusDayName;
    if (focusJob?.type) {
      return getSpecialDayById(focusJob.type)?.name ?? "Özel gün postu";
    }
    return "Özel gün postu";
  }, [focusDayName, focusJob?.type]);

  const messages = isRegenerateMode ? REGENERATE_MESSAGES : GENERATING_MESSAGES;

  const progress = isRegenerateMode
    ? getFocusJobProgress(focusJob)
    : (status?.progress ?? (phase === "starting" ? 5 : 0));

  const readyJobIds =
    status?.jobs?.filter((job) => job.status === "ready").map((job) => job.id) ?? [];

  const readyJobs = readyJobIds
    .map((id) => ({ id, url: previewImages[id] }))
    .filter((item): item is { id: string; url: string } => Boolean(item.url));

  const pollStatus = useCallback(async (projectId: string) => {
    const response = await fetch(
      `/api/generation/start?projectId=${projectId}&lightweight=1`,
      { cache: "no-store" },
    );
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

  const applyStatus = useCallback(
    (next: GenerationStatus) => {
      setStatus(next);

      if (isRegenerateMode && focusJobId) {
        const target = next.jobs?.find((job) => job.id === focusJobId);
        if (target?.status === "ready") {
          setPhase("done");
          return;
        }
        if (target?.status === "failed" && next.inProgress === 0 && next.queued === 0) {
          setPhase("failed");
          return;
        }
        if (next.stopped) {
          setPhase("stopped");
          return;
        }
        setPhase("running");
        return;
      }

      if (next.stopped) {
        setPhase("stopped");
        return;
      }
      if (next.done) {
        setPhase("done");
        return;
      }
      setPhase("running");
    },
    [focusJobId, isRegenerateMode],
  );

  const stopGeneration = useCallback(async () => {
    if (!status?.projectId || stopping) return;

    const confirmed = window.confirm(
      "Üretimi durdurmak istediğinize emin misiniz?\n\nHazır olan görseller kalır, sırada bekleyenler üretilmez.",
    );
    if (!confirmed) return;

    setStopping(true);
    try {
      const response = await fetch("/api/generation/stop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: status.projectId }),
      });
      const data = (await response.json()) as GenerationStatus & { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Durdurulamadı");
      applyStatus(data);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Durdurulamadı");
    } finally {
      setStopping(false);
    }
  }, [applyStatus, status?.projectId, stopping]);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    async function start() {
      if (isRegenerateMode && initialProjectId) {
        saveActiveProjectId(initialProjectId);
        try {
          const data = await pollStatus(initialProjectId);
          applyStatus(data);
          if (!data.done && !data.stopped) {
            await kickQueue(initialProjectId);
          }
        } catch {
          setPhase("running");
        }
        return;
      }

      if (!orderId) {
        setPhase("running");
        return;
      }

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
      applyStatus(startData);

      if (!startData.done && !startData.stopped) {
        await kickQueue(startData.projectId);
      }
    }

    void start();
  }, [applyStatus, initialProjectId, isRegenerateMode, kickQueue, orderId, pollStatus]);

  useEffect(() => {
    if (!status?.jobs?.length) return;

    for (const job of status.jobs) {
      if (job.status !== "ready" || previewImages[job.id]) continue;

      void fetch(`/api/generation/job-image?jobId=${job.id}`, { cache: "no-store" })
        .then(async (response) => {
          if (!response.ok) return null;
          return (await response.json()) as { imageUrl?: string };
        })
        .then((data) => {
          if (!data?.imageUrl) return;
          setPreviewImages((current) =>
            current[job.id] ? current : { ...current, [job.id]: data.imageUrl! },
          );
        });
    }
  }, [previewImages, status?.jobs]);

  useEffect(() => {
    if (!status?.projectId || phase === "done" || phase === "stopped" || phase === "failed") {
      return;
    }

    const projectId = status.projectId;
    let active = true;

    const timer = window.setInterval(async () => {
      try {
        pollTickRef.current += 1;
        if (pollTickRef.current > 6) setShowSlowHint(true);
        const next = await pollStatus(projectId);
        if (!active) return;
        applyStatus(next);

        const workPending =
          next.inProgress > 0 ||
          next.queued > 0 ||
          (isRegenerateMode &&
            focusJobId &&
            next.jobs?.find((job) => job.id === focusJobId)?.status === "queued");

        if (workPending && !next.stopped) {
          await kickQueue(projectId);
        }

        if (isRegenerateMode && focusJobId) {
          const target = next.jobs?.find((job) => job.id === focusJobId);
          if (target?.status === "ready") {
            setPhase("done");
          } else if (
            target?.status === "failed" &&
            next.inProgress === 0 &&
            next.queued === 0
          ) {
            setPhase("failed");
          }
          return;
        }

        if (next.done) {
          setPhase("done");
        }
      } catch {
        // Sessizce tekrar dene — sunucu kuyruğu arka planda çalışıyor
      }
    }, GENERATION_POLL_MS);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [
    applyStatus,
    focusJobId,
    isRegenerateMode,
    phase,
    pollStatus,
    kickQueue,
    status?.projectId,
  ]);

  useEffect(() => {
    const messageTimer = window.setInterval(() => {
      setMessageIndex((current) => (current + 1) % messages.length);
    }, 2200);
    return () => window.clearInterval(messageTimer);
  }, [messages.length]);

  const headline = isRegenerateMode
    ? `${resolvedDayName} görseli yeniden üretiliyor`
    : status?.brandName
      ? `${status.brandName} için postlar üretiliyor`
      : "Markanız için postlar üretiliyor";

  const subtitle =
    phase === "done"
      ? isRegenerateMode
        ? "Görsel hazır! İstediğiniz zaman profile gidebilirsiniz."
        : "Tüm görseller hazır! Profile gidip inceleyebilirsiniz."
      : phase === "failed"
        ? "Görsel üretilemedi. Profilinizden tekrar deneyebilirsiniz."
        : phase === "stopped"
          ? "Üretim durduruldu. Hazır olan görseller profilinizde — kalanlar üretilmedi."
          : isRegenerateMode
            ? `${resolvedDayName} için özel tasarım hazırlanıyor. Bu sayfayı kapatabilirsiniz — hazır olunca profilinizde görünür.`
            : "Görseller sırayla üretiliyor. Bu sayfayı kapatabilirsiniz — hazır olanlar profilinizde görünür.";

  const badgeLabel =
    phase === "done"
      ? "Tamamlandı"
      : phase === "failed"
        ? "Üretilemedi"
        : phase === "stopped"
          ? "Durduruldu"
          : isRegenerateMode
            ? "Yeniden üretiliyor"
            : "Arka planda üretiliyor";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#04150d] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-emerald-500/20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[360px] w-[360px] rounded-full bg-lime-400/10 blur-[100px]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-10 sm:px-6">
        <div className="mb-8 text-center lg:text-left">
          <Badge className="border-emerald-400/30 bg-emerald-500/10 text-emerald-200">
            {badgeLabel}
          </Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">{headline}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-emerald-100/80 sm:text-base">
            {subtitle}
          </p>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-5">
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="text-emerald-200">
                  {isRegenerateMode ? `${resolvedDayName} ilerlemesi` : "İlerleme"}
                </span>
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
                  {isRegenerateMode ? (
                    <>
                      {getFocusJobStatusLabel(focusJob)}
                      {status.brandName ? ` • ${status.brandName}` : ""}
                      {showSlowHint &&
                      focusJob &&
                      !["ready", "failed", "queued"].includes(focusJob.status) ? (
                        <span className="mt-1 block text-amber-200/90">
                          Uzun sürüyorsa sayfayı yenileyin — üretim arka planda devam eder.
                        </span>
                      ) : null}
                    </>
                  ) : (
                    <>
                      {status.ready} / {status.total} görsel hazır
                      {status.inProgress > 0 ? " • 1 görsel üretiliyor" : ""}
                      {status.queued > 0 ? ` • ${status.queued} sırada` : ""}
                    </>
                  )}
                </p>
              ) : null}
            </div>

            {phase === "done" ? (
              <div className="rounded-[28px] border border-emerald-400/30 bg-emerald-500/10 p-5">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                  <p className="font-semibold">
                    {isRegenerateMode
                      ? `${resolvedDayName} görseli hazır!`
                      : "Üretim tamamlandı!"}
                  </p>
                </div>
                {isRegenerateMode && focusJobId && previewImages[focusJobId] ? (
                  <div className="mt-4 overflow-hidden rounded-2xl border border-emerald-400/30">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewImages[focusJobId]}
                      alt={resolvedDayName}
                      className="aspect-square w-full object-cover"
                    />
                  </div>
                ) : null}
              </div>
            ) : phase === "failed" ? (
              <div className="rounded-[28px] border border-red-400/30 bg-red-500/10 p-5">
                <p className="font-semibold text-red-100">Görsel üretilemedi</p>
                {focusJob?.error_message ? (
                  <p className="mt-2 text-sm leading-6 text-red-100/90">{focusJob.error_message}</p>
                ) : null}
                <p className="mt-2 text-sm text-red-100/80">
                  Tekrar denemek için profile dönüp &quot;Yeniden üret&quot; butonunu kullanın.
                </p>
              </div>
            ) : phase === "stopped" ? (
              <div className="rounded-[28px] border border-amber-400/30 bg-amber-500/10 p-5">
                <div className="flex items-center gap-3">
                  <Octagon className="h-5 w-5 text-amber-300" />
                  <p className="font-semibold">Üretim durduruldu</p>
                </div>
                <p className="mt-2 text-sm text-amber-100/80">
                  {status?.ready ?? 0} görsel hazır. Kalan sıradaki görseller iptal edildi.
                </p>
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
                    {messages[messageIndex]}
                  </p>
                </motion.div>
              </AnimatePresence>
            )}

            {!isRegenerateMode && readyJobs.length > 0 ? (
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
                        src={job.url}
                        alt="Hazır post"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {status?.projectId && phase !== "done" && phase !== "stopped" && phase !== "failed" ? (
                <Button
                  variant="outline"
                  className="w-full border-red-400/40 bg-red-500/10 text-red-100 hover:bg-red-500/20 sm:w-auto"
                  onClick={() => void stopGeneration()}
                  disabled={stopping || !status.projectId}
                >
                  {stopping ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Octagon className="mr-2 h-4 w-4" />
                  )}
                  Üretimi durdur
                </Button>
              ) : null}

              {status?.projectId ? (
                <Link
                  href={`/projects/${status.projectId}`}
                  className="inline-flex h-11 w-full items-center justify-center rounded-full bg-emerald-50 px-5 text-sm font-semibold text-emerald-700 sm:w-auto"
                >
                  Profilde gör
                </Link>
              ) : (
                <Link
                  href="/dashboard"
                  className="inline-flex h-11 items-center justify-center rounded-full bg-emerald-50 px-5 text-sm font-semibold text-emerald-700"
                >
                  Panele git
                </Link>
              )}
            </div>
          </div>

          <WorkshopStage
            activeIndex={messageIndex}
            readyCount={
              isRegenerateMode
                ? focusJob?.status === "ready"
                  ? 1
                  : 0
                : (status?.ready ?? 0)
            }
            focusDayName={isRegenerateMode ? resolvedDayName : undefined}
            focusImageUrl={
              isRegenerateMode && focusJobId ? previewImages[focusJobId] : undefined
            }
          />
        </div>
      </div>
    </div>
  );
}

function WorkshopStage({
  activeIndex,
  readyCount,
  focusDayName,
  focusImageUrl,
}: {
  activeIndex: number;
  readyCount: number;
  focusDayName?: string;
  focusImageUrl?: string | null;
}) {
  const isFocused = Boolean(focusDayName);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px]">
      <motion.div
        className="absolute inset-0 rounded-[40px] border border-emerald-400/20 bg-white/[0.03] backdrop-blur"
        animate={{ rotate: [0, 1.5, 0, -1.5, 0] }}
        transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full bg-gradient-to-br from-emerald-400 to-lime-300 shadow-[0_0_60px_rgba(52,211,153,0.45)]"
        animate={{ scale: isFocused || activeIndex === 3 ? [1, 1.12, 1] : [1, 1.04, 1] }}
        transition={{ duration: 1.4, repeat: Number.POSITIVE_INFINITY }}
      >
        {focusImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={focusImageUrl} alt={focusDayName} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-sm font-bold text-emerald-950">
            <span>{isFocused ? "AI" : "AI"}</span>
            {readyCount > 0 ? (
              <span className="mt-1 text-[10px] font-semibold">{readyCount} hazır</span>
            ) : isFocused ? (
              <span className="mt-1 max-w-[72px] text-center text-[9px] font-semibold leading-tight">
                {focusDayName}
              </span>
            ) : null}
          </div>
        )}
      </motion.div>
      {(isFocused ? [focusDayName!] : floatingPosts).map((label, postIndex) => {
        const angle = isFocused
          ? -Math.PI / 2
          : (postIndex / floatingPosts.length) * Math.PI * 2;
        const radius = isFocused ? 0 : 150;
        return (
          <motion.div
            key={label}
            className="absolute left-1/2 top-1/2 w-28 -translate-x-1/2 -translate-y-1/2"
            animate={{
              x: Math.cos(angle + (isFocused ? 0 : activeIndex * 0.4)) * radius,
              y: Math.sin(angle + (isFocused ? 0 : activeIndex * 0.4)) * radius,
              scale: isFocused ? [1, 1.05, 1] : 1,
            }}
            transition={{
              duration: isFocused ? 1.6 : 3 + postIndex * 0.2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <div
              className={cn(
                "rounded-2xl border p-3 text-center text-xs font-medium shadow-lg backdrop-blur",
                isFocused
                  ? "border-emerald-300/50 bg-emerald-400/20 text-emerald-50"
                  : "border-emerald-300/30 bg-[#0f2f22]/90",
              )}
            >
              {label}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
