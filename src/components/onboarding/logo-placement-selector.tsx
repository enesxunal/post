"use client";

import type { LogoAnalysis } from "@/lib/ai/logo-analysis";
import { cn } from "@/lib/utils";

const OPTIONS: Array<{
  value: LogoAnalysis["bestPlacement"];
  label: string;
  hint: string;
}> = [
  { value: "bottom-right", label: "Sağ alt", hint: "Önerilen — kurumsal ve temiz" },
  { value: "bottom-center", label: "Alt orta", hint: "Poster hissi" },
  { value: "top-right", label: "Sağ üst", hint: "Klasik sosyal medya" },
  { value: "top-left", label: "Sol üst", hint: "Alternatif köşe" },
];

type LogoPlacementSelectorProps = {
  value: LogoAnalysis["bestPlacement"];
  onChange: (value: LogoAnalysis["bestPlacement"]) => void;
};

export function LogoPlacementSelector({ value, onChange }: LogoPlacementSelectorProps) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-2xl border px-4 py-3 text-left transition",
            value === option.value
              ? "border-emerald-400 bg-emerald-50"
              : "border-emerald-100 bg-white hover:border-emerald-200",
          )}
        >
          <p className="text-sm font-medium text-slate-900">{option.label}</p>
          <p className="mt-1 text-xs text-slate-500">{option.hint}</p>
        </button>
      ))}
    </div>
  );
}
