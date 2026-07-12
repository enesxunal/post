"use client";

import Link from "next/link";
import { startTransition, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarPlus2,
  CheckCircle2,
  ChevronDown,
  Copy,
  Download,
  ImageIcon,
  LayoutGrid,
  LogOut,
  RefreshCcw,
  Settings,
  Sparkles,
  UserRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LazyJobImage } from "@/components/dashboard/lazy-job-image";
import { JobProductionDetails } from "@/components/dashboard/job-production-details";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  buildBulkCalendarInputs,
  buildGoogleCalendarUrl,
  buildShareCaption,
  downloadBulkIcsCalendar,
  downloadIcsFile,
} from "@/lib/share/publish-schedule";
import { buildSharePageUrl } from "@/lib/share/share-page-url";
import { DASHBOARD_POLL_MS } from "@/lib/config";
import { mapJobStatus } from "@/lib/generation/map-jobs";
import { getPostFormatLabel, getPreviewAspectClass } from "@/lib/image-formats";
import type { PostFormat } from "@/types/domain";
import { cn } from "@/lib/utils";

const statusMap = {
  draft: { label: "Boş", className: "bg-white/90 text-slate-600 ring-1 ring-inset ring-slate-200" },
  queued: { label: "Sırada", className: "bg-slate-100 text-slate-600" },
  generating: { label: "Üretiliyor", className: "bg-amber-100 text-amber-700" },
  ready: { label: "Hazır", className: "bg-emerald-100 text-emerald-700" },
  failed: { label: "Hata", className: "bg-red-100 text-red-700" },
};

type DashboardTab = "gallery" | "profile" | "package";

export type DashboardProfile = {
  firstName: string;
  lastName: string;
  email: string;
  businessName: string;
  sector: string;
  visualStyle: string;
  primaryColor: string;
  logoInitial: string;
  packageName: string;
  postsTotal: number;
  postsReady: number;
  postsGenerating: number;
  addons: string[];
  memberSince: string;
};

export type DashboardProject = {
  id: string;
  brandName: string;
  primaryColor: string;
  visualStyle: string;
  remainingCredits: number;
  bonusCreditsGranted: boolean;
};

export type DashboardJob = {
  id: string;
  dayId: string;
  dayName: string;
  dateLabel: string;
  status: string;
  imageIndex: number;
  caption: string | null;
  hashtags?: string[];
  imageUrl?: string | null;
  approvedAt?: string | null;
  storyImageUrl?: string | null;
  storyStatus?: string | null;
  gradient: string;
  errorMessage?: string | null;
};

const addonLabels: Record<string, string> = {
  caption: "Caption paketi",
  story: "Story paketi",
  calendar: "Takvim paketi",
};

type UserDashboardProps = {
  user: DashboardProfile;
  project: DashboardProject | null;
  jobs: DashboardJob[];
  postFormat?: PostFormat;
  hasStoryAddon?: boolean;
  hasCaptionAddon?: boolean;
  hasCalendarAddon?: boolean;
  emptyMessage?: string;
  /** Arka planda üretim devam ediyorsa hafif polling (sayfa yenilemeden) */
  liveGenerating?: boolean;
  /** Takvim linkinden veya /dashboard?job= ile açılan post */
  initialSelectedJobId?: string;
};

