"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function PromptPreviewPanel() {
  const [brandName, setBrandName] = useState("Örnek Kafe");
  const [dayId, setDayId] = useState("new-year");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<{
    headline: string;
    prompt: string;
    negativePrompt: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runPreview() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/prompt-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandName, dayId }),
      });
      const data = (await response.json()) as {
        headline?: string;
        prompt?: string;
        negativePrompt?: string;
        error?: string;
      };
      if (!response.ok) throw new Error(data.error ?? "Önizleme alınamadı");
      setPreview({
        headline: data.headline ?? "",
        prompt: data.prompt ?? "",
        negativePrompt: data.negativePrompt ?? "",
      });
    } catch (previewError) {
      setError(previewError instanceof Error ? previewError.message : "Hata oluştu");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Badge>Prompt</Badge>
      <h1 className="mt-3 text-3xl font-semibold text-slate-950">Prompt Önizleme</h1>
      <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
        Seçtiğiniz özel gün ve marka bilgisiyle AI&apos;ya giden görsel promptunu burada
        test edebilirsiniz.
      </p>

      <Card className="mt-8 space-y-4 p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="font-medium text-slate-700">Marka adı</span>
            <Input value={brandName} onChange={(event) => setBrandName(event.target.value)} />
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium text-slate-700">Özel gün kodu</span>
            <Input value={dayId} onChange={(event) => setDayId(event.target.value)} />
          </label>
        </div>

        <Button onClick={runPreview} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          Prompt oluştur
        </Button>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        {preview ? (
          <div className="space-y-4">
            <PreviewBlock title="Başlık" value={preview.headline} />
            <PreviewBlock title="Görsel prompt" value={preview.prompt} />
            <PreviewBlock title="Kaçınılacaklar" value={preview.negativePrompt} />
          </div>
        ) : null}
      </Card>
    </div>
  );
}

function PreviewBlock({ title, value }: { title: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-700">{title}</p>
      <Textarea className="mt-2" rows={6} readOnly value={value} />
    </div>
  );
}
