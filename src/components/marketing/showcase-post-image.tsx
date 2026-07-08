"use client";

import Image from "next/image";
import { useState } from "react";

import type { ShowcasePost } from "@/lib/marketing-showcase";
import { PostMockCard } from "@/components/marketing/post-mock-card";
import { cn } from "@/lib/utils";

type ShowcasePostImageProps = {
  post: ShowcasePost;
  size?: "sm" | "md" | "lg";
  className?: string;
  showBadge?: string;
  priority?: boolean;
};

export function ShowcasePostImage({
  post,
  size = "md",
  className,
  showBadge,
  priority = false,
}: ShowcasePostImageProps) {
  const [imageFailed, setImageFailed] = useState(false);

  if (!post.imageSrc || imageFailed) {
    return (
      <PostMockCard post={post} size={size} className={className} showBadge={showBadge} />
    );
  }

  return (
    <div
      className={cn(
        "relative aspect-square overflow-hidden border border-white/20 shadow-[0_20px_60px_rgba(15,23,42,0.18)]",
        size === "lg" ? "rounded-[28px]" : size === "sm" ? "rounded-2xl" : "rounded-[22px]",
        className,
      )}
    >
      <Image
        src={post.imageSrc}
        alt={`${post.day} — ${post.sector} örnek post`}
        fill
        className="object-cover"
        sizes={size === "lg" ? "420px" : size === "sm" ? "180px" : "280px"}
        priority={priority}
        onError={() => setImageFailed(true)}
      />
      {showBadge ? (
        <span className="absolute right-3 top-3 rounded-full border border-white/25 bg-black/50 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
          {showBadge}
        </span>
      ) : null}
    </div>
  );
}
