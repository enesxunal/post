"use client";

import { ImageIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { loadJobImage } from "@/lib/dashboard/job-image-cache";
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
  /** false ise görünene kadar API çağrısı yapılmaz */
  lazy?: boolean;
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
  lazy = true,
}: LazyJobImageProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [url, setUrl] = useState<string | null>(initialUrl ?? null);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(!lazy);

  useEffect(() => {
    if (!lazy) {
      setVisible(true);
      return;
    }

    const node = rootRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "120px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [lazy]);

  useEffect(() => {
    if (initialUrl) {
      setUrl(initialUrl);
      return;
    }

    if (status !== "ready" || !visible) {
      if (status !== "ready" && status !== "draft") setUrl(null);
      return;
    }

    let active = true;
    setLoading(true);

    void loadJobImage(jobId, story)
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
  }, [initialUrl, jobId, status, story, visible]);

  if (url) {
    return (
      <div className={className}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={alt} className={cn("h-full w-full object-cover", imageClassName)} />
      </div>
    );
  }

  if (status === "draft") {
    return (
      <div ref={rootRef} className={cn("relative flex items-center justify-center bg-slate-100", className)}>
        <div className="text-center px-3">
          <ImageIcon className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-2 text-xs font-medium text-slate-400">Henüz üretilmedi</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <div className={cn("absolute inset-0 bg-gradient-to-br", gradient ?? "from-slate-400 to-slate-600")} />
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 text-xs font-medium text-white/90">
          Yükleniyor…
        </div>
      ) : null}
    </div>
  );
}
