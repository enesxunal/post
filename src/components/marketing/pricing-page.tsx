import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

import { MarketingHeader } from "@/components/marketing/marketing-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { APP_NAME, BASE_PACKAGE_PRICE, getCanonicalAppUrl } from "@/lib/config";
import { addonOptions, metrics } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: `Fiyatlandırma | ${APP_NAME}`,
  description:
    "Tek seferlik 299₺ ana paket: 30 özel gün postu, 10 revizyon, logo uyumu. Abonelik yok. Caption, story ve takvim eklentileri isteğe bağlı.",
  alternates: {
    canonical: `${getCanonicalAppUrl()}/fiyatlandirma`,
  },
};

const includedFeatures = [
  `${metrics.includedPosts} özel gün postu hakkı`,
  `${metrics.revisionCredits} revizyon kredisi`,
  "Logo ve marka rengi uyumu",
  "Sektöre özel görsel sahne",
  "Panelden tek tek üretim",
  "PNG indirme",
  "Abonelik yok — tek ödeme",
];

const pricingFaq = [
  {
    q: "Abonelik var mı?",
    a: "Hayır. Ana paketi bir kez ödersiniz; aylık veya otomatik yenileme yoktur.",
  },
  {
    q: "Ek paketler zorunlu mu?",
    a: "Hayır. Caption, story ve takvim tamamen isteğe bağlıdır; kurulum sırasında seçersiniz.",
  },
  {
    q: "Ödeme sonrası ne olur?",
    a: "Paneliniz açılır, 30 boş kart görünür. Her özel günü istediğiniz zaman Üret ile oluşturursunuz.",
  },
];

export function PricingPageContent() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.14),transparent),linear-gradient(180deg,#f7fdf9_0%,#ffffff_50%,#f0fdf4_100%)]">
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
        <MarketingHeader />

        <main className="py-10 sm:py-14">
          <div className="max-w-2xl">
            <Badge className="bg-emerald-100 text-emerald-800">Fiyatlandırma</Badge>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Tek ödeme, abonelik yok
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Küçük işletmeler için net fiyat: ana paket {formatCurrency(BASE_PACKAGE_PRICE)}.
              İsterseniz caption, story veya paylaşım takvimi ekleyebilirsiniz.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
            <Card className="flex flex-col border-emerald-200 bg-gradient-to-br from-emerald-500 to-emerald-700 p-8 text-white shadow-lg shadow-emerald-500/20">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/75">
                Ana paket
              </p>
              <p className="mt-4 text-5xl font-bold">{formatCurrency(BASE_PACKAGE_PRICE)}</p>
              <p className="mt-2 text-sm text-white/80">Tek seferlik • KDV dahil fiyatlandırma</p>

              <ul className="mt-8 flex-1 space-y-3">
                {includedFeatures.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-lime-200" />
                    {item}
                  </li>
                ))}
              </ul>

              <Link href="/onboarding" className="mt-8 block">
                <Button
                  variant="secondary"
                  className="h-12 w-full bg-white text-emerald-700 hover:bg-emerald-50"
                >
                  Paketi başlat
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </Card>

            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">İsteğe bağlı ek paketler</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Kurulum sırasında seçilir; sonradan da panelden eklenebilir.
                </p>
              </div>

              {addonOptions.map((addon) => (
                <Card
                  key={addon.key}
                  className="flex items-start justify-between gap-4 border-emerald-100 p-5"
                >
                  <div>
                    <p className="font-semibold text-slate-950">{addon.label}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{addon.description}</p>
                  </div>
                  <p className="shrink-0 text-lg font-bold text-emerald-700">
                    +{formatCurrency(addon.price)}
                  </p>
                </Card>
              ))}

              <Card className="border-dashed border-emerald-200 bg-emerald-50/40 p-5">
                <p className="text-sm font-medium text-emerald-900">Örnek toplam</p>
                <p className="mt-2 text-sm text-slate-600">
                  Ana paket + Caption + Story ={" "}
                  <strong className="text-slate-900">
                    {formatCurrency(
                      BASE_PACKAGE_PRICE +
                        (addonOptions.find((a) => a.key === "caption")?.price ?? 0) +
                        (addonOptions.find((a) => a.key === "story")?.price ?? 0),
                    )}
                  </strong>
                </p>
              </Card>
            </div>
          </div>

          <section className="mt-12">
            <h2 className="text-lg font-semibold text-slate-950">Sık sorulanlar</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {pricingFaq.map((item) => (
                <Card key={item.q} className="border-emerald-100 p-5">
                  <p className="font-semibold text-slate-950">{item.q}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.a}</p>
                </Card>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/sss">
                <Button variant="outline" className="h-11">
                  Tüm S.S.S.
                </Button>
              </Link>
              <Link href="/nasil-kullanilir">
                <Button variant="outline" className="h-11">
                  Nasıl kullanılır
                </Button>
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
