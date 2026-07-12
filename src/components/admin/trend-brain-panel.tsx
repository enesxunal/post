"use client";

import { useCallback, useEffect, useState } from "react";
import { Brain, Check, Play, RefreshCcw, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type RunRow = {
  id: string;
  status: string;
  triggerType: string;
  triggeredBy?: string | null;
  targetsSelected: number;
  suggestionsCreated: number;
  startedAt: string;
  completedAt?: string | null;
  errorMessage?: string | null;
};

type SuggestionRow = {
  id: string;
  runId: string;
  targetType: string;
  targetId: string;
  suggestionType: string;
  reason: string;
  confidenceScore: number;
  status: string;
  researchSummary?: string | null;
  createdAt: string;
};

type DiffRow = { key: string; before: unknown; after: unknown };

type PerformanceRow = {
  targetType: string;
  targetId: string;
  sampleSize: number;
  metrics: {
    regenerateRate: number;
    failureRate: number;
    approvalRate: number;
  };
};

export function TrendBrainPanel() {
  const [runs, setRuns] = useState<RunRow[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestionRow[]>([]);
  const [performance, setPerformance] = useState<PerformanceRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [diff, setDiff] = useState<DiffRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [setupRequired, setSetupRequired] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const overview = await fetch("/api/admin/trend-brain").then((r) => r.json());

      if (overview.error && !overview.setupRequired) throw new Error(overview.error);

      setSetupRequired(Boolean(overview.setupRequired));
      setRuns(overview.runs ?? []);
      setPerformance(overview.performance ?? []);

      if (overview.setupRequired) {
        setSuggestions([]);
        if (overview.error) setError(overview.error);
        return;
      }

      const pending = await fetch("/api/admin/trend-brain/suggestions?status=pending").then((r) =>
        r.json(),
      );
      if (pending.error) throw new Error(pending.error);
      setSuggestions(pending.suggestions ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Veri alınamadı");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const loadDetail = async (id: string) => {
    setSelectedId(id);
    const response = await fetch(`/api/admin/trend-brain/suggestions/${id}`);
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Detay alınamadı");
      return;
    }
    setDiff(data.diff ?? []);
  };

  const runTrendBrain = async () => {
    setRunning(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/trend-brain/run", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Çalıştırılamadı");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Trend Brain başarısız");
    } finally {
      setRunning(false);
    }
  };

  const applySuggestion = async (id: string) => {
    setActionId(id);
    try {
      const response = await fetch(`/api/admin/trend-brain/suggestions/${id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Uygulanamadı");
      setSelectedId(null);
      setDiff([]);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Uygulama başarısız");
    } finally {
      setActionId(null);
    }
  };

  const rejectSuggestion = async (id: string) => {
    setActionId(id);
    try {
      const response = await fetch(`/api/admin/trend-brain/suggestions/${id}/reject`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Reddedilemedi");
      if (selectedId === id) {
        setSelectedId(null);
        setDiff([]);
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Red başarısız");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge className="bg-violet-100 text-violet-800">Trend Brain</Badge>
          <h1 className="mt-2 text-2xl font-semibold text-slate-950">Haftalık İçerik Zekası</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Performans sinyalleri ve yaklaşan takvime göre özel gün, sektör ve stil önerileri üretir.
            V1&apos;de öneriler otomatik uygulanmaz — onay gerekir.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void load()} disabled={loading}>
            <RefreshCcw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
            Yenile
          </Button>
          <Button onClick={() => void runTrendBrain()} disabled={running || setupRequired}>
            <Play className={cn("mr-2 h-4 w-4", running && "animate-pulse")} />
            Trend Brain Çalıştır
          </Button>
        </div>
      </div>

      {setupRequired ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-medium">Kurulum gerekli</p>
          <p className="mt-1">
            Trend Brain tabloları Supabase&apos;de henüz oluşturulmamış. SQL Editor&apos;da{" "}
            <code className="rounded bg-white px-1">supabase/migrations/20260710_trend_brain.sql</code>{" "}
            dosyasını çalıştırın, sonra bu sayfayı yenileyin.
          </p>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4 p-5">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-violet-600" />
            <h2 className="font-semibold text-slate-900">Son çalıştırmalar</h2>
          </div>
          {runs.length === 0 ? (
            <p className="text-sm text-slate-500">Henüz çalıştırma yok.</p>
          ) : (
            <div className="space-y-2">
              {runs.slice(0, 8).map((run) => (
                <div
                  key={run.id}
                  className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2 text-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-slate-800">
                      {run.triggerType === "cron" ? "Cron" : "Manuel"}
                    </span>
                    <Badge
                      className={cn(
                        run.status === "completed" && "bg-emerald-100 text-emerald-800",
                        run.status === "failed" && "bg-red-100 text-red-800",
                        run.status === "running" && "bg-amber-100 text-amber-800",
                      )}
                    >
                      {run.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(run.startedAt).toLocaleString("tr-TR")} • {run.targetsSelected} hedef
                    • {run.suggestionsCreated} öneri
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="space-y-4 p-5">
          <h2 className="font-semibold text-slate-900">Performans sinyalleri</h2>
          {performance.length === 0 ? (
            <p className="text-sm text-slate-500">
              Henüz yeterli veri yok. Üretim ve revizyonlar birikince burada görünür.
            </p>
          ) : (
            <div className="space-y-2">
              {performance.slice(0, 8).map((row) => (
                <div
                  key={`${row.targetType}-${row.targetId}`}
                  className="rounded-xl border border-slate-100 px-3 py-2 text-sm"
                >
                  <p className="font-medium text-slate-800">
                    {row.targetType} / {row.targetId}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Revizyon %{Math.round(row.metrics.regenerateRate * 100)} • Hata %
                    {Math.round(row.metrics.failureRate * 100)} • Örneklem {row.sampleSize}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="space-y-4 p-5">
        <h2 className="font-semibold text-slate-900">Bekleyen öneriler</h2>
        {suggestions.length === 0 ? (
          <p className="text-sm text-slate-500">Bekleyen öneri yok. Trend Brain çalıştırabilirsin.</p>
        ) : (
          <div className="space-y-3">
            {suggestions.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "rounded-2xl border p-4",
                  selectedId === item.id ? "border-violet-200 bg-violet-50/40" : "border-slate-100",
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">
                      {item.targetType} / {item.targetId}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">{item.reason}</p>
                    {item.researchSummary ? (
                      <p className="mt-2 text-xs text-violet-700">{item.researchSummary}</p>
                    ) : null}
                    <p className="mt-2 text-xs text-slate-400">
                      Güven: %{Math.round(item.confidenceScore * 100)} • {item.suggestionType}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" className="h-8 px-3 text-xs" onClick={() => void loadDetail(item.id)}>
                      Diff
                    </Button>
                    <Button
                      className="h-8 px-3 text-xs"
                      onClick={() => void applySuggestion(item.id)}
                      disabled={actionId === item.id}
                    >
                      <Check className="mr-1 h-3.5 w-3.5" />
                      Uygula
                    </Button>
                    <Button
                      variant="outline"
                      className="h-8 px-3 text-xs"
                      onClick={() => void rejectSuggestion(item.id)}
                      disabled={actionId === item.id}
                    >
                      <X className="mr-1 h-3.5 w-3.5" />
                      Reddet
                    </Button>
                  </div>
                </div>

                {selectedId === item.id && diff.length > 0 ? (
                  <div className="mt-4 space-y-2 border-t border-violet-100 pt-4">
                    {diff.map((row) => (
                      <div key={row.key} className="rounded-xl bg-white p-3 text-xs">
                        <p className="font-semibold text-slate-800">{row.key}</p>
                        <p className="mt-1 text-red-600 line-through">
                          {formatValue(row.before)}
                        </p>
                        <p className="mt-1 text-emerald-700">{formatValue(row.after)}</p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function formatValue(value: unknown) {
  if (Array.isArray(value)) return value.join(" | ");
  if (typeof value === "object" && value) return JSON.stringify(value);
  return String(value ?? "—");
}
