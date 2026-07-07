"use client";

import { useEffect, useMemo, useState } from "react";
import { ImagePlus, Loader2, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getSectorOptionsFromSeed } from "@/lib/sectors/seed-data";
import { getStyleOptionsFromSeed } from "@/lib/styles/seed-data";
import { SPECIAL_DAY_CATEGORY_LABELS } from "@/lib/special-days-data";
import type { PostFormat, SectorKey, SpecialDay, VisualStyle } from "@/types/domain";

type AiStatus = {
  imageProvider?: string;
  ideogramConfigured?: boolean;
  openaiConfigured?: boolean;
  geminiConfigured?: boolean;
  models?: { image?: string };
};

type TestResult = {
  index: number;
  ok: boolean;
  imageUrl?: string;
  provider?: string;
  model?: string;
  durationMs?: number;
  error?: string;
};

type TestResponse = {
  provider?: string;
  headline?: string;
  prompt?: string;
  negativePrompt?: string;
  results?: TestResult[];
  error?: string;
};

const BRAND_COLORS = ["#10B981", "#DC2626", "#1D4ED8", "#D97706", "#171717", "#DB2777"];

export function GenerationTestPanel({ days }: { days: SpecialDay[] }) {
  const sectors = getSectorOptionsFromSeed();
  const styles = getStyleOptionsFromSeed();

  const [query, setQuery] = useState("");
  const [dayId, setDayId] = useState(days[0]?.id ?? "valentines-day");
  const [brandName, setBrandName] = useState("3 Kare Ajans");
  const [brandDescription, setBrandDescription] = useState(
    "Dijital pazarlama ve sosyal medya içerik hizmeti veren yerel ajans.",
  );
  const [sector, setSector] = useState<SectorKey>("agency");
  const [visualStyle, setVisualStyle] = useState<VisualStyle>("modern");
  const [primaryColor, setPrimaryColor] = useState("#DC2626");
  const [count, setCount] = useState(2);
  const [postFormat, setPostFormat] = useState<PostFormat>("square");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<TestResponse | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [aiStatus, setAiStatus] = useState<AiStatus | null>(null);

  useEffect(() => {
    void fetch("/api/ai/status")
      .then((res) => res.json())
      .then((data: AiStatus) => setAiStatus(data))
      .catch(() => undefined);
  }, []);

  const filteredDays = useMemo(() => {
    if (!query.trim()) return days;
    const q = query.toLowerCase();
    return days.filter(
      (day) =>
        day.name.toLowerCase().includes(q) ||
        day.id.toLowerCase().includes(q) ||
        day.category.toLowerCase().includes(q),
    );
  }, [days, query]);

  const selectedDay = days.find((day) => day.id === dayId);

  async function runTest() {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch("/api/admin/generation-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dayId,
          brandName,
          brandDescription,
          sector,
          visualStyle,
          primaryColor,
          count,
          postFormat,
        }),
      });

      const data = (await res.json()) as TestResponse;
      if (!res.ok) throw new Error(data.error ?? "Test başarısız");
      setResponse(data);
    } catch (testError) {
      setError(testError instanceof Error ? testError.message : "Test hatası");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Badge>Test</Badge>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">Görsel üretim testi</h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
          Seçtiğiniz özel gün için gerçek AI modelinden 1–4 görsel üretin. Müşteri akışına girmeden
          kaliteyi burada deneyebilirsiniz. Her tıklama OpenAI/Ideogram/Gemini API kredisi harcar.
        </p>
        {aiStatus ? (
          <p className="mt-2 text-xs text-emerald-700">
            Aktif motor: <strong>{aiStatus.models?.image ?? aiStatus.imageProvider}</strong>
            {aiStatus.openaiConfigured ? " • OpenAI bağlı" : ""}
            {aiStatus.ideogramConfigured ? " • Ideogram bağlı" : ""}
            {aiStatus.geminiConfigured ? " • Gemini bağlı" : ""}
          </p>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
        <Card className="space-y-4 p-5">
          <Field label="Özel gün ara">
            <Input
              placeholder="Sevgililer, 29 Ekim..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </Field>

          <Field label="Özel gün">
            <select
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
              value={dayId}
              onChange={(e) => setDayId(e.target.value)}
            >
              {filteredDays.map((day) => (
                <option key={day.id} value={day.id}>
                  {day.name} ({SPECIAL_DAY_CATEGORY_LABELS[day.category]})
                </option>
              ))}
            </select>
          </Field>

          {selectedDay ? (
            <p className="rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">
              {selectedDay.culturalContext.slice(0, 180)}…
            </p>
          ) : null}

          <Field label="Marka adı">
            <Input value={brandName} onChange={(e) => setBrandName(e.target.value)} />
          </Field>

          <Field label="Marka açıklaması">
            <Textarea
              rows={2}
              value={brandDescription}
              onChange={(e) => setBrandDescription(e.target.value)}
            />
          </Field>

          <Field label="Sektör">
            <select
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
              value={sector}
              onChange={(e) => setSector(e.target.value as SectorKey)}
            >
              {sectors.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Stil">
            <select
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
              value={visualStyle}
              onChange={(e) => setVisualStyle(e.target.value as VisualStyle)}
            >
              {styles.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Marka rengi">
            <div className="flex flex-wrap gap-2">
              {BRAND_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setPrimaryColor(color)}
                  className={`h-9 w-9 rounded-xl border-2 ${primaryColor === color ? "border-emerald-500 ring-2 ring-emerald-200" : "border-white"}`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </Field>

          <Field label="Format">
            <select
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
              value={postFormat}
              onChange={(e) => setPostFormat(e.target.value as PostFormat)}
            >
              <option value="square">Kare 1080×1080</option>
              <option value="portrait-1080x1350">Dikey 1080×1350</option>
            </select>
          </Field>

          <Field label={`Görsel sayısı (${count})`}>
            <input
              type="range"
              min={1}
              max={4}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full"
            />
          </Field>

          <Button className="w-full" onClick={runTest} disabled={loading || !dayId}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            {loading ? "Üretiliyor…" : `${count} görsel üret`}
          </Button>
        </Card>

        <div className="space-y-4">
          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {!response && !loading ? (
            <Card className="flex min-h-[320px] flex-col items-center justify-center p-8 text-center">
              <ImagePlus className="mb-3 h-10 w-10 text-slate-300" />
              <p className="text-sm text-slate-500">
                Soldan özel günü seçin ve &quot;Görsel üret&quot;e basın.
              </p>
            </Card>
          ) : null}

          {loading ? (
            <Card className="flex min-h-[320px] flex-col items-center justify-center p-8">
              <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
              <p className="mt-4 text-sm text-slate-600">
                Model çalışıyor… {count} görsel için ~{count * 15}–{count * 40} sn sürebilir.
              </p>
            </Card>
          ) : null}

          {response ? (
            <>
              <Card className="p-4">
                <p className="text-sm text-slate-600">
                  Başlık:{" "}
                  <strong className="text-slate-900">{response.headline ?? "—"}</strong>
                </p>
                <button
                  type="button"
                  className="mt-2 text-xs font-medium text-emerald-700 hover:underline"
                  onClick={() => setShowPrompt((v) => !v)}
                >
                  {showPrompt ? "Prompt'u gizle" : "Prompt'u göster (geliştirici)"}
                </button>
                {showPrompt && response.prompt ? (
                  <pre className="mt-3 max-h-64 overflow-auto rounded-xl bg-slate-950 p-3 text-[11px] leading-5 text-emerald-100">
                    {response.prompt}
                  </pre>
                ) : null}
              </Card>

              <div className="grid gap-4 sm:grid-cols-2">
                {response.results?.map((item) => (
                  <Card key={item.index} className="overflow-hidden">
                    {item.ok && item.imageUrl ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.imageUrl}
                          alt={`Test ${item.index}`}
                          className="aspect-square w-full object-cover"
                        />
                        <div className="p-3 text-xs text-slate-500">
                          #{item.index} • {item.provider} • {(item.durationMs ?? 0) / 1000}s
                        </div>
                      </>
                    ) : (
                      <div className="flex aspect-square flex-col items-center justify-center bg-red-50 p-4 text-center">
                        <p className="text-sm font-medium text-red-800">Üretilemedi</p>
                        <p className="mt-2 text-xs text-red-600">{item.error}</p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}
