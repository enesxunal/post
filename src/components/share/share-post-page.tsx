"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, Copy, Download, Share2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LazyJobImage } from "@/components/dashboard/lazy-job-image";
import { buildShareCaption } from "@/lib/share/publish-schedule";
import { getPreviewAspectClass } from "@/lib/image-formats";
import type { PostFormat } from "@/types/domain";

type SharePostPageProps = {
  jobId: string;
  dayName: string;
  dateLabel: string;
  brandName: string;
  caption: string | null;
  hashtags: string[];
  postFormat: PostFormat;
  imageUrl?: string | null;
  gradient: string;
};

export function SharePostPage({
  jobId,
  dayName,
  dateLabel,
  brandName,
  caption,
  hashtags,
  postFormat,
  imageUrl,
  gradient,
}: SharePostPageProps) {
  const [copied, setCopied] = useState(false);
  const [resolvedImageUrl, setResolvedImageUrl] = useState<string | null>(imageUrl ?? null);
  const previewAspect = getPreviewAspectClass(postFormat);

  const shareText = useMemo(
    () =>
      buildShareCaption({
        jobId,
        dayId: "",
        dayName,
        dateLabel,
        brandName,
        caption,
        hashtags,
      }),
    [jobId, dayName, dateLabel, brandName, caption, hashtags],
  );

  useEffect(() => {
    if (imageUrl) {
      setResolvedImageUrl(imageUrl);
      return;
    }

    let active = true;
    void fetch(`/api/generation/job-image?jobId=${jobId}`)
      .then((response) => response.json())
      .then((data: { imageUrl?: string }) => {
        if (active && data.imageUrl) setResolvedImageUrl(data.imageUrl);
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [imageUrl, jobId]);

  async function copyShareText() {
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  async function downloadImage() {
    const url = resolvedImageUrl;
    if (!url) return;

    if (url.startsWith("data:")) {
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${brandName}-${dayName}.png`;
      anchor.click();
      return;
    }

    const response = await fetch(url);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = `${brandName}-${dayName}.png`;
    anchor.click();
    URL.revokeObjectURL(objectUrl);
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_36%),linear-gradient(180deg,_#f8fffa_0%,_#ffffff_100%)] px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Link
            href={`/dashboard?job=${jobId}`}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Panele dön
          </Link>
          <Badge className="bg-sky-100 text-sky-800">Paylaşım</Badge>
        </div>

        <div>
          <h1 className="text-2xl font-semibold text-slate-950 sm:text-3xl">{dayName}</h1>
          <p className="mt-1 text-sm text-slate-600">
            {brandName} · {dateLabel}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Takvim hatırlatıcınızdan geldiniz. Görseli indirip metni kopyalayarak Instagram veya Meta
            Business Suite&apos;te paylaşabilirsiniz.
          </p>
        </div>

        <Card className="overflow-hidden p-0">
          <div className={`relative ${previewAspect} bg-slate-100`}>
            <LazyJobImage
              jobId={jobId}
              status="ready"
              alt={dayName}
              className="absolute inset-0"
              gradient={gradient}
              initialUrl={resolvedImageUrl}
              lazy={false}
            />
          </div>
        </Card>

        <div className="grid gap-3 sm:grid-cols-2">
          <Button className="w-full" onClick={() => void downloadImage()} disabled={!resolvedImageUrl}>
            <Download className="mr-2 h-4 w-4" />
            Görseli indir
          </Button>
          <Button variant="secondary" className="w-full" onClick={() => void copyShareText()}>
            {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
            {copied ? "Kopyalandı" : "Metni kopyala"}
          </Button>
        </div>

        <Card className="space-y-3 p-5">
          <div className="flex items-center gap-2">
            <Share2 className="h-4 w-4 text-emerald-600" />
            <p className="text-sm font-semibold text-slate-900">Paylaşım metni</p>
          </div>
          <textarea
            readOnly
            value={shareText}
            className="min-h-[160px] w-full resize-none rounded-2xl border border-emerald-100 bg-emerald-50/40 px-4 py-3 text-sm leading-6 text-slate-800 outline-none"
          />
          <Button variant="outline" className="w-full" onClick={() => void copyShareText()}>
            {copied ? "Metin kopyalandı" : "Metni panoya kopyala"}
          </Button>
        </Card>
      </div>
    </div>
  );
}
