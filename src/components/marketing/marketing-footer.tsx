import Link from "next/link";

import { BrandLogo } from "@/components/brand/brand-logo";
import { APP_DOMAIN, APP_NAME, CONTACT_ADDRESS, CONTACT_EMAIL } from "@/lib/config";

export function MarketingFooter() {
  return (
    <footer className="mt-auto border-t border-emerald-100 bg-white/80">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <BrandLogo />
            <p className="mt-4 max-w-sm text-sm leading-6 text-slate-600">
              KOBİ&apos;ler için özel gün postlarını markanıza uygun şekilde hazırlayan sosyal medya
              tasarım platformu.
            </p>
            <p className="mt-3 text-sm text-slate-500">www.{APP_DOMAIN}</p>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900">Sayfalar</p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-slate-600">
              <Link href="/fiyatlandirma" className="hover:text-emerald-700">
                Fiyatlandırma
              </Link>
              <Link href="/nasil-kullanilir" className="hover:text-emerald-700">
                Nasıl kullanılır
              </Link>
              <Link href="/sss" className="hover:text-emerald-700">
                S.S.S.
              </Link>
              <Link href="/blog" className="hover:text-emerald-700">
                Blog
              </Link>
              <Link href="/iletisim" className="hover:text-emerald-700">
                İletişim
              </Link>
              <Link href="/gizlilik" className="hover:text-emerald-700">
                Gizlilik
              </Link>
              <Link href="/kullanim-sartlari" className="hover:text-emerald-700">
                Kullanım şartları
              </Link>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900">İletişim</p>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <p>
                <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-emerald-700">
                  {CONTACT_EMAIL}
                </a>
              </p>
              <p className="leading-6">{CONTACT_ADDRESS}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-emerald-100 pt-4 text-sm text-slate-500">
          © {new Date().getFullYear()} {APP_NAME}. Tüm hakları saklıdır.
        </div>
      </div>
    </footer>
  );
}
