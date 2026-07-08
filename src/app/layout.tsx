import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { APP_DOMAIN, APP_NAME, APP_URL } from "@/lib/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: `${APP_NAME} | KOBİ özel gün Instagram postları`,
    template: `%s | ${APP_NAME}`,
  },
  description:
    "Cuma mesajları, bayram postları, 30 Ağustos ve Cumhuriyet Bayramı görselleri: KOBİ'ler için markaya özel özel gün Instagram postlarını otomatik hazırlayan platform.",
  applicationName: APP_NAME,
  keywords: [
    "özel gün postu",
    "cuma mesajları",
    "30 ağustos özel postlar",
    "bayram postu",
    "instagram işletme postu",
    "kobi sosyal medya",
    "ramazan bayramı mesajı",
    APP_NAME,
  ],
  authors: [{ name: APP_NAME, url: APP_URL }],
  creator: APP_NAME,
  publisher: APP_NAME,
  icons: {
    icon: "/poust-favicon.png",
    apple: "/poust-favicon.png",
  },
  alternates: {
    canonical: APP_URL,
  },
  openGraph: {
    title: `${APP_NAME} | KOBİ özel gün Instagram postları`,
    description:
      "Marka logonuz ve renklerinizle özel gün sosyal medya postlarını dakikalar içinde üretin.",
    siteName: APP_NAME,
    url: APP_URL,
    locale: "tr_TR",
    type: "website",
    images: [{ url: "/poust-logo.png", alt: APP_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} | KOBİ özel gün postları`,
    description: "Cuma, bayram ve milli gün Instagram postlarını markanıza özel üretin.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
