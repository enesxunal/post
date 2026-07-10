import { Check, CreditCard, Download, RefreshCcw, Sparkles, Zap } from "lucide-react";

import { ShowcasePostImage } from "@/components/marketing/showcase-post-image";
import { heroShowcase } from "@/lib/marketing-showcase";
import type { HowToStep } from "@/lib/marketing-guide";
import { cn } from "@/lib/utils";

export function GuideMockup({ variant }: { variant: HowToStep["mockup"] }) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50 shadow-inner">
      <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-2.5">
        <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        <span className="ml-2 text-[10px] font-medium uppercase tracking-wider text-slate-400">
          poust.app
        </span>
      </div>

      <div className="p-4 sm:p-5">
        {variant === "mode" && <ModeMockup />}
        {variant === "brand" && <BrandMockup />}
        {variant === "days" && <DaysMockup />}
        {variant === "payment" && <PaymentMockup />}
        {variant === "generate" && <GenerateMockup />}
        {variant === "revise" && <ReviseMockup />}
      </div>
    </div>
  );
}

function ModeMockup() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {[
        { icon: Zap, title: "Hızlı Başla", tone: "border-emerald-200 bg-emerald-50", active: true },
        {
          icon: Sparkles,
          title: "Detaylı Kurulum",
          tone: "border-violet-200 bg-violet-50",
          active: false,
        },
      ].map(({ icon: Icon, title, tone, active }) => (
        <div
          key={title}
          className={cn(
            "rounded-2xl border p-4 transition",
            tone,
            active && "ring-2 ring-emerald-400 ring-offset-2",
          )}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm">
            <Icon className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-900">{title}</p>
          <p className="mt-1 text-xs text-slate-500">~2 dakika</p>
        </div>
      ))}
    </div>
  );
}

function BrandMockup() {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
        <p className="text-[10px] font-medium text-slate-400">İşletme adı</p>
        <p className="text-sm font-semibold text-slate-900">Örnek Kafe</p>
      </div>
      <div className="flex gap-2">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50 text-[10px] font-medium text-emerald-700">
          Logo
        </div>
        <div className="flex-1 rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-[10px] font-medium text-slate-400">Sektör</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {["Kafe", "Güzellik", "Emlak"].map((item, i) => (
              <span
                key={item}
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-medium",
                  i === 0
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-600",
                )}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        {["#16A34A", "#DC2626", "#0EA5E9"].map((color, i) => (
          <div
            key={color}
            className={cn(
              "h-8 w-8 rounded-full border-2",
              i === 0 ? "border-emerald-500 ring-2 ring-emerald-200" : "border-white",
            )}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
    </div>
  );
}

function DaysMockup() {
  const days = ["29 Ekim", "Ramazan", "Cuma", "Anneler Günü", "Yılbaşı", "Kandil"];
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>30 / 30 gün seçili</span>
        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700">Kare format</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {days.map((day) => (
          <div
            key={day}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-white px-2 py-2"
          >
            <Check className="h-3 w-3 shrink-0 text-emerald-600" />
            <span className="truncate text-[10px] font-medium text-slate-700">{day}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PaymentMockup() {
  return (
    <div className="mx-auto max-w-xs space-y-3">
      <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-4 text-white">
        <p className="text-[10px] uppercase tracking-wider text-white/70">Ana paket</p>
        <p className="mt-1 text-2xl font-bold">299₺</p>
        <p className="text-xs text-white/80">Tek ödeme • Abonelik yok</p>
      </div>
      <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white py-3 text-sm font-medium text-emerald-700">
        <CreditCard className="h-4 w-4" />
        Güvenli ödeme
      </div>
    </div>
  );
}

function GenerateMockup() {
  const post = heroShowcase[0];
  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_1.1fr]">
      <div className="grid grid-cols-2 gap-2">
        <div className="overflow-hidden rounded-xl opacity-60">
          <ShowcasePostImage post={post} size="sm" />
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white p-2 text-center">
          <p className="text-[10px] font-medium text-slate-400">Boş</p>
          <p className="mt-1 text-[10px] text-slate-500">Ramazan</p>
        </div>
        <div className="overflow-hidden rounded-xl opacity-40">
          <ShowcasePostImage post={heroShowcase[1]} size="sm" />
        </div>
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white p-2 text-center">
          <p className="text-[10px] font-medium text-slate-400">Boş</p>
        </div>
      </div>
      <div className="rounded-2xl border border-emerald-200 bg-white p-4">
        <p className="text-xs font-semibold text-slate-900">29 Ekim</p>
        <p className="mt-1 text-[10px] text-slate-500">Henüz üretilmedi</p>
        <div className="mt-3 rounded-xl bg-emerald-600 py-2 text-center text-xs font-semibold text-white shadow-md shadow-emerald-500/30">
          Üret
        </div>
        <p className="mt-2 text-[10px] leading-4 text-slate-500">
          Her kartı tek tek üretin — kontrol sizde.
        </p>
      </div>
    </div>
  );
}

function ReviseMockup() {
  const post = heroShowcase[2];
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="overflow-hidden rounded-xl ring-2 ring-emerald-400 ring-offset-2">
        <ShowcasePostImage post={post} size="md" />
      </div>
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2 text-xs font-semibold text-white">
            <Check className="h-3.5 w-3.5" />
            Onayla
          </div>
          <div className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2 text-xs font-medium text-slate-700">
            <Download className="h-3.5 w-3.5" />
            İndir
          </div>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800">
            <RefreshCcw className="h-3.5 w-3.5" />
            Revize notu
          </div>
          <p className="mt-2 text-[10px] leading-4 text-amber-900/80">
            Daha sıcak ışık ve daha az dekor istiyorum.
          </p>
        </div>
      </div>
    </div>
  );
}
