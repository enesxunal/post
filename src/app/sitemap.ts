import type { MetadataRoute } from "next";

import { getCanonicalAppUrl } from "@/lib/config";
import { getAllBlogPosts } from "@/lib/blog/posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const appUrl = getCanonicalAppUrl();
  const now = new Date();
  const posts = getAllBlogPosts();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: appUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${appUrl}/blog`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${appUrl}/onboarding`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${appUrl}/pricing`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${appUrl}/login`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  const blogRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${appUrl}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  return [...staticRoutes, ...blogRoutes];
}
