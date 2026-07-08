import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { BlogPost } from "@/lib/blog/types";

export function BlogPostCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full">
      <Card className="flex h-full flex-col overflow-hidden rounded-3xl border-emerald-100 p-0 transition hover:border-emerald-300 hover:shadow-md">
        {post.coverImage ? (
          <div className="relative aspect-[16/10] overflow-hidden bg-emerald-50">
            <Image
              src={post.coverImage}
              alt={`${post.topicLabel} — ${post.primaryKeyword}`}
              fill
              className="object-cover transition duration-300 group-hover:scale-[1.03]"
              sizes="(max-width: 640px) 100vw, 40vw"
            />
          </div>
        ) : null}
        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-emerald-200 bg-emerald-50 text-emerald-800">
              {post.categoryLabel}
            </Badge>
            <span className="text-xs text-slate-500">{post.topicLabel}</span>
          </div>
          <h2 className="mt-4 text-lg font-semibold leading-snug text-slate-950 group-hover:text-emerald-800 sm:text-xl">
            {post.title}
          </h2>
          <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{post.description}</p>
          <div className="mt-5 flex items-center justify-between text-xs text-slate-500">
            <span>Anahtar: {post.primaryKeyword}</span>
            <span>{post.readingMinutes} dk</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
