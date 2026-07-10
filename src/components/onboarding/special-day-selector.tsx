"use client";

import { useMemo, useState } from "react";
import { Minus, Plus, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  SPECIAL_DAY_CATEGORY_LABELS,
  SPECIAL_DAY_CATEGORY_ORDER,
  buildAutoSelectedDays,
  specialDaysCatalog,
} from "@/lib/special-days-data";
import {
  countSelectedSlots,
  formatSelectedDayLabel,
  getSelectedEntry,
  isFridayDay,
  setDayQuantity,
  toggleDayEntry,
} from "@/lib/selected-days";
import { MAX_FRIDAY_POST_COUNT, MAX_SELECTED_DAYS } from "@/lib/config";
import { cn } from "@/lib/utils";
import type { SectorKey, SpecialDayCategory, SelectedDayEntry } from "@/types/domain";

interface SpecialDaySelectorProps {
  selectedDays: SelectedDayEntry[];
  onChange: (entries: SelectedDayEntry[]) => void;
  sector?: SectorKey;
  /** Varsayılan: buildAutoSelectedDays — hızlı kurulumda buildQuickPackageDays verilebilir */
  buildAutoComplete?: (sector?: SectorKey, max?: number) => SelectedDayEntry[];
  autoCompleteLabel?: string;
}

export function SpecialDaySelector({
  selectedDays,
  onChange,
  sector,
  buildAutoComplete = buildAutoSelectedDays,
  autoCompleteLabel = "Otomatik tamamla",
}: SpecialDaySelectorProps) {
  const [activeCategory, setActiveCategory] = useState<SpecialDayCategory | "all">("all");

  const usedSlots = countSelectedSlots(selectedDays);
  const remaining = MAX_SELECTED_DAYS - usedSlots;
  const isComplete = usedSlots === MAX_SELECTED_DAYS;

  const visibleDays = useMemo(() => {
    if (activeCategory === "all") return specialDaysCatalog;
    return specialDaysCatalog.filter((day) => day.category === activeCategory);
  }, [activeCategory]);

  function handleAutoComplete() {
    onChange(buildAutoComplete(sector, MAX_SELECTED_DAYS));
  }

  return (
    <div className="space-y-5">
      <div
        className={cn(
          "rounded-[24px] border p-4",
          isComplete ? "border-emerald-300 bg-emerald-50" : "border-amber-200 bg-amber-50",
        )}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p
              className={cn(
                "text-sm font-semibold",
                isComplete ? "text-emerald-700" : "text-amber-800",
              )}
            >
              {usedSlots} / {MAX_SELECTED_DAYS} post hakkı kullanıldı
            </p>
            <p className="mt-1 text-xs text-slate-600">
              {isComplete
                ? "Harika! Paket özeti adımına geçebilirsiniz."
                : `Devam etmek için ${remaining} post hakkı daha seçmelisiniz.`}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Hayırlı Cumalar için 1 ile {MAX_FRIDAY_POST_COUNT} arasında istediğiniz adedi seçebilirsiniz.
            </p>
          </div>
          <Button type="button" variant="secondary" onClick={handleAutoComplete}>
            <Sparkles className="mr-2 h-4 w-4" />
            {autoCompleteLabel}
          </Button>
        </div>
      </div>

      {selectedDays.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedDays.map((entry, index) => (
            <Badge key={`${entry.dayId}-${index}`} className="gap-1">
              <span className="font-semibold">{index + 1}.</span>
              {formatSelectedDayLabel(entry)}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1">
        <CategoryTab
          active={activeCategory === "all"}
          label="Tümü"
          count={specialDaysCatalog.length}
          onClick={() => setActiveCategory("all")}
        />
        {SPECIAL_DAY_CATEGORY_ORDER.map((category) => {
          const count = specialDaysCatalog.filter((day) => day.category === category).length;
          return (
            <CategoryTab
              key={category}
              active={activeCategory === category}
              label={SPECIAL_DAY_CATEGORY_LABELS[category]}
              count={count}
              onClick={() => setActiveCategory(category)}
            />
          );
        })}
      </div>

      <div className="grid max-h-[460px] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
        {visibleDays.map((day) => {
          const entry = getSelectedEntry(selectedDays, day.id);
          const isSelected = Boolean(entry);
          const order = selectedDays.findIndex((item) => item.dayId === day.id) + 1;
          const isFriday = isFridayDay(day.id);

          return (
            <div
              key={day.id}
              className={cn(
                "rounded-[20px] border p-4 transition",
                isSelected
                  ? "border-emerald-400 bg-emerald-50"
                  : "border-emerald-100 bg-white",
              )}
            >
              <button
                type="button"
                onClick={() => onChange(toggleDayEntry(selectedDays, day.id))}
                disabled={!isSelected && usedSlots >= MAX_SELECTED_DAYS}
                className="w-full text-left disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-slate-900">{day.name}</p>
                      {day.isDefaultSelected && (
                        <Badge className="border-slate-200 bg-slate-100 text-slate-600">
                          Önerilen
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">
                      {day.culturalContext}
                    </p>
                  </div>
                  {isSelected ? (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-sm font-semibold text-white">
                      {order}
                    </div>
                  ) : (
                    <div className="h-8 w-8 shrink-0 rounded-full border border-emerald-100" />
                  )}
                </div>
              </button>

              {isSelected && isFriday && entry && (
                <div className="mt-4 rounded-2xl border border-emerald-200 bg-white p-3">
                  <p className="text-xs font-medium text-slate-700">Kaç adet cuma postu?</p>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 w-9 rounded-full p-0"
                      disabled={entry.quantity <= 1}
                      onClick={() =>
                        onChange(setDayQuantity(selectedDays, day.id, entry.quantity - 1))
                      }
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-lg font-semibold text-slate-900">{entry.quantity}</span>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 w-9 rounded-full p-0"
                      disabled={
                        entry.quantity >= MAX_FRIDAY_POST_COUNT || usedSlots >= MAX_SELECTED_DAYS
                      }
                      onClick={() =>
                        onChange(setDayQuantity(selectedDays, day.id, entry.quantity + 1))
                      }
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {Array.from({ length: MAX_FRIDAY_POST_COUNT }).map((_, index) => {
                      const qty = index + 1;
                      const disabled =
                        qty > entry.quantity &&
                        usedSlots + (qty - entry.quantity) > MAX_SELECTED_DAYS;

                      return (
                        <button
                          key={qty}
                          type="button"
                          disabled={disabled}
                          onClick={() => onChange(setDayQuantity(selectedDays, day.id, qty))}
                          className={cn(
                            "rounded-full border px-3 py-1 text-sm transition disabled:opacity-40",
                            entry.quantity === qty
                              ? "border-emerald-500 bg-emerald-500 text-white"
                              : "border-emerald-100 bg-emerald-50 text-emerald-700",
                          )}
                        >
                          {qty} adet
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CategoryTab({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-3 py-2 text-sm transition",
        active
          ? "border-emerald-400 bg-emerald-500 text-white"
          : "border-emerald-100 bg-white text-slate-600 hover:bg-emerald-50",
      )}
    >
      {label} ({count})
    </button>
  );
}
