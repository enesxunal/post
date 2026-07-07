"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { DayCustomization } from "@/lib/onboarding/draft";
import { getSpecialDayById } from "@/lib/special-days-data";
import type { SelectedDayEntry } from "@/types/domain";
import { cn } from "@/lib/utils";

type DayCustomizationPanelProps = {
  selectedDays: SelectedDayEntry[];
  customizations: Record<string, DayCustomization>;
  onChange: (value: Record<string, DayCustomization>) => void;
};

export function DayCustomizationPanel({
  selectedDays,
  customizations,
  onChange,
}: DayCustomizationPanelProps) {
  const [openDayId, setOpenDayId] = useState<string | null>(null);

  function updateDay(dayId: string, patch: Partial<DayCustomization>) {
    onChange({
      ...customizations,
      [dayId]: { ...customizations[dayId], ...patch },
    });
  }

  if (selectedDays.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 rounded-[24px] border border-violet-100 bg-violet-50/40 p-4">
      <div>
        <p className="text-sm font-semibold text-slate-900">Gün bazlı özelleştirme (isteğe bağlı)</p>
        <p className="mt-1 text-xs text-slate-600">
          İstediğiniz güne özel başlık, görsel yön veya caption notu yazabilirsiniz. Boş bırakırsanız
          sistem otomatik seçer.
        </p>
      </div>

      <div className="space-y-2">
        {selectedDays.map((entry) => {
          const day = getSpecialDayById(entry.dayId);
          const custom = customizations[entry.dayId];
          const isOpen = openDayId === entry.dayId;
          const hasCustom = Boolean(
            custom?.headline || custom?.visualDirection || custom?.captionNote,
          );

          return (
            <div key={entry.dayId} className="rounded-2xl border border-white bg-white">
              <button
                type="button"
                onClick={() => setOpenDayId(isOpen ? null : entry.dayId)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">{day?.name ?? entry.dayId}</p>
                  {hasCustom ? (
                    <p className="text-xs text-violet-700">Özel ayar eklendi</p>
                  ) : (
                    <p className="text-xs text-slate-500">Varsayılan</p>
                  )}
                </div>
                <ChevronDown className={cn("h-4 w-4 text-slate-400 transition", isOpen && "rotate-180")} />
              </button>

              {isOpen ? (
                <div className="space-y-3 border-t border-slate-100 px-4 py-3">
                  <Field label="Özel başlık">
                    <Input
                      placeholder={day?.headlineAlternatives[0] ?? "Örn: Hayırlı Cumalar"}
                      value={custom?.headline ?? ""}
                      onChange={(event) => updateDay(entry.dayId, { headline: event.target.value })}
                    />
                  </Field>
                  <Field label="Görsel yön notu">
                    <Textarea
                      placeholder="Örn: Sıcak sabah ışığı, minimal cami silüeti"
                      value={custom?.visualDirection ?? ""}
                      onChange={(event) =>
                        updateDay(entry.dayId, { visualDirection: event.target.value })
                      }
                    />
                  </Field>
                  <Field label="Caption tonu">
                    <Input
                      placeholder="Örn: Samimi ve sıcak"
                      value={custom?.captionNote ?? ""}
                      onChange={(event) => updateDay(entry.dayId, { captionNote: event.target.value })}
                    />
                  </Field>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}
