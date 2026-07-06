import { CalendarPlus2, Download, RefreshCcw, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { dashboardMock } from "@/lib/mock-data";

const statusMap = {
  queued: "Sırada",
  generating: "Üretiliyor",
  ready: "Hazır",
  failed: "Hata",
};

export function ProjectGallery() {
  const { project, jobs } = dashboardMock;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Badge>Dashboard</Badge>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              {project.brandName} galeri paneli
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
              Postlarınız, caption ve story varyasyonları ile burada listelenir. Arka plan üretim ve ZIP indirme mimarisi bu iskelette hazır bırakıldı.
            </p>
          </div>
          <Card className="flex items-center gap-4 p-4">
            <Sparkles className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-sm text-slate-500">Kalan revizyon kredisi</p>
              <p className="text-xl font-semibold text-slate-950">{project.remainingCredits}</p>
            </div>
          </Card>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {jobs.map((job) => (
            <Card key={job.id} className="p-5">
              <div className="rounded-[24px] bg-gradient-to-br from-emerald-500 to-emerald-700 p-5 text-white">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.2em]">{job.dateLabel}</span>
                  <Badge className="border-white/20 bg-white/10 text-white">
                    {statusMap[job.status as keyof typeof statusMap]}
                  </Badge>
                </div>
                <div className="mt-14">
                  <p className="text-xs text-emerald-50/80">Thumbnail</p>
                  <p className="mt-2 text-2xl font-semibold">{job.thumbnailLabel}</p>
                </div>
              </div>

              <div className="mt-4">
                <h2 className="text-lg font-semibold text-slate-950">{job.dayName}</h2>
                <p className="mt-1 text-sm text-slate-500">{job.dateLabel}</p>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <Button variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  İndir
                </Button>
                <Button variant="outline" className="w-full">
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Yeniden üret
                </Button>
                <Button variant="ghost" className="w-full">
                  Caption
                </Button>
                <Button variant="ghost" className="w-full">
                  {job.hasStory ? "Story indir" : "Story yok"}
                </Button>
              </div>

              <Button variant="secondary" className="mt-3 w-full">
                <CalendarPlus2 className="mr-2 h-4 w-4" />
                Takvime ekle
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
