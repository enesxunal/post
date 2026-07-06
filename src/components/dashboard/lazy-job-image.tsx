"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type LazyJobImageProps = {
  jobId: string;
  status: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  gradient?: string;
  initialUrl?: string | null;
  story?: boolean;
};

export function LazyJobImage({
  jobId,
  status,
  alt,
  className,
  imageClassName,
  gradient,
  initialUrl,
  story = false,
}: LazyJobImageProps) {
  const [url, setUrl] = useState<string | null>(initialUrl ?? null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialUrl) {
      setUrl(initialUrl);
      return;
    }

    if (status !== "ready") {
      setUrl(null);
      return;
    }

    let active = true;
    setLoading(true);

    void fetch(`/api/generation/job-image?jobId=${jobId}`, { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return null;
        return (await response.json()) as { imageUrl?: string; storyImageUrl?: string };
      })
      .then((data) => {
        if (!active || !data) return;
        setUrl(story ? (data.storyImageUrl ?? null) : (data.imageUrl ?? null));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [initialUrl, jobId, status, story]);

  if (url) {
    return (
      <div className={className}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={alt} className={cn("h-full w-full object-cover", imageClassName)} />
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <div className={cn("absolute inset-0 bg-gradient-to-br", gradient ?? "from-slate-400 to-slate-600")} />
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 text-xs font-medium text-white/90">
          Yükleniyor…
        </div>
      ) : null}
    </div>
  );
}
