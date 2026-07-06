"use client";

import { POST_FORMAT_OPTIONS, type PostFormat } from "@/lib/image-formats";
import { cn } from "@/lib/utils";

type PostFormatSelectorProps = {
  value: PostFormat;
  onChange: (format: PostFormat) => void;
};

export function PostFormatSelector({ value, onChange }: PostFormatSelectorProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-slate-800">Post boyutu</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {POST_FORMAT_OPTIONS.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => onChange(option.key)}
            className={cn(
              "rounded-[24px] border p-4 text-left transition",
              value === option.key
                ? "border-emerald-400 bg-emerald-50"
                : "border-emerald-100 bg-white hover:border-emerald-200",
            )}
          >
            <p className="font-medium text-slate-900">{option.label}</p>
            <p className="mt-1 text-sm font-semibold text-emerald-700">{option.size}</p>
            <p className="mt-2 text-sm text-slate-600">{option.description}</p>
          </button>
        ))}
      </div>
      <p className="text-xs text-slate-500">
        Story (1080×1920) ek paket ile seçilir; feed postu onaylandıktan sonra üretilir.
      </p>
    </div>
  );
}
