import Link from "next/link";

import { MarketingHeader } from "@/components/marketing/marketing-header";
import { APP_NAME } from "@/lib/config";

export function BlogShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.14),transparent),linear-gradient(180deg,#f7fdf9_0%,#ffffff_50%,#f0fdf4_100%)]">
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
        <MarketingHeader />

        <main className="py-10 sm:py-14">{children}</main>

        <footer className="mb-8 rounded-[28px] border border-emerald-100 bg-white/80 px-6 py-8 text-sm text-slate-600">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} {APP_NAME} Blog — KOBİ özel gün ve sektör içerikleri.
            </p>
            <div className="flex flex-wrap gap-4">
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
              <Link href="/onboarding" className="hover:text-emerald-700">
                Post üret
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
