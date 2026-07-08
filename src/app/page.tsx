import type { Metadata } from "next";

import { LandingPage } from "@/components/marketing/landing-page";
import { APP_NAME, APP_URL } from "@/lib/config";

export const metadata: Metadata = {
  title: `${APP_NAME} | Cuma mesajları, bayram ve özel gün Instagram postları`,
  description:
    "KOBİ'ler için cuma mesajları, 30 Ağustos özel postlar, bayram kutlamaları ve meslek bazlı Instagram görsellerini markanıza özel üretin.",
  alternates: { canonical: APP_URL },
  openGraph: {
    title: `${APP_NAME} | Özel gün Instagram postları`,
    url: APP_URL,
    type: "website",
  },
};

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: APP_NAME,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: APP_URL,
    description:
      "KOBİ'ler için özel gün sosyal medya postlarını otomatik hazırlayan platform.",
    offers: {
      "@type": "Offer",
      price: "299",
      priceCurrency: "TRY",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingPage />
    </>
  );
}