export function UserDashboard({
  user: profile,
  project,
  jobs: initialJobs,
  postFormat = "square",
  hasStoryAddon = false,
  hasCaptionAddon = false,
  hasCalendarAddon = false,
  emptyMessage,
  liveGenerating = false,
  initialSelectedJobId,
}: UserDashboardProps) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [jobs, setJobs] = useState(initialJobs);
  const [tab, setTab] = useState<DashboardTab>("gallery");
  const selectTab = (next: DashboardTab) => {
    startTransition(() => setTab(next));
  };
  const [selectedJobId, setSelectedJobId] = useState(
    initialSelectedJobId && initialJobs.some((job) => job.id === initialSelectedJobId)
      ? initialSelectedJobId
      : initialJobs[0]?.id,
  );
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [revisionNote, setRevisionNote] = useState("");
  const [showVisualPrompt, setShowVisualPrompt] = useState(false);
  const [generationNote, setGenerationNote] = useState("");

  useEffect(() => {
    setJobs(initialJobs);
    if (initialSelectedJobId && initialJobs.some((job) => job.id === initialSelectedJobId)) {
      setSelectedJobId(initialSelectedJobId);
      setTab("gallery");
      return;
    }
    setSelectedJobId((current) => current ?? initialJobs[0]?.id);
  }, [initialJobs, initialSelectedJobId]);

  useEffect(() => {
    setRevisionNote("");
    setShowVisualPrompt(false);
    setGenerationNote("");
  }, [selectedJobId]);

  useEffect(() => {
    if (!liveGenerating || !project?.id) return;

    let active = true;

    async function poll() {
      try {
        const response = await fetch(
          `/api/generation/start?projectId=${project!.id}&lightweight=1`,
          { cache: "no-store" },
        );
        if (!response.ok || !active) return;

        const data = (await response.json()) as {
          jobs?: Array<{ id: string; status: string; error_message?: string | null }>;
        };

        setJobs((current) =>
          current.map((job) => {
            const row = data.jobs?.find((item) => item.id === job.id);
            if (!row) return job;
            return {
              ...job,
              status: mapJobStatus(row.status),
              errorMessage: row.error_message ?? job.errorMessage,
            };
          }),
        );
      } catch {
        // Sessizce tekrar dene
      }
    }

    void poll();
    const timer = window.setInterval(() => void poll(), DASHBOARD_POLL_MS);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [liveGenerating, project?.id]);

  const selectedJob = jobs.find((job) => job.id === selectedJobId) ?? jobs[0];
  const remainingCredits = project?.remainingCredits ?? 0;
  const previewAspect = getPreviewAspectClass(postFormat);
  const readyJobs = jobs.filter((job) => job.status === "ready");

  function calendarPayloadForJob(job: DashboardJob) {
    if (!project) return null;
    const sequenceIndex = jobs.findIndex((item) => item.id === job.id);
    const fridayJobs = jobs.filter((item) => item.dayId.includes("friday"));
    const fridayIndex = fridayJobs.findIndex((item) => item.id === job.id);

    return {
      jobId: job.id,
      dayId: job.dayId,
      dayName: job.dayName,
      dateLabel: job.dateLabel,
      brandName: project.brandName,
      caption: job.caption,
      hashtags: job.hashtags,
      shareReady: job.status === "ready" && Boolean(job.approvedAt),
      fridayOccurrence:
        job.dayId.includes("friday") && fridayIndex >= 0 ? fridayIndex : undefined,
      sequenceIndex: sequenceIndex >= 0 ? sequenceIndex : undefined,
    };
  }

  function addBulkCalendar() {
    if (!project || jobs.length === 0) return;
    const inputs = buildBulkCalendarInputs(jobs, project.brandName);
    downloadBulkIcsCalendar(inputs, project.brandName);
  }

  async function handleLogout() {
    if (!supabase) {
      router.push("/login");
      return;
    }

    setIsLoggingOut(true);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  async function copyCaption() {
    if (!selectedJob?.caption) return;
    const tags = selectedJob.hashtags?.length ? `\n\n${selectedJob.hashtags.join(" ")}` : "";
    await navigator.clipboard.writeText(`${selectedJob.caption}${tags}`);
    setCopiedCaption(true);
    window.setTimeout(() => setCopiedCaption(false), 2000);
  }

  async function downloadPostImage() {
    if (!selectedJob || selectedJob.status !== "ready") return;
    const url = selectedJob.imageUrl ?? `/api/generation/job-image?jobId=${selectedJob.id}`;
    if (url.startsWith("/")) {
      const response = await fetch(url);
      const data = (await response.json()) as { imageUrl?: string };
      if (data.imageUrl) {
        window.open(data.imageUrl, "_blank", "noopener,noreferrer");
      }
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function downloadAllPosts() {
    if (!project?.id || readyJobs.length === 0) return;

    setActionLoading("bulk-download");
    try {
      const params = new URLSearchParams({ projectId: project.id });
      if (hasStoryAddon) params.set("includeStory", "1");

      const response = await fetch(`/api/generation/bulk-download?${params.toString()}`);
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        alert(data.error ?? "Toplu indirme başarısız oldu.");
        return;
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = `${project.brandName}-postlar.zip`;
      anchor.click();
      URL.revokeObjectURL(objectUrl);
    } catch {
      alert("Toplu indirme sırasında bir hata oluştu.");
    } finally {
      setActionLoading(null);
    }
  }

  async function prepareShareKit() {
    if (!selectedJob || !project) return;
    const text = buildShareCaption({
      jobId: selectedJob.id,
      dayId: selectedJob.dayId,
      dayName: selectedJob.dayName,
      dateLabel: selectedJob.dateLabel,
      brandName: project.brandName,
      caption: selectedJob.caption,
      hashtags: selectedJob.hashtags,
    });
    await navigator.clipboard.writeText(text);
    await downloadPostImage();
    alert(
      "Paylaşım paketi hazır:\n\n1) Görsel açıldı\n2) Metin panoya kopyalandı\n\nInstagram veya Meta Business Suite'te görseli seçip metni yapıştırın.",
    );
  }

  function addToCalendarIcs() {
    if (!selectedJob || !project) return;
    const payload = calendarPayloadForJob(selectedJob);
    if (!payload) return;
    downloadIcsFile(payload);
  }

  function openGoogleCalendar() {
    if (!selectedJob || !project) return;
    const payload = calendarPayloadForJob(selectedJob);
    if (!payload) return;
    const url = buildGoogleCalendarUrl(payload);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function approvePost() {
    if (!selectedJob) return;
    setActionLoading("approve");
    try {
      const response = await fetch("/api/generation/approve-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: selectedJob.id }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Onay başarısız");
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Onay hatası");
    } finally {
      setActionLoading(null);
    }
  }

  async function generateStory() {
    if (!selectedJob) return;
    setActionLoading("story");
    try {
      const response = await fetch("/api/generation/story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: selectedJob.id }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Story üretilemedi");
      router.refresh();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Story hatası");
    } finally {
      setActionLoading(null);
    }
  }

  const canGenerate =
    Boolean(project && selectedJob && (selectedJob.status === "draft" || selectedJob.status === "failed"));

  const canRevise =
    Boolean(
      project &&
        selectedJob &&
        selectedJob.status === "ready" &&
        !selectedJob.approvedAt &&
        remainingCredits > 0,
    );

  async function generatePost() {
    if (!project || !selectedJob || !canGenerate) return;

    setActionLoading("generate");
    try {
      const response = await fetch("/api/generation/generate-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: selectedJob.id,
          visualNote: generationNote.trim() || undefined,
        }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Üretim başlatılamadı");

      const dayName = encodeURIComponent(selectedJob.dayName);
      router.push(
        `/projects/${project.id}/generating?jobId=${selectedJob.id}&dayName=${dayName}`,
      );
    } catch (error) {
      alert(error instanceof Error ? error.message : "Üretim hatası");
    } finally {
      setActionLoading(null);
    }
  }

  async function regeneratePost() {
    if (!project || !selectedJob || !canRevise) return;

    setActionLoading("regenerate");
    try {
      const response = await fetch("/api/generation/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: selectedJob.id,
          reason: revisionNote.trim() || undefined,
        }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Yeniden üretilemedi");

      const dayName = encodeURIComponent(selectedJob.dayName);
      router.push(
        `/projects/${project.id}/generating?jobId=${selectedJob.id}&dayName=${dayName}`,
      );
    } catch (error) {
      alert(error instanceof Error ? error.message : "Yeniden üretim hatası");
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#f8fffa_0%,_#f1f5f9_100%)]">
      <header className="border-b border-emerald-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-2xl text-lg font-bold text-white"
              style={{ backgroundColor: profile.primaryColor }}
            >
              {profile.logoInitial}
            </div>
            <div>
              <p className="font-semibold text-slate-900">{profile.businessName}</p>
              <p className="text-xs text-slate-500">Üye paneli</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-slate-500 hover:text-slate-700">
              Anasayfa
            </Link>
            <Button
              variant="outline"
              className="h-9 px-4 text-sm"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Çıkış
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[280px_1fr] lg:px-8">
        <aside className="space-y-4">
          <Card className="overflow-hidden p-0">
            <div
              className="h-20"
              style={{
                background: `linear-gradient(135deg, ${profile.primaryColor}, #10B981)`,
              }}
            />
            <div className="relative px-5 pb-5">
              <div
                className="-mt-8 flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-white text-xl font-bold text-white shadow-sm"
                style={{ backgroundColor: profile.primaryColor }}
              >
                {profile.logoInitial}
              </div>
              <h2 className="mt-3 text-lg font-semibold text-slate-950">
                {profile.firstName} {profile.lastName}
              </h2>
              <p className="text-sm text-slate-500">{profile.email}</p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <StatBox label="Hazır" value={String(profile.postsReady)} />
                <StatBox label="Üretim" value={String(profile.postsGenerating)} />
                <StatBox label="Toplam" value={String(profile.postsTotal)} />
              </div>
              <p className="mt-4 text-xs leading-5 text-slate-500">
                Hesap bilgileri aşağıda özet olarak gösterilir. Düzenleme ekranı yakında eklenecek.
              </p>
            </div>
          </Card>

          <Card className="p-2">
            <NavItem
              active={tab === "gallery"}
              icon={<LayoutGrid className="h-4 w-4" />}
              label="Görsellerim"
              onClick={() => selectTab("gallery")}
            />
            <NavItem
              active={tab === "profile"}
              icon={<UserRound className="h-4 w-4" />}
              label="Profilim"
              onClick={() => selectTab("profile")}
            />
            <NavItem
              active={tab === "package"}
              icon={<Settings className="h-4 w-4" />}
              label="Paketim"
              onClick={() => selectTab("package")}
            />
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-xs text-slate-500">Revizyon kredisi</p>
                <p className="text-xl font-semibold text-slate-950">{remainingCredits}</p>
              </div>
            </div>
          </Card>
        </aside>

        <main className="space-y-6">
          {tab === "gallery" && (
            <>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <Badge>Galeri</Badge>
                  <h1 className="mt-2 text-2xl font-semibold text-slate-950 sm:text-3xl">
                    Özel gün postlarınız
                  </h1>
                  <p className="mt-1 text-sm text-slate-600">
                    Kartlara tıklayın, <strong>Üret</strong> ile tek tek görsel oluşturun. Onayladıktan
                    sonra caption ve story hazır olur.
                    <span className="ml-1 text-emerald-700">Format: {getPostFormatLabel(postFormat)}</span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {readyJobs.length > 0 ? (
                    <Button
                      variant="outline"
                      disabled={actionLoading === "bulk-download"}
                      onClick={() => void downloadAllPosts()}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      {actionLoading === "bulk-download"
                        ? "ZIP hazırlanıyor..."
                        : `Toplu indir (${readyJobs.length})`}
                    </Button>
                  ) : null}
                  {hasCalendarAddon && jobs.length > 0 ? (
                    <Button variant="outline" onClick={addBulkCalendar}>
                      <CalendarPlus2 className="mr-2 h-4 w-4" />
                      30 günlük takvimi ekle
                    </Button>
                  ) : null}
                </div>
              </div>

              {hasCalendarAddon && jobs.length > 0 ? (
                <Card className="border-sky-200 bg-sky-50/60 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">poust paylaşım takvimi</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        Seçtiğiniz {jobs.length} özel günün her biri sabah <strong>09:00</strong>&apos;da
                        takviminize &quot;poust paylaşım saati&quot; olarak eklenir. Hatırlatıcıya
                        tıklayınca o günün paylaşım sayfası açılır.
                      </p>
                    </div>
                    <Button onClick={addBulkCalendar}>
                      <CalendarPlus2 className="mr-2 h-4 w-4" />
                      Tüm günleri takvime ekle (.ics)
                    </Button>
                  </div>
                </Card>
              ) : null}

              {jobs.length === 0 ? (
                <Card className="space-y-4 p-8 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-950">
                      Henüz postunuz yok
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {emptyMessage ??
                        "Onboarding akışını tamamlayıp ödeme yaptıktan sonra postlarınız burada görünür."}
                    </p>
                  </div>
                  <Link href="/onboarding">
                    <Button>İlk paketimi oluştur</Button>
                  </Link>
                </Card>
              ) : (
                <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {jobs.map((job) => {
                      const status = statusMap[job.status as keyof typeof statusMap];

                      return (
                        <button
                          key={job.id}
                          type="button"
                          onClick={() => setSelectedJobId(job.id)}
                          className={cn(
                            "group overflow-hidden rounded-[26px] border bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
                            job.status === "draft" && "border-dashed border-slate-200",
                            selectedJobId === job.id
                              ? "border-emerald-400 ring-2 ring-emerald-200"
                              : job.status !== "draft" && "border-emerald-100",
                          )}
                        >
                          <div className={cn("relative overflow-hidden", previewAspect)}>
                            <LazyJobImage
                              jobId={job.id}
                              status={job.status}
                              alt={job.dayName}
                              className="absolute inset-0"
                              gradient={job.gradient}
                              initialUrl={job.imageUrl}
                              lazy={selectedJobId !== job.id}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                            <Badge
                              className={cn("absolute left-3 top-3 border-0", status.className)}
                            >
                              {status.label}
                            </Badge>
                            <div className="absolute bottom-3 left-3 right-3">
                              <p className="text-sm font-semibold text-white">{job.dayName}</p>
                              <p className="text-xs text-white/80">{job.dateLabel}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between px-4 py-3">
                            <p className="text-xs font-medium text-slate-500">
                              {job.status === "ready"
                                ? "Görsel hazır"
                                : job.status === "draft"
                                  ? "Henüz üretilmedi"
                                  : job.status === "failed"
                                    ? "Tekrar deneyin"
                                    : "İşleniyor"}
                            </p>
                            <span className="text-xs text-emerald-700 transition group-hover:translate-x-0.5">
                              İncele
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {selectedJob ? (
                    <Card className="h-fit space-y-4 p-5 lg:sticky lg:top-6">
                      <p className="text-sm font-medium text-slate-500">Seçili post</p>
                      <div className={cn("relative overflow-hidden rounded-[24px]", previewAspect)}>
                        <LazyJobImage
                          jobId={selectedJob.id}
                          status={selectedJob.status}
                          alt={selectedJob.dayName}
                          className="h-full w-full"
                          gradient={selectedJob.gradient}
                          initialUrl={selectedJob.imageUrl}
                          lazy={false}
                        />
                      </div>
                      <div className="space-y-2">
                        <h2 className="text-xl font-semibold text-slate-950">
                          {selectedJob.dayName}
                        </h2>
                        <p className="text-sm text-slate-500">{selectedJob.dateLabel}</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge className={cn("border-0", statusMap[selectedJob.status as keyof typeof statusMap].className)}>
                            {statusMap[selectedJob.status as keyof typeof statusMap].label}
                          </Badge>
                          <Badge className="border border-emerald-200 bg-white text-slate-700">
                            Format: {getPostFormatLabel(postFormat)}
                          </Badge>
                          {selectedJob.approvedAt ? (
                            <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                              Onaylandı
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                      {selectedJob.status === "failed" && selectedJob.errorMessage ? (
                        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                          {selectedJob.errorMessage}
                        </div>
                      ) : null}
                      <JobProductionDetails
                        jobId={selectedJob.id}
                        status={selectedJob.status}
                      />
                      {selectedJob.caption ? (
                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                              Caption
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              className="h-8 px-3 text-xs"
                              onClick={copyCaption}
                            >
                              <Copy className="mr-1.5 h-3.5 w-3.5" />
                              {copiedCaption ? "Kopyalandı" : "Kopyala"}
                            </Button>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-slate-700">
                            {selectedJob.caption}
                          </p>
                          {selectedJob.hashtags?.length ? (
                            <p className="mt-2 text-sm text-emerald-700">
                              {selectedJob.hashtags.join(" ")}
                            </p>
                          ) : null}
                        </div>
                      ) : hasCaptionAddon && !selectedJob.approvedAt ? (
                        <p className="text-sm text-slate-500">
                          Caption paketi aktif — postu onayladıktan sonra üretilecek.
                        </p>
                      ) : (
                        <p className="text-sm text-slate-500">Caption henüz hazır değil.</p>
                      )}

                      {canGenerate ? (
                        <div className="space-y-3">
                          <button
                            type="button"
                            onClick={() => setShowVisualPrompt((open) => !open)}
                            className="flex w-full items-center justify-between rounded-2xl border border-emerald-100 bg-emerald-50/40 px-4 py-3 text-left text-sm font-medium text-slate-800 transition hover:bg-emerald-50"
                          >
                            <span>Görsel tercihi ekle (isteğe bağlı)</span>
                            <ChevronDown
                              className={cn(
                                "h-4 w-4 text-slate-500 transition",
                                showVisualPrompt && "rotate-180",
                              )}
                            />
                          </button>
                          {showVisualPrompt ? (
                            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
                              <label className="block">
                                <span className="text-sm font-medium text-slate-800">
                                  Bu post için nasıl bir görsel istersiniz?
                                </span>
                                <span className="mt-1 block text-xs leading-5 text-slate-500">
                                  Boş bırakırsanız poust markanıza göre üretir. İsterseniz renk,
                                  atmosfer veya obje tercihinizi yazın.
                                </span>
                                <textarea
                                  value={generationNote}
                                  onChange={(event) => setGenerationNote(event.target.value)}
                                  placeholder="Örn: Daha sıcak tonlar, çiçekli arka plan, minimalist ve premium his, yaz sezonu enerjisi…"
                                  className="mt-3 min-h-[110px] w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
                                />
                              </label>
                            </div>
                          ) : null}
                          <Button
                            className="w-full"
                            onClick={generatePost}
                            disabled={actionLoading === "generate"}
                          >
                            <Sparkles
                              className={cn(
                                "mr-2 h-4 w-4",
                                actionLoading === "generate" && "animate-spin",
                              )}
                            />
                            Üret
                          </Button>
                        </div>
                      ) : null}

                      {selectedJob.status === "ready" && !selectedJob.approvedAt ? (
                        <Button
                          className="w-full"
                          onClick={approvePost}
                          disabled={actionLoading === "approve"}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Postu onayla
                        </Button>
                      ) : selectedJob.approvedAt ? (
                        <Badge className="w-fit border-emerald-200 bg-emerald-50 text-emerald-700">
                          Post onaylandı
                        </Badge>
                      ) : null}

                      {hasStoryAddon && selectedJob.approvedAt && selectedJob.storyStatus !== "ready" ? (
                        <div className="space-y-3 rounded-2xl border border-violet-100 bg-violet-50/40 p-4">
                          <p className="text-sm font-medium text-slate-800">Story (1080×1920)</p>
                          <p className="text-xs text-slate-500">
                            Onay sonrası story üretiliyor veya hazırlanıyor…
                          </p>
                          {selectedJob.storyStatus === "failed" ? (
                            <Button
                              variant="secondary"
                              className="w-full"
                              onClick={generateStory}
                              disabled={actionLoading === "story"}
                            >
                              <Sparkles className="mr-2 h-4 w-4" />
                              Story&apos;yi tekrar üret
                            </Button>
                          ) : null}
                        </div>
                      ) : null}

                      {hasStoryAddon && selectedJob.approvedAt && selectedJob.storyStatus === "ready" ? (
                        <div className="space-y-3 rounded-2xl border border-violet-100 bg-violet-50/40 p-4">
                          <p className="text-sm font-medium text-slate-800">Story (1080×1920)</p>
                          <div className="relative aspect-[9/16] max-h-64 overflow-hidden rounded-xl">
                            <LazyJobImage
                              jobId={selectedJob.id}
                              status="ready"
                              alt="Story"
                              className="h-full w-full"
                              story
                              initialUrl={selectedJob.storyImageUrl}
                            />
                          </div>
                        </div>
                      ) : null}

                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          className="w-full"
                          disabled={selectedJob.status !== "ready"}
                          onClick={() => void downloadPostImage()}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          İndir
                        </Button>
                        {canRevise ? (
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={regeneratePost}
                            disabled={actionLoading === "regenerate"}
                          >
                            <RefreshCcw
                              className={cn(
                                "mr-2 h-4 w-4",
                                actionLoading === "regenerate" && "animate-spin",
                              )}
                            />
                            Revizyon ({remainingCredits} hak)
                          </Button>
                        ) : null}
                      </div>
                      {canRevise ? (
                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
                          <label className="block">
                            <span className="text-sm font-medium text-slate-800">
                              Revize notu
                            </span>
                            <span className="mt-1 block text-xs leading-5 text-slate-500">
                              Ne değişmesini istediğinizi yazın. AI yeni üretimde bunu dikkate alır.
                            </span>
                            <textarea
                              value={revisionNote}
                              onChange={(event) => setRevisionNote(event.target.value)}
                              placeholder="Örn: Başlık daha büyük olsun, arka plan daha premium ve mağaza hissi versin, altın tonları azalt."
                              className="mt-3 min-h-[110px] w-full rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 focus:ring-4 focus:ring-emerald-100"
                            />
                          </label>
                        </div>
                      ) : null}
                      {hasCalendarAddon && selectedJob.status === "ready" && selectedJob.approvedAt ? (
                        <div className="space-y-3 rounded-2xl border border-sky-100 bg-sky-50/50 p-4">
                          <p className="text-sm font-semibold text-slate-900">Paylaşım takvimi</p>
                          <p className="text-xs leading-5 text-slate-600">
                            Hatırlatıcıya tıklayınca paylaşım sayfası açılır — görsel indirme ve metin
                            kopyalama tek ekranda.
                          </p>
                          <Button variant="secondary" className="w-full" onClick={() => void prepareShareKit()}>
                            <Copy className="mr-2 h-4 w-4" />
                            Paylaşım paketi (metin + görsel)
                          </Button>
                          <Link
                            href={buildSharePageUrl(selectedJob.id)}
                            className="block rounded-2xl border border-sky-200 bg-white px-4 py-3 text-center text-sm font-medium text-sky-800 hover:bg-sky-50"
                          >
                            Paylaşım sayfasını önizle
                          </Link>
                          <div className="grid grid-cols-2 gap-2">
                            <Button variant="outline" className="w-full" onClick={addToCalendarIcs}>
                              <CalendarPlus2 className="mr-2 h-4 w-4" />
                              .ics indir
                            </Button>
                            <Button variant="outline" className="w-full" onClick={openGoogleCalendar}>
                              Google Takvim
                            </Button>
                          </div>
                          {selectedJob.caption ? (
                            <p className="text-[11px] leading-4 text-slate-500">
                              Önizleme: {buildShareCaption({
                                jobId: selectedJob.id,
                                dayId: selectedJob.dayId,
                                dayName: selectedJob.dayName,
                                dateLabel: selectedJob.dateLabel,
                                brandName: project?.brandName ?? profile.businessName,
                                caption: selectedJob.caption,
                                hashtags: selectedJob.hashtags,
                              }).slice(0, 120)}
                              …
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                    </Card>
                  ) : null}
                </div>
              )}
            </>
          )}

          {tab === "profile" && (
            <Card className="space-y-6 p-6">
              <div>
                <Badge>Profilim</Badge>
                <h1 className="mt-2 text-2xl font-semibold text-slate-950">
                  Hesap ve marka bilgileri
                </h1>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Buradaki bilgiler onboarding ve hesap verilerinizden gelir. Düzenleme alanları
                  yakında eklenecek; şimdilik sadece temiz bir özet gösteriyoruz.
                </p>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-3xl border border-emerald-100 bg-white p-5">
                  <p className="text-sm font-semibold text-slate-900">Hesap özeti</p>
                  <div className="mt-4 grid gap-3">
                    <InfoField
                      label="Ad Soyad"
                      value={`${profile.firstName} ${profile.lastName}`.trim()}
                    />
                    <InfoField label="E-posta" value={profile.email} />
                    <InfoField label="Üyelik başlangıcı" value={profile.memberSince} />
                  </div>
                </div>
                <div className="rounded-3xl border border-emerald-100 bg-white p-5">
                  <p className="text-sm font-semibold text-slate-900">Marka özeti</p>
                  <div className="mt-4 grid gap-3">
                    <InfoField label="İşletme adı" value={profile.businessName} />
                    <InfoField label="Sektör" value={profile.sector} />
                    <InfoField label="Görsel stil" value={profile.visualStyle} />
                    <InfoField label="Paket" value={profile.packageName} />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 p-4">
                <span
                  className="h-10 w-10 rounded-xl"
                  style={{ backgroundColor: profile.primaryColor }}
                />
                <div>
                  <p className="text-sm font-medium text-slate-800">Ana marka rengi</p>
                  <p className="text-sm text-slate-500">{profile.primaryColor}</p>
                </div>
              </div>
            </Card>
          )}

          {tab === "package" && (
            <Card className="space-y-6 p-6">
              <div>
                <Badge>Paketim</Badge>
                <h1 className="mt-2 text-2xl font-semibold text-slate-950">
                  {profile.packageName}
                </h1>
                <p className="mt-1 text-sm text-slate-600">Tek ödeme • 30 özel gün postu</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <PackageStat label="Toplam post" value={String(profile.postsTotal)} />
                <PackageStat label="Hazır" value={String(profile.postsReady)} />
                <PackageStat label="Kredi" value={String(remainingCredits)} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">Ek paketler</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {profile.addons.length > 0 ? (
                    profile.addons.map((addon) => (
                      <Badge key={addon}>{addonLabels[addon] ?? addon}</Badge>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">Henüz ek paket yok.</p>
                  )}
                </div>
              </div>
              <Link href="/onboarding">
                <Button variant="outline" className="w-fit">
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Yeni proje başlat
                </Button>
              </Link>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-emerald-50 px-2 py-3">
      <p className="text-lg font-semibold text-slate-950">{value}</p>
      <p className="text-[11px] text-slate-500">{label}</p>
    </div>
  );
}

function NavItem({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
        active ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  const resolved = value?.trim() ? value : "Henüz belirtilmedi";
  return (
    <div className="rounded-2xl border border-emerald-100 bg-white px-4 py-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-900">{resolved}</p>
    </div>
  );
}

function PackageStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
      <p className="text-2xl font-semibold text-slate-950">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}
