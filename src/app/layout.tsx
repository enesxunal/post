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
    default: `${APP_NAME} | KOBİ özel gün postları`,
    template: `%s | ${APP_NAME}`,
  },
  description:
    "Küçük ve orta ölçekli işletmeler için özel gün sosyal medya postlarını otomatik hazırlayan platform.",
  applicationName: APP_NAME,
  icons: {
    icon: "/poust-favicon.png",
    apple: "/poust-favicon.png",
  },
  openGraph: {
    title: APP_NAME,
    siteName: APP_NAME,
    url: APP_URL,
    locale: "tr_TR",
    type: "website",
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
