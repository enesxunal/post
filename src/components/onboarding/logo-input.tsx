"use client";

import { useRef, useState } from "react";
import { ImagePlus, Link2, Loader2, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  isAcceptedLogoFile,
  LOGO_ACCEPT,
  LOGO_MAX_BYTES,
  readLogoFileAsDataUrl,
} from "@/lib/client/logo-file";
import { cn } from "@/lib/utils";

type LogoInputProps = {
  value?: string;
  onChange: (value: string) => void;
};

export function LogoInput({ value = "", onChange }: LogoInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"upload" | "link">(
    value && !value.startsWith("data:") ? "link" : "upload",
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const hasLogo = Boolean(value?.trim());

  async function handleFile(file: File) {
    setError(null);

    if (!isAcceptedLogoFile(file)) {
      setError("PNG, JPG, SVG veya WebP formatında bir logo seçin.");
      return;
    }

    if (file.size > LOGO_MAX_BYTES) {
      setError("Logo en fazla 2 MB olabilir.");
      return;
    }

    setLoading(true);
    try {
      const dataUrl = await readLogoFileAsDataUrl(file);
      onChange(dataUrl);
    } catch {
      setError("Logo okunamadı. Başka bir dosya deneyin.");
    } finally {
      setLoading(false);
    }
  }

  function clearLogo() {
    onChange("");
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function switchMode(next: "upload" | "link") {
    setMode(next);
    setError(null);
    if (next === "upload" && value && !value.startsWith("data:")) {
      onChange("");
    }
    if (next === "link" && value?.startsWith("data:")) {
      onChange("");
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-1">
        <button
          type="button"
          onClick={() => switchMode("upload")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition",
            mode === "upload" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500",
          )}
        >
          <Upload className="h-4 w-4" />
          Dosya yükle
        </button>
        <button
          type="button"
          onClick={() => switchMode("link")}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition",
            mode === "link" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500",
          )}
        >
          <Link2 className="h-4 w-4" />
          Link yapıştır
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={LOGO_ACCEPT}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />

      {mode === "upload" ? (
        hasLogo ? (
          <div className="flex items-center gap-4 rounded-[20px] border border-emerald-100 bg-white p-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={value} alt="Logo önizleme" className="max-h-full max-w-full object-contain" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-900">Logo yüklendi</p>
              <p className="mt-0.5 text-xs text-slate-500">
                Tasarıma uygun yere otomatik eklenir.
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-8 px-3 text-xs"
                onClick={() => fileInputRef.current?.click()}
              >
                Değiştir
              </Button>
              <Button type="button" variant="ghost" className="h-8 w-8 px-0" onClick={clearLogo}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            disabled={loading}
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-3 rounded-[20px] border border-dashed border-emerald-200 bg-white px-6 py-8 text-center transition hover:border-emerald-400 hover:bg-emerald-50/40 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            ) : (
              <ImagePlus className="h-8 w-8 text-emerald-600" />
            )}
            <div>
              <p className="text-sm font-medium text-slate-900">
                Logoyu bilgisayarınızdan seçin
              </p>
              <p className="mt-1 text-xs text-slate-500">PNG, JPG, SVG veya WebP • En fazla 2 MB</p>
            </div>
          </button>
        )
      ) : (
        <Input
          placeholder="https://siteniz.com/logo.png"
          value={value.startsWith("data:") ? "" : value}
          onChange={(event) => onChange(event.target.value)}
        />
      )}

      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
