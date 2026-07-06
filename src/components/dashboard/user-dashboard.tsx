"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarPlus2,
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
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const statusMap = {
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
  dayName: string;
  dateLabel: string;
  status: string;
  imageIndex: number;
  caption: string | null;
  gradient: string;
};

type UserDashboardProps = {
  user: DashboardProfile;
  project: DashboardProject | null;
  jobs: DashboardJob[];
  emptyMessage?: string;
};

export function UserDashboard({
  user: profile,
  project,
  jobs,
  emptyMessage,
}: UserDashboardProps) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [tab, setTab] = useState<DashboardTab>("gallery");
  const [selectedJobId, setSelectedJobId] = useState(jobs[0]?.id);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const selectedJob = jobs.find((job) => job.id === selectedJobId) ?? jobs[0];
  const remainingCredits = project?.remainingCredits ?? 0;

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
            </div>
          </Card>

          <Card className="p-2">
            <NavItem
              active={tab === "gallery"}
              icon={<LayoutGrid className="h-4 w-4" />}
              label="Görsellerim"
              onClick={() => setTab("gallery")}
            />
            <NavItem
              active={tab === "profile"}
              icon={<UserRound className="h-4 w-4" />}
              label="Profilim"
              onClick={() => setTab("profile")}
            />
            <NavItem
              active={tab === "package"}
              icon={<Settings className="h-4 w-4" />}
              label="Paketim"
              onClick={() => setTab("package")}
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
                    Hazır görselleri indirin, caption görüntüleyin veya yeniden üretin.
                  </p>
                </div>
                {jobs.length > 0 ? (
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Tümünü ZIP indir
                  </Button>
                ) : null}
              </div>

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
                            "overflow-hidden rounded-[24px] border bg-white text-left transition hover:-translate-y-0.5",
                            selectedJobId === job.id
                              ? "border-emerald-400 ring-2 ring-emerald-200"
                              : "border-emerald-100",
                          )}
                        >
                          <div className="relative aspect-square">
                            <div
                              className={cn(
                                "absolute inset-0 bg-gradient-to-br",
                                job.gradient,
                              )}
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
                        </button>
                      );
                    })}
                  </div>

                  {selectedJob ? (
                    <Card className="h-fit space-y-4 p-5 lg:sticky lg:top-6">
                      <p className="text-sm font-medium text-slate-500">Seçili post</p>
                      <div
                        className={cn(
                          "relative aspect-square overflow-hidden rounded-[24px] bg-gradient-to-br",
                          selectedJob.gradient,
                        )}
                      />
                      <div>
                        <h2 className="text-xl font-semibold text-slate-950">
                          {selectedJob.dayName}
                        </h2>
                        <p className="text-sm text-slate-500">{selectedJob.dateLabel}</p>
                      </div>
                      {selectedJob.caption ? (
                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
                          <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                            Caption
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-700">
                            {selectedJob.caption}
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500">Caption henüz hazır değil.</p>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" className="w-full">
                          <Download className="mr-2 h-4 w-4" />
                          İndir
                        </Button>
                        <Button variant="outline" className="w-full">
                          <RefreshCcw className="mr-2 h-4 w-4" />
                          Yeniden üret
                        </Button>
                      </div>
                      <Button variant="secondary" className="w-full">
                        <CalendarPlus2 className="mr-2 h-4 w-4" />
                        Takvime ekle
                      </Button>
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
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoField
                  label="Ad Soyad"
                  value={`${profile.firstName} ${profile.lastName}`.trim()}
                />
                <InfoField label="E-posta" value={profile.email} />
                <InfoField label="İşletme adı" value={profile.businessName} />
                <InfoField label="Sektör" value={profile.sector} />
                <InfoField label="Görsel stil" value={profile.visualStyle} />
                <InfoField label="Üyelik" value={profile.memberSince} />
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
                    profile.addons.map((addon) => <Badge key={addon}>{addon}</Badge>)
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
  return (
    <div className="rounded-2xl border border-emerald-100 bg-white px-4 py-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
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
