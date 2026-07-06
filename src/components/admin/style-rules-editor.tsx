"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Save, UploadCloud } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import type { StyleRule } from "@/types/domain";

type FormState = {
  name: string;
  description: string;
  visualCues: string;
  typographyHints: string;
  compositionHints: string;
  colorHints: string;
  bestFor: string;
  avoidRules: string;
  promptModifier: string;
};

function ruleToForm(rule: StyleRule): FormState {
  return {
    name: rule.name,
    description: rule.description,
    visualCues: rule.visualCues,
    typographyHints: rule.typographyHints,
    compositionHints: rule.compositionHints,
    colorHints: rule.colorHints,
    bestFor: rule.bestFor.join("\n"),
    avoidRules: rule.avoidRules.join("\n"),
    promptModifier: rule.promptModifier,
  };
}

function linesToArray(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function StyleRulesEditor() {
  const [rules, setRules] = useState<StyleRule[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedRule = rules.find((rule) => rule.key === selectedKey);

  const sortedRules = useMemo(
    () => [...rules].sort((a, b) => a.name.localeCompare(b.name, "tr")),
    [rules],
  );

  async function loadRules() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/style-rules");
      const payload = (await response.json()) as { data?: StyleRule[]; error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Liste alınamadı");
      setRules(payload.data ?? []);
      if (!selectedKey && payload.data?.[0]) {
        setSelectedKey(payload.data[0].key);
        setForm(ruleToForm(payload.data[0]));
      }
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Yükleme hatası");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function selectRule(rule: StyleRule) {
    setSelectedKey(rule.key);
    setForm(ruleToForm(rule));
    setMessage(null);
  }

  async function saveRule() {
    if (!selectedRule || !form) return;

    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch(`/api/admin/style-rules/${selectedRule.key}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          visualCues: form.visualCues,
          typographyHints: form.typographyHints,
          compositionHints: form.compositionHints,
          colorHints: form.colorHints,
          bestFor: linesToArray(form.bestFor),
          avoidRules: linesToArray(form.avoidRules),
          promptModifier: form.promptModifier,
        }),
      });

      const payload = (await response.json()) as { data?: StyleRule; error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Kayıt başarısız");

      const updated = payload.data!;
      setRules((current) => current.map((rule) => (rule.key === updated.key ? updated : rule)));
      setForm(ruleToForm(updated));
      setMessage("Kaydedildi. Yeni üretimler bu stil kurallarını kullanacak.");
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
      const response = await fetch("/api/admin/style-rules/seed", { method: "POST" });
      const payload = (await response.json()) as { count?: number; error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Aktarım başarısız");
      await loadRules();
      setMessage(`${payload.count ?? 0} stil kuralı güncellendi.`);
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
          <Badge>Stil</Badge>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">Stil Kuralları</h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
            Modern, minimal, kurumsal gibi stillerin prompt detayları. Kullanıcılar onboarding&apos;de
            sadece isim + kısa açıklama görür; burada tüm alanları düzenleyebilirsiniz.
          </p>
        </div>
        <Button variant="outline" onClick={seedCatalog} disabled={seeding}>
          {seeding ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <UploadCloud className="mr-2 h-4 w-4" />
          )}
          6 stili yükle
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

      <div className="mt-8 grid gap-6 xl:grid-cols-[280px_1fr]">
        <Card className="p-4">
          <div className="max-h-[70vh] space-y-2 overflow-y-auto pr-1">
            {loading ? (
              <div className="flex items-center gap-2 p-3 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Yükleniyor...
              </div>
            ) : (
              sortedRules.map((rule) => (
                <button
                  key={rule.key}
                  type="button"
                  onClick={() => selectRule(rule)}
                  className={`relative z-10 w-full cursor-pointer rounded-2xl border px-3 py-3 text-left transition touch-manipulation ${
                    selectedKey === rule.key
                      ? "border-emerald-300 bg-emerald-50"
                      : "border-slate-200 bg-white hover:border-emerald-200"
                  }`}
                >
                  <p className="font-medium text-slate-900">{rule.name}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-500">{rule.description}</p>
                </button>
              ))
            )}
          </div>
        </Card>

        <Card className="p-5">
          {!form || !selectedRule ? (
            <p className="text-sm text-slate-500">Düzenlemek için soldan bir stil seçin.</p>
          ) : (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">{selectedRule.name}</h2>
                <p className="text-sm text-slate-500">Kod: {selectedRule.key}</p>
              </div>

              <Field label="Stil adı (kullanıcıya görünen)">
                <Input
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                />
              </Field>

              <Field label="Kısa açıklama (onboarding kartında görünür)">
                <Textarea
                  rows={2}
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                />
              </Field>

              <Field label="Görsel ipuçları (visual_cues)">
                <Textarea
                  rows={3}
                  value={form.visualCues}
                  onChange={(event) => setForm({ ...form, visualCues: event.target.value })}
                />
              </Field>

              <Field label="Tipografi ipuçları (typography_hints)">
                <Textarea
                  rows={2}
                  value={form.typographyHints}
                  onChange={(event) => setForm({ ...form, typographyHints: event.target.value })}
                />
              </Field>

              <Field label="Kompozisyon ipuçları (composition_hints)">
                <Textarea
                  rows={3}
                  value={form.compositionHints}
                  onChange={(event) => setForm({ ...form, compositionHints: event.target.value })}
                />
              </Field>

              <Field label="Renk ipuçları (color_hints)">
                <Textarea
                  rows={2}
                  value={form.colorHints}
                  onChange={(event) => setForm({ ...form, colorHints: event.target.value })}
                />
              </Field>

              <Field label="En uygun sektörler (best_for) — her satır bir madde">
                <Textarea
                  rows={4}
                  value={form.bestFor}
                  onChange={(event) => setForm({ ...form, bestFor: event.target.value })}
                />
              </Field>

              <Field label="Kaçınılacak şeyler (avoid_rules) — her satır bir kural">
                <Textarea
                  rows={4}
                  value={form.avoidRules}
                  onChange={(event) => setForm({ ...form, avoidRules: event.target.value })}
                />
              </Field>

              <Field label="Prompt modifier">
                <Textarea
                  rows={4}
                  value={form.promptModifier}
                  onChange={(event) => setForm({ ...form, promptModifier: event.target.value })}
                />
              </Field>

              <Button onClick={saveRule} disabled={saving}>
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
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
