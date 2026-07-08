import type { Metadata } from "next";
import Link from "next/link";

import { BlogPostCard } from "@/components/blog/blog-post-card";
import { BlogShell } from "@/components/blog/blog-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { APP_NAME, APP_URL } from "@/lib/config";
import {
  getAllBlogPosts,
  getBlogPostsByCategory,
  getBlogTopics,
} from "@/lib/blog/posts";
import type { BlogCategory } from "@/lib/blog/types";

export const metadata: Metadata = {
  title: "Blog — Cuma mesajları, özel gün postları ve meslek rehberleri",
  description: `${APP_NAME} blog: cuma mesajları, 30 Ağustos özel postlar, bayram kutlamaları ve meslek / işletme türlerine özel Instagram içerik rehberleri.`,
  keywords: [
    "cuma mesajları",
    "30 ağustos özel postlar",
    "bayram postu",
    "işletme özel gün görseli",
    "instagram kutlama",
    "kobi sosyal medya",
  ],
  alternates: { canonical: `${APP_URL}/blog` },
  openGraph: {
    title: `${APP_NAME} Blog`,
    description: "Özel gün ve meslek bazlı SEO rehberleri.",
    url: `${APP_URL}/blog`,
    type: "website",
    locale: "tr_TR",
  },
};

type SearchParams = Promise<{ kategori?: string; konu?: string }>;

function parseCategory(value?: string): BlogCategory | undefined {
  if (value === "ozel-gun" || value === "meslek") return value;
  return undefined;
}

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const category = parseCategory(params.kategori);
  const topic = params.konu?.trim();

  let posts = category ? getBlogPostsByCategory(category) : getAllBlogPosts();
  if (topic) {
    posts = posts.filter((post) => post.topicId === topic);
  }

  const { days, sectors } = getBlogTopics();

  return (
    <BlogShell>
      <div className="max-w-3xl">
        <Badge className="border-emerald-200 bg-emerald-50 text-emerald-800">Blog</Badge>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">
          İnsanların aradığı özel gün ve meslek yazıları
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
          “Cuma mesajları”, “30 Ağustos özel postlar”, bayram kutlamaları ve sektörünüze özel
          Instagram rehberleri. Her konuda 2 SEO odaklı yazı — organik trafik için hazırlandı.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/blog">
            <Button variant={!category ? "default" : "secondary"} className="h-10">
              Tümü ({getAllBlogPosts().length})
            </Button>
          </Link>
          <Link href="/blog?kategori=ozel-gun">
            <Button variant={category === "ozel-gun" ? "default" : "secondary"} className="h-10">
              Özel günler
            </Button>
          </Link>
          <Link href="/blog?kategori=meslek">
            <Button variant={category === "meslek" ? "default" : "secondary"} className="h-10">
              Meslekler
            </Button>
          </Link>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-slate-900">Popüler arama konuları</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {days.slice(0, 12).map((day) => (
            <Link
              key={day.id}
              href={`/blog?kategori=ozel-gun&konu=${day.id}`}
              className="rounded-full border border-emerald-100 bg-white px-3 py-1.5 text-xs text-slate-700 transition hover:border-emerald-300 hover:text-emerald-800"
            >
              {day.keyword}
            </Link>
          ))}
          {sectors.slice(0, 8).map((sector) => (
            <Link
              key={sector.id}
              href={`/blog?kategori=meslek&konu=${sector.id}`}
              className="rounded-full border border-emerald-100 bg-white px-3 py-1.5 text-xs text-slate-700 transition hover:border-emerald-300 hover:text-emerald-800"
            >
              {sector.keyword}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-12 grid gap-5 sm:grid-cols-2">
        {posts.map((post) => (
          <BlogPostCard key={post.slug} post={post} />
        ))}
      </section>

      {posts.length === 0 ? (
        <p className="mt-10 text-center text-slate-600">Bu filtrede yazı bulunamadı.</p>
      ) : null}

      <section className="mt-14 rounded-[28px] border border-emerald-200 bg-gradient-to-br from-emerald-500 to-emerald-700 p-8 text-white sm:p-10">
        <h2 className="text-2xl font-bold sm:text-3xl">Yazıyı okudunuz, postu üretin</h2>
        <p className="mt-3 max-w-xl text-sm leading-6 text-white/90 sm:text-base">
          Marka logonuz ve renklerinizle özel gün görsellerini {APP_NAME} panelinde dakikalar içinde
          hazırlayın.
        </p>
        <Link href="/onboarding" className="mt-6 inline-block">
          <Button variant="secondary" className="h-12 bg-white px-6 text-emerald-700 hover:bg-emerald-50">
            Paketi başlat
          </Button>
        </Link>
      </section>
    </BlogShell>
  );
}
