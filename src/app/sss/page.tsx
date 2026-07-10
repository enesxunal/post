import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { FaqList } from "@/components/marketing/faq-list";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { APP_NAME, getCanonicalAppUrl } from "@/lib/config";
import { faqItems } from "@/lib/marketing-guide";

export const metadata: Metadata = {
  title: `Sık sorulan sorular | ${APP_NAME}`,
  description:
    "Poust hakkında en çok sorulan sorular: ödeme, abonelik, görsel üretimi, revizyon, logo ve caption paketi.",
  alternates: {
    canonical: `${getCanonicalAppUrl()}/sss`,
  },
};

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.14),transparent),linear-gradient(180deg,#f7fdf9_0%,#ffffff_50%,#f0fdf4_100%)]">
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
        <MarketingHeader showHomeLink />

        <main className="py-10 sm:py-14">
          <div className="max-w-2xl">
            <Badge className="bg-emerald-100 text-emerald-800">S.S.S.</Badge>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Sık sorulan sorular
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Ödeme, üretim ve panel kullanımıyla ilgili kısa cevaplar. Daha ayrıntılı adım adım
              rehber için Nasıl Kullanılır sayfasına bakın.
            </p>
          </div>

          <div className="mt-10">
            <FaqList items={faqItems} grouped />
          </div>

          <Card className="mt-12 flex flex-col gap-4 border-emerald-100 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Adım adım görsel rehber
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Ekran örnekleriyle kurulumdan indirmeye kadar tüm akış.
              </p>
            </div>
            <Link href="/nasil-kullanilir">
              <Button className="h-11 w-full sm:w-auto">
                Nasıl kullanılır
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </Card>
        </main>
      </div>
    </div>
  );
}
