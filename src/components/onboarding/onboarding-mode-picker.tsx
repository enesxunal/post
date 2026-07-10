"use client";

import { Zap, SlidersHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { OnboardingFormMode } from "@/lib/onboarding/draft";

type OnboardingModePickerProps = {
  onSelect: (mode: OnboardingFormMode) => void;
};

export function OnboardingModePicker({ onSelect }: OnboardingModePickerProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_36%),linear-gradient(180deg,_#f8fffa_0%,_#ffffff_100%)] px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl text-center">
        <Badge className="bg-emerald-100 text-emerald-800">Kurulum</Badge>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          Nasıl başlamak istersiniz?
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
          Hızlı modda birkaç bilgiyle standart kalitede 30 postluk paket alırsınız. Detaylı modda
          özel gün metinlerini ve stil yönlendirmelerini kendiniz yazabilirsiniz.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <button type="button" onClick={() => onSelect("basic")} className="text-left">
            <Card className="h-full border-emerald-200 p-6 transition hover:border-emerald-400 hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <Zap className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-slate-950">Hızlı Başla</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                İşletme adı, sektör, renk ve logo — ardından önerilen 30 özel günü onaylayın veya
                değiştirin.
              </p>
              <p className="mt-4 text-xs font-medium text-emerald-700">~2 dakika</p>
            </Card>
          </button>

          <button type="button" onClick={() => onSelect("detailed")} className="text-left">
            <Card className="h-full border-violet-200 p-6 transition hover:border-violet-400 hover:shadow-md">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                <SlidersHorizontal className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-slate-950">Detaylı Kurulum</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Özel günleri tek tek seçin, logo konumunu belirleyin, stil notları ve gün bazlı
                başlık/görsel yönlendirmeleri yazın.
              </p>
              <p className="mt-4 text-xs font-medium text-violet-700">Tam kontrol</p>
            </Card>
          </button>
        </div>
      </div>
    </div>
  );
}
