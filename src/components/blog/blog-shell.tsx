import Link from "next/link";

import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/config";

export function BlogShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.14),transparent),linear-gradient(180deg,#f7fdf9_0%,#ffffff_50%,#f0fdf4_100%)]">
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between rounded-2xl border border-emerald-100/80 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-md sm:rounded-full sm:px-6">
          <div className="flex items-center gap-6">
            <BrandLogo />
            <nav className="hidden items-center gap-4 text-sm text-slate-600 md:flex">
              <Link href="/blog" className="hover:text-emerald-700">
                Blog
              </Link>
              <Link href="/blog?kategori=ozel-gun" className="hover:text-emerald-700">
                Özel günler
              </Link>
              <Link href="/blog?kategori=meslek" className="hover:text-emerald-700">
                Meslekler
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="hidden text-sm text-slate-600 hover:text-emerald-700 sm:block">
              Ana sayfa
            </Link>
            <Link href="/onboarding">
              <Button className="h-10 px-5 text-sm">Paket başlat</Button>
            </Link>
          </div>
        </header>

        <main className="py-10 sm:py-14">{children}</main>

        <footer className="mb-8 rounded-[28px] border border-emerald-100 bg-white/80 px-6 py-8 text-sm text-slate-600">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} {APP_NAME} Blog — KOBİ özel gün ve sektör içerikleri.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/blog" className="hover:text-emerald-700">
                Tüm yazılar
              </Link>
              <Link href="/onboarding" className="hover:text-emerald-700">
                Post üret
              </Link>
              <Link href="/" className="hover:text-emerald-700">
                Ana sayfa
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
