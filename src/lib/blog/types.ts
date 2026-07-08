export type BlogCategory = "ozel-gun" | "meslek";

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  primaryKeyword: string;
  category: BlogCategory;
  categoryLabel: string;
  /** özel gün id veya sektör key */
  topicId: string;
  topicLabel: string;
  publishedAt: string;
  readingMinutes: number;
  intro: string;
  sections: Array<{ heading: string; body: string[] }>;
  faq: Array<{ question: string; answer: string }>;
  cta: string;
  /** Opsiyonel kapak görseli (public path) */
  coverImage?: string;
};
