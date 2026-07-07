"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Info } from "lucide-react";

import { cn } from "@/lib/utils";

type DisplayRow = {
  key: string;
  label: string;
  value: string;
};

type JobDebugResponse = {
  artDirectionDisplay: DisplayRow[] | null;
  prompt: string | null;
  provider: string | null;
  hasPlan: boolean;
  hasMetadata: boolean;
  status: string;
};

type JobProductionDetailsProps = {
  jobId: string;
  status: string;
};

export function JobProductionDetails({ jobId, status }: JobProductionDetailsProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<JobDebugResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || data) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    void fetch(`/api/generation/job-debug?jobId=${encodeURIComponent(jobId)}`)
      .then(async (response) => {
        const json = (await response.json()) as JobDebugResponse & { error?: string };
        if (!response.ok) {
          throw new Error(json.error ?? "Detay alınamadı");
        }
        if (!cancelled) setData(json);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, data, jobId]);

  if (status === "draft" || status === "queued") {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/80">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-slate-800">
          <Info className="h-4 w-4 text-slate-500" />
          Bu görsel nasıl üretildi?
        </span>
        <ChevronDown
          className={cn("h-4 w-4 text-slate-500 transition", open && "rotate-180")}
        />
      </button>

      {open ? (
        <div className="space-y-4 border-t border-slate-200 px-4 py-4">
          {loading ? <p className="text-sm text-slate-500">Yükleniyor…</p> : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          {data?.artDirectionDisplay?.length ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {data.artDirectionDisplay.map((row) => (
                <div key={row.key} className="rounded-xl border border-white bg-white px-3 py-2">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    {row.label}
                  </p>
                  <p className="mt-1 text-sm text-slate-800">{row.value}</p>
                </div>
              ))}
            </div>
          ) : data && !loading ? (
            <p className="text-sm text-slate-500">
              Bu post için tasarım planı kaydı yok. Eski paket veya migration öncesi üretim olabilir.
            </p>
          ) : null}

          {data?.provider ? (
            <p className="text-xs text-slate-500">Görsel motoru: {data.provider}</p>
          ) : null}

          {data?.prompt ? (
            <details className="rounded-xl border border-white bg-white px-3 py-2">
              <summary className="cursor-pointer text-sm font-medium text-slate-700">
                Kullanılan prompt (gelişmiş)
              </summary>
              <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap text-xs leading-5 text-slate-600">
                {data.prompt}
              </pre>
            </details>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
