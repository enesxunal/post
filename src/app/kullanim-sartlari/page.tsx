import type { Metadata } from "next";

import { MarketingPage, MarketingShell } from "@/components/marketing/marketing-shell";
import { APP_NAME, CONTACT_EMAIL, getCanonicalAppUrl } from "@/lib/config";

export const metadata: Metadata = {
  title: `Kullanım Şartları | ${APP_NAME}`,
  alternates: { canonical: `${getCanonicalAppUrl()}/kullanim-sartlari` },
};

export default function TermsPage() {
  return (
    <MarketingShell>
      <MarketingPage>
        <h1 className="text-3xl font-bold text-slate-950">Kullanım Şartları</h1>
        <p className="mt-4 text-sm text-slate-500">Son güncelleme: Temmuz 2026</p>

        <div className="prose prose-slate mt-8 max-w-none text-sm leading-7 text-slate-700">
          <p>
            {APP_NAME} hizmetini kullanarak bu şartları kabul etmiş sayılırsınız.
          </p>

          <h2 className="mt-8 text-lg font-semibold text-slate-900">Hizmet</h2>
          <p>
            Tek seferlik paket ile özel gün sosyal medya görselleri üretirsiniz. Abonelik
            zorunluluğu yoktur. Görseller yapay zeka desteklidir; son kontrol kullanıcıya aittir.
          </p>

          <h2 className="mt-8 text-lg font-semibold text-slate-900">Hesap ve ödeme</h2>
          <p>
            Doğru bilgi vermekle yükümlüsünüz. Ödeme sonrası dijital içerik üretim hakkı tanınır;
            iade koşulları yasal mevzuat ve destek ekibimizle değerlendirilir.
          </p>

          <h2 className="mt-8 text-lg font-semibold text-slate-900">İçerik sorumluluğu</h2>
          <p>
            Paylaştığınız görseller ve metinlerden siz sorumlusunuz. Telif, marka ve platform
            kurallarına (Instagram, Meta vb.) uyum size aittir.
          </p>

          <h2 className="mt-8 text-lg font-semibold text-slate-900">Paylaşım takvimi</h2>
          <p>
            Takvim paketi hatırlatıcı ve paylaşım kolaylığı sağlar; otomatik Instagram yayını
            ayrı entegrasyon gerektirir ve her zaman manuel onay önerilir.
          </p>

          <h2 className="mt-8 text-lg font-semibold text-slate-900">İletişim</h2>
          <p>
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-emerald-700">
              {CONTACT_EMAIL}
            </a>
          </p>
        </div>
      </MarketingPage>
    </MarketingShell>
  );
}
