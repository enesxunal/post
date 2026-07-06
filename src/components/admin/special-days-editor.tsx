"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Save, Search, UploadCloud } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  SPECIAL_DAY_CATEGORY_LABELS,
  SPECIAL_DAY_CATEGORY_ORDER,
} from "@/lib/special-days-data";
import type { SpecialDay, SpecialDayCategory } from "@/types/domain";

type FormState = {
  name: string;
  category: SpecialDayCategory;
  culturalContext: string;
  headlineAlternatives: string;
  captionIdeas: string;
  visualDirection: string;
  avoidRules: string;
  promptTemplate: string;
  isDefaultSelected: boolean;
};

function dayToForm(day: SpecialDay): FormState {
  return {
    name: day.name,
    category: day.category,
    culturalContext: day.culturalContext,
    headlineAlternatives: day.headlineAlternatives.join("\n"),
    captionIdeas: day.captionIdeas.join("\n"),
    visualDirection: day.visualDirection,
    avoidRules: day.avoidRules,
    promptTemplate: day.promptTemplate,
    isDefaultSelected: day.isDefaultSelected,
  };
}

function linesToArray(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function SpecialDaysEditor() {
  const [days, setDays] = useState<SpecialDay[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<SpecialDayCategory | "all">("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedDay = days.find((day) => day.id === selectedId);

  const filteredDays = useMemo(() => {
    return days.filter((day) => {
      const matchesCategory = category === "all" || day.category === category;
      const matchesQuery =
        !query ||
        day.name.toLowerCase().includes(query.toLowerCase()) ||
        day.culturalContext.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [days, query, category]);

  async function loadDays() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/special-days");
      const payload = (await response.json()) as { data?: SpecialDay[]; error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Liste alınamadı");
      setDays(payload.data ?? []);
      if (!selectedId && payload.data?.[0]) {
        setSelectedId(payload.data[0].id);
        setForm(dayToForm(payload.data[0]));
      }
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Yükleme hatası");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDays();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function selectDay(day: SpecialDay) {
    setSelectedId(day.id);
    setForm(dayToForm(day));
    setMessage(null);
  }

  async function saveDay() {
    if (!selectedDay || !form) return;

    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(`/api/admin/special-days/${selectedDay.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          category: form.category,
          culturalContext: form.culturalContext,
          headlineAlternatives: linesToArray(form.headlineAlternatives),
          captionIdeas: linesToArray(form.captionIdeas),
          visualDirection: form.visualDirection,
          avoidRules: form.avoidRules,
          promptTemplate: form.promptTemplate,
          isDefaultSelected: form.isDefaultSelected,
        }),
      });

      const payload = (await response.json()) as { data?: SpecialDay; error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Kayıt başarısız");

      const updated = payload.data!;
      setDays((current) => current.map((day) => (day.id === updated.id ? updated : day)));
      setForm(dayToForm(updated));
      setMessage("Kaydedildi. Yeni üretimler bu metinleri kullanacak.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Kayıt hatası");
    } finally {
      setSaving(false);
    }
  }

  async function seedCatalog() {
    setSeeding(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/admin/special-days/seed", { method: "POST" });
      const payload = (await response.json()) as { count?: number; error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Aktarım başarısız");
      await loadDays();
      setMessage(`${payload.count ?? 0} özel gün veritabanına aktarıldı.`);
    } catch (seedError) {
      setError(seedError instanceof Error ? seedError.message : "Aktarım hatası");
    } finally {
      setSeeding(false);
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Badge>Post Metinleri</Badge>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">Özel Günler & Açıklamalar</h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
            Burada düzenlediğiniz başlıklar, caption fikirleri ve AI prompt metinleri doğrudan post
            üretiminde kullanılır. Her satıra bir başlık veya caption fikri yazın.
          </p>
        </div>
        <Button variant="outline" onClick={seedCatalog} disabled={seeding}>
          {seeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}
          Kataloğu veritabanına aktar
        </Button>
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          {message}
        </div>
      ) : null}

      <div className="mt-8 grid gap-6 xl:grid-cols-[320px_1fr]">
        <Card className="p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-9"
              placeholder="Gün ara..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <FilterChip active={category === "all"} onClick={() => setCategory("all")}>
              Tümü
            </FilterChip>
            {SPECIAL_DAY_CATEGORY_ORDER.map((item) => (
              <FilterChip
                key={item}
                active={category === item}
                onClick={() => setCategory(item)}
              >
                {SPECIAL_DAY_CATEGORY_LABELS[item]}
              </FilterChip>
            ))}
          </div>

          <div className="mt-4 max-h-[70vh] space-y-2 overflow-y-auto pr-1">
            {loading ? (
              <div className="flex items-center gap-2 p-3 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Yükleniyor...
              </div>
            ) : (
              filteredDays.map((day) => (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => selectDay(day)}
                  className={`relative z-10 w-full cursor-pointer rounded-2xl border px-3 py-3 text-left transition touch-manipulation ${
                    selectedId === day.id
                      ? "border-emerald-300 bg-emerald-50"
                      : "border-slate-200 bg-white hover:border-emerald-200"
                  }`}
                >
                  <p className="font-medium text-slate-900">{day.name}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-500">{day.captionIdeas[0]}</p>
                </button>
              ))
            )}
          </div>
        </Card>

        <Card className="p-5">
          {!form || !selectedDay ? (
            <p className="text-sm text-slate-500">Düzenlemek için soldan bir özel gün seçin.</p>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">{selectedDay.name}</h2>
                  <p className="text-sm text-slate-500">Kod: {selectedDay.id}</p>
                </div>
                <Badge>{SPECIAL_DAY_CATEGORY_LABELS[form.category]}</Badge>
              </div>

              <Field label="Gün adı">
                <Input
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                />
              </Field>

              <Field label="Kültürel bağlam (AI ton rehberi)">
                <Textarea
                  rows={3}
                  value={form.culturalContext}
                  onChange={(event) => setForm({ ...form, culturalContext: event.target.value })}
                />
              </Field>

              <Field label="Başlık alternatifleri (her satır bir başlık)">
                <Textarea
                  rows={4}
                  value={form.headlineAlternatives}
                  onChange={(event) =>
                    setForm({ ...form, headlineAlternatives: event.target.value })
                  }
                />
              </Field>

              <Field label="Caption / açıklama fikirleri (her satır bir fikir)">
                <Textarea
                  rows={6}
                  value={form.captionIdeas}
                  onChange={(event) => setForm({ ...form, captionIdeas: event.target.value })}
                />
              </Field>

              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Görsel yön">
                  <Textarea
                    rows={3}
                    value={form.visualDirection}
                    onChange={(event) => setForm({ ...form, visualDirection: event.target.value })}
                  />
                </Field>
                <Field label="Kaçınılacaklar (negative prompt)">
                  <Textarea
                    rows={3}
                    value={form.avoidRules}
                    onChange={(event) => setForm({ ...form, avoidRules: event.target.value })}
                  />
                </Field>
              </div>

              <Field label="AI görsel prompt şablonu">
                <Textarea
                  rows={6}
                  value={form.promptTemplate}
                  onChange={(event) => setForm({ ...form, promptTemplate: event.target.value })}
                />
              </Field>

              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.isDefaultSelected}
                  onChange={(event) =>
                    setForm({ ...form, isDefaultSelected: event.target.checked })
                  }
                />
                Onboarding&apos;de varsayılan seçili gelsin
              </label>

              <Button onClick={saveDay} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Kaydet
              </Button>
            </div>
          )}
        </Card>
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

function FilterChip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium transition ${
        active ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {children}
    </button>
  );
}
