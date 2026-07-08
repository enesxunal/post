import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BlogPostCard } from "@/components/blog/blog-post-card";
import { BlogShell } from "@/components/blog/blog-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { APP_NAME, APP_URL } from "@/lib/config";
import {
  getAllBlogPosts,
  getBlogPostBySlug,
  getRelatedPosts,
} from "@/lib/blog/posts";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return getAllBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) {
    return { title: "Yazı bulunamadı" };
  }

  const url = `${APP_URL}/blog/${post.slug}`;
  const ogImages = post.coverImage
    ? [{ url: post.coverImage, alt: post.title }]
    : [{ url: "/poust-logo.png", alt: APP_NAME }];

  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: "article",
      locale: "tr_TR",
      publishedTime: post.publishedAt,
      siteName: APP_NAME,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) notFound();

  const related = getRelatedPosts(post);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    image: post.coverImage ? `${APP_URL}${post.coverImage}` : `${APP_URL}/poust-logo.png`,
    author: { "@type": "Organization", name: APP_NAME, url: APP_URL },
    publisher: {
      "@type": "Organization",
      name: APP_NAME,
      url: APP_URL,
      logo: { "@type": "ImageObject", url: `${APP_URL}/poust-logo.png` },
    },
    mainEntityOfPage: `${APP_URL}/blog/${post.slug}`,
    keywords: post.keywords.join(", "),
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: post.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <BlogShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

      <article className="mx-auto max-w-3xl">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="border-emerald-200 bg-emerald-50 text-emerald-800">
            {post.categoryLabel}
          </Badge>
          <Link
            href={`/blog?kategori=${post.category}&konu=${post.topicId}`}
            className="text-sm text-emerald-700 hover:underline"
          >
            {post.topicLabel}
          </Link>
        </div>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          {post.title}
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">{post.description}</p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
          <span>{post.publishedAt}</span>
          <span>{post.readingMinutes} dk okuma</span>
          <span>Anahtar kelime: {post.primaryKeyword}</span>
        </div>

        {post.coverImage ? (
          <div className="relative mt-8 aspect-square overflow-hidden rounded-[28px] border border-emerald-100 shadow-lg sm:aspect-[4/3]">
            <Image
              src={post.coverImage}
              alt={`${post.topicLabel} örnek poust postu`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 720px"
              priority
            />
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-2">
          {post.keywords.slice(0, 6).map((keyword) => (
            <span
              key={keyword}
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600"
            >
              {keyword}
            </span>
          ))}
        </div>

        <p className="mt-10 text-base leading-8 text-slate-700">{post.intro}</p>

        {post.sections.map((section) => (
          <section key={section.heading} className="mt-10">
            <h2 className="text-2xl font-semibold text-slate-950">{section.heading}</h2>
            <div className="mt-4 space-y-4">
              {section.body.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="text-base leading-8 text-slate-700">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}

        <section className="mt-12 rounded-3xl border border-emerald-100 bg-white p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-slate-950">Sık sorulanlar</h2>
          <div className="mt-5 space-y-5">
            {post.faq.map((item) => (
              <div key={item.question}>
                <h3 className="font-medium text-slate-900">{item.question}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-[28px] border border-emerald-200 bg-gradient-to-br from-emerald-500 to-emerald-700 p-8 text-white">
          <h2 className="text-2xl font-bold">{post.cta}</h2>
          <p className="mt-3 text-sm text-white/90">
            Logonuzu yükleyin, özel günleri seçin, markanıza özel postları üretin.
          </p>
          <Link href="/onboarding" className="mt-6 inline-block">
            <Button variant="secondary" className="h-12 bg-white px-6 text-emerald-700 hover:bg-emerald-50">
              Hemen başla
            </Button>
          </Link>
        </section>
      </article>

      {related.length > 0 ? (
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-slate-950">İlgili yazılar</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {related.map((item) => (
              <BlogPostCard key={item.slug} post={item} />
            ))}
          </div>
        </section>
      ) : null}
    </BlogShell>
  );
}
