import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { GuideMockup } from "@/components/marketing/guide-mockup";
import { MarketingPage, MarketingShell } from "@/components/marketing/marketing-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { APP_NAME, MARKETING_START_HREF, getCanonicalAppUrl } from "@/lib/config";
import { howToSteps } from "@/lib/marketing-guide";

export const metadata: Metadata = {
  title: `Nasıl kullanılır | ${APP_NAME}`,
  description:
    "Poust ile özel gün postlarınızı adım adım nasıl hazırlayacağınızı öğrenin. Marka kurulumu, ödeme, panelden üretim ve indirme rehberi.",
  alternates: {
    canonical: `${getCanonicalAppUrl()}/nasil-kullanilir`,
  },
};

export default function HowToUsePage() {
  return (
    <MarketingShell>
      <MarketingPage>
        <div className="max-w-2xl">
          <Badge className="bg-emerald-100 text-emerald-800">Kullanım rehberi</Badge>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            6 kısa adımda postlarınızı hazırlayın
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Karmaşık değil. Önce markanızı tanıtırsınız, ödeme sonrası panelden her özel günü
            tek tek üretirsiniz. Aşağıdaki ekran örnekleri gerçek akışa yakın hazırlandı.
          </p>
        </div>

        <div className="mt-10 space-y-8">
          {howToSteps.map((step, index) => (
            <Card
              key={step.step}
              className="overflow-hidden border-emerald-100/80 p-0 shadow-sm"
            >
              <div className="grid gap-0 lg:grid-cols-2">
                <div
                  className={
                    index % 2 === 0
                      ? "order-2 border-t border-emerald-100 p-6 sm:p-8 lg:order-1 lg:border-t-0 lg:border-r"
                      : "order-2 border-t border-emerald-100 p-6 sm:p-8 lg:order-2 lg:border-t-0 lg:border-l"
                  }
                >
                  <GuideMockup variant={step.mockup} />
                </div>
                <div
                  className={
                    index % 2 === 0
                      ? "order-1 p-6 sm:p-8 lg:order-2"
                      : "order-1 p-6 sm:p-8 lg:order-1"
                  }
                >
                  <span className="text-sm font-bold text-emerald-600">Adım {step.step}</span>
                  <h2 className="mt-2 text-xl font-semibold text-slate-950 sm:text-2xl">
                    {step.title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{step.summary}</p>
                  <ul className="mt-4 space-y-2">
                    {step.tips.map((tip) => (
                      <li key={tip} className="flex gap-2 text-sm leading-6 text-slate-600">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="mt-12 border-0 bg-gradient-to-br from-emerald-500 to-green-700 p-8 text-white">
          <h2 className="text-2xl font-bold">Hazırsanız başlayalım</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-emerald-50/90">
            Önce giriş yapın veya üye olun; ardından kuruluma geçin.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href={MARKETING_START_HREF}>
              <Button
                variant="secondary"
                className="h-11 w-full bg-white text-emerald-700 hover:bg-emerald-50 sm:w-auto"
              >
                Paketimi başlat
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/sss">
              <Button
                variant="outline"
                className="h-11 w-full border-white/40 bg-transparent text-white hover:bg-white/10 sm:w-auto"
              >
                Sık sorulan sorular
              </Button>
            </Link>
          </div>
        </Card>
      </MarketingPage>
    </MarketingShell>
  );
}
