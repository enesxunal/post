import type { Metadata } from "next";

import { MarketingPage, MarketingShell } from "@/components/marketing/marketing-shell";
import { APP_NAME, CONTACT_ADDRESS, CONTACT_EMAIL, getCanonicalAppUrl } from "@/lib/config";

export const metadata: Metadata = {
  title: `Gizlilik Politikası | ${APP_NAME}`,
  alternates: { canonical: `${getCanonicalAppUrl()}/gizlilik` },
};

export default function PrivacyPage() {
  return (
    <MarketingShell>
      <MarketingPage>
        <h1 className="text-3xl font-bold text-slate-950">Gizlilik Politikası</h1>
        <p className="mt-4 text-sm text-slate-500">Son güncelleme: Temmuz 2026</p>

        <div className="prose prose-slate mt-8 max-w-none text-sm leading-7 text-slate-700">
          <p>
            {APP_NAME} (“biz”), www.poust.app üzerinden sunduğumuz hizmette kişisel verilerinizi
            6698 sayılı KVKK kapsamında işler.
          </p>

          <h2 className="mt-8 text-lg font-semibold text-slate-900">Topladığımız veriler</h2>
          <ul className="list-disc pl-5">
            <li>Hesap: ad, soyad, e-posta</li>
            <li>Marka: işletme adı, sektör, logo, renkler</li>
            <li>Ödeme: işlem durumu (kart bilgisi tarafımızda saklanmaz)</li>
            <li>İletişim formu: ad, e-posta, mesaj</li>
          </ul>

          <h2 className="mt-8 text-lg font-semibold text-slate-900">Kullanım amacı</h2>
          <p>Hesap açma, özel gün görselleri üretme, destek ve yasal yükümlülükler.</p>

          <h2 className="mt-8 text-lg font-semibold text-slate-900">Üçüncü taraflar</h2>
          <p>
            Altyapı: Supabase (veritabanı ve giriş), Vercel (barındırma), ödeme sağlayıcısı, yapay
            zeka görsel API’leri. Veriler yalnızca hizmet için paylaşılır.
          </p>

          <h2 className="mt-8 text-lg font-semibold text-slate-900">Haklarınız</h2>
          <p>
            Verilerinize erişim, düzeltme ve silme talebi için{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-emerald-700">
              {CONTACT_EMAIL}
            </a>{" "}
            adresine yazabilirsiniz.
          </p>

          <h2 className="mt-8 text-lg font-semibold text-slate-900">İletişim</h2>
          <p>
            {CONTACT_EMAIL}
            <br />
            {CONTACT_ADDRESS}
          </p>
        </div>
      </MarketingPage>
    </MarketingShell>
  );
}
