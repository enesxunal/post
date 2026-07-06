"use client";

import { useState } from "react";
import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BRAND_COLOR_PALETTE, MAX_BRAND_COLORS } from "@/lib/config";
import { cn } from "@/lib/utils";

const HEX_PATTERN = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

function normalizeHex(value: string) {
  const trimmed = value.trim();
  const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  return withHash.toUpperCase();
}

function isValidHex(value: string) {
  return HEX_PATTERN.test(normalizeHex(value));
}

interface BrandColorSelectorProps {
  value: string[];
  onChange: (colors: string[]) => void;
}

export function BrandColorSelector({ value, onChange }: BrandColorSelectorProps) {
  const [customInput, setCustomInput] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);

  function addColor(raw: string) {
    const color = normalizeHex(raw);

    if (!isValidHex(color)) {
      setInputError("Geçerli bir renk kodu girin. Örn: #16A34A");
      return;
    }

    if (value.includes(color)) {
      setInputError("Bu renk zaten listede.");
      return;
    }

    if (value.length >= MAX_BRAND_COLORS) {
      setInputError(`En fazla ${MAX_BRAND_COLORS} renk seçebilirsiniz.`);
      return;
    }

    onChange([...value, color]);
    setCustomInput("");
    setInputError(null);
  }

  function removeColor(index: number) {
    onChange(value.filter((_, i) => i !== index));
    setInputError(null);
  }

  function togglePaletteColor(color: string) {
    const index = value.indexOf(color);
    if (index >= 0) {
      removeColor(index);
      return;
    }
    addColor(color);
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: MAX_BRAND_COLORS }).map((_, index) => {
          const color = value[index];
          const label = `${index + 1}. Renk`;

          return (
            <div
              key={label}
              className={cn(
                "rounded-[24px] border p-4 transition",
                color ? "border-emerald-300 bg-emerald-50/50" : "border-dashed border-emerald-100 bg-white",
              )}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                {label}
              </p>
              {color ? (
                <div className="mt-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-10 w-10 rounded-2xl border border-white shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-sm font-medium text-slate-800">{color}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeColor(index)}
                    className="rounded-full p-1 text-slate-400 hover:bg-white hover:text-slate-600"
                    aria-label={`${label} kaldır`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-400">Henüz seçilmedi</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="space-y-3 rounded-[24px] border border-emerald-100 bg-white p-4">
        <p className="text-sm font-medium text-slate-800">Renk kodu gir</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={customInput}
            onChange={(event) => {
              setCustomInput(event.target.value);
              setInputError(null);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addColor(customInput);
              }
            }}
            placeholder="#16A34A"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => addColor(customInput)}
            disabled={value.length >= MAX_BRAND_COLORS}
          >
            Ekle
          </Button>
        </div>
        {inputError && <p className="text-sm text-red-600">{inputError}</p>}
        <p className="text-xs text-slate-500">
          İlk seçtiğiniz renk ana renk olur. En fazla {MAX_BRAND_COLORS} renk ekleyebilirsiniz.
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-800">Popüler marka renkleri</p>
        <p className="text-xs text-slate-500">
          Küçük işletmelerin en çok kullandığı hazır renkler. Tıkladıkça sırayla eklenir.
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {BRAND_COLOR_PALETTE.map((swatch) => {
            const color = swatch.hex.toUpperCase();
            const order = value.map((c) => c.toUpperCase()).indexOf(color);
            const isSelected = order >= 0;

            return (
              <button
                key={color}
                type="button"
                onClick={() => togglePaletteColor(color)}
                disabled={!isSelected && value.length >= MAX_BRAND_COLORS}
                className={cn(
                  "flex items-center gap-3 rounded-[20px] border p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-40",
                  isSelected
                    ? "border-emerald-400 bg-emerald-50"
                    : "border-emerald-100 bg-white hover:bg-emerald-50/50",
                )}
              >
                <span
                  className={cn(
                    "h-9 w-9 shrink-0 rounded-xl border",
                    color === "#FFFFFF" || color === "#FFFBEB"
                      ? "border-slate-200"
                      : "border-white",
                  )}
                  style={{ backgroundColor: color }}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">{swatch.label}</p>
                  <p className="text-xs text-slate-500">{color}</p>
                </div>
                {isSelected && (
                  <Badge className="shrink-0 border-emerald-300 bg-emerald-500 text-white">
                    {order + 1}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
