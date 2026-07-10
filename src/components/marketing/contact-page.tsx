import type { Metadata } from "next";
import { Mail, MapPin } from "lucide-react";

import { ContactForm } from "@/components/marketing/contact-form";
import { MarketingPage, MarketingShell } from "@/components/marketing/marketing-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { APP_NAME, CONTACT_ADDRESS, CONTACT_EMAIL, getCanonicalAppUrl } from "@/lib/config";

export const metadata: Metadata = {
  title: `İletişim | ${APP_NAME}`,
  description: `${APP_NAME} iletişim: ${CONTACT_EMAIL} — ${CONTACT_ADDRESS}`,
  alternates: {
    canonical: `${getCanonicalAppUrl()}/iletisim`,
  },
};

export function ContactPageContent() {
  return (
    <MarketingShell>
      <MarketingPage>
        <div className="max-w-2xl">
          <Badge className="bg-emerald-100 text-emerald-800">İletişim</Badge>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Bize ulaşın
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Sorularınız, önerileriniz veya destek talepleriniz için formu doldurun. Telefon
            hattımız yok; e-posta ve form üzerinden dönüş yapıyoruz.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <Card className="border-emerald-100 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">E-posta</p>
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="mt-1 block text-sm text-emerald-700 hover:underline"
                  >
                    {CONTACT_EMAIL}
                  </a>
                </div>
              </div>
            </Card>

            <Card className="border-emerald-100 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Adres</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{CONTACT_ADDRESS}</p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="border-emerald-100 p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-slate-950">İletişim formu</h2>
            <p className="mt-1 text-sm text-slate-600">
              Ad, e-posta ve mesajınızı yazın — size geri dönelim.
            </p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </Card>
        </div>
      </MarketingPage>
    </MarketingShell>
  );
}
