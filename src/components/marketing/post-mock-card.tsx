"use client";

import { cn } from "@/lib/utils";
import type { ShowcasePost } from "@/lib/marketing-showcase";

type PostMockCardProps = {
  post: ShowcasePost;
  size?: "sm" | "md" | "lg";
  className?: string;
  showBadge?: string;
};

const sizeClasses = {
  sm: {
    root: "rounded-2xl",
    padding: "p-3",
    day: "text-sm font-semibold",
    subtitle: "text-[10px] leading-tight",
    logo: "h-6 w-6 text-[8px]",
    watermark: "text-[8px]",
  },
  md: {
    root: "rounded-[22px]",
    padding: "p-4",
    day: "text-lg font-semibold",
    subtitle: "text-xs",
    logo: "h-8 w-8 text-[10px]",
    watermark: "text-[10px]",
  },
  lg: {
    root: "rounded-[28px]",
    padding: "p-6",
    day: "text-3xl font-semibold tracking-tight",
    subtitle: "text-sm",
    logo: "h-11 w-11 text-xs",
    watermark: "text-xs",
  },
};

function PatternOverlay({ pattern }: { pattern: ShowcasePost["pattern"] }) {
  if (pattern === "stars") {
    return (
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <div className="absolute right-6 top-6 h-2 w-2 rotate-45 bg-white" />
        <div className="absolute right-14 top-12 h-1.5 w-1.5 rotate-45 bg-white" />
        <div className="absolute left-8 top-10 h-1 w-1 rotate-45 bg-white" />
        <div className="absolute bottom-24 right-10 h-2 w-2 rotate-45 bg-white/80" />
      </div>
    );
  }

  if (pattern === "crescent") {
    return (
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full border-[10px] border-white/15" />
    );
  }

  if (pattern === "hearts") {
    return (
      <div className="pointer-events-none absolute right-5 top-5 text-2xl text-white/20">♥</div>
    );
  }

  if (pattern === "lines") {
    return (
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),transparent)]" />
    );
  }

  return (
    <div className="pointer-events-none absolute left-1/2 top-1/3 h-28 w-28 -translate-x-1/2 rounded-full bg-white/10 blur-2xl" />
  );
}

export function PostMockCard({
  post,
  size = "md",
  className,
  showBadge,
}: PostMockCardProps) {
  const s = sizeClasses[size];

  return (
    <div
      className={cn(
        "relative aspect-square overflow-hidden border border-white/20 shadow-[0_20px_60px_rgba(15,23,42,0.18)]",
        s.root,
        className,
      )}
    >
      <div className={cn("absolute inset-0 bg-gradient-to-br", post.gradient)} />
      <PatternOverlay pattern={post.pattern} />
      <div className="pointer-events-none absolute -left-6 bottom-10 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -right-4 top-16 h-20 w-20 rounded-full bg-black/10 blur-xl" />

      <div className={cn("relative flex h-full flex-col justify-between text-white", s.padding)}>
        <div className="flex items-start justify-between gap-2">
          <div
            className={cn(
              "flex shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/15 font-bold backdrop-blur-sm",
              s.logo,
            )}
          >
            LOGO
          </div>
          {showBadge ? (
            <span className="rounded-full border border-white/25 bg-black/20 px-2.5 py-1 text-[10px] font-medium backdrop-blur-sm">
              {showBadge}
            </span>
          ) : null}
        </div>

        <div>
          <p className={cn("uppercase tracking-[0.18em] text-white/70", s.watermark)}>
            Markanız
          </p>
          <p className={cn("mt-1 leading-tight", s.day)}>{post.day}</p>
          <p className={cn("mt-1 text-white/85", s.subtitle)}>{post.subtitle}</p>
        </div>
      </div>
    </div>
  );
}
