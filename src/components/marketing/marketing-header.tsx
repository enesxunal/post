import Link from "next/link";
import { Menu } from "lucide-react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { CONTACT_EMAIL, MARKETING_START_HREF } from "@/lib/config";

const navLinks = [
  { href: "/fiyatlandirma", label: "Fiyatlandırma" },
  { href: "/nasil-kullanilir", label: "Nasıl kullanılır" },
  { href: "/sss", label: "S.S.S." },
  { href: "/blog", label: "Blog" },
  { href: "/iletisim", label: "İletişim" },
] as const;

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-emerald-100/90 bg-white/95 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <BrandLogo size="sm" />

        <nav className="hidden items-center md:flex" aria-label="Ana menü">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2 text-sm font-medium text-slate-600 transition hover:text-emerald-700"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <details className="relative md:hidden">
            <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-xl border border-emerald-100 text-slate-600 [&::-webkit-details-marker]:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menü</span>
            </summary>
            <div className="absolute right-0 top-[calc(100%+0.5rem)] w-52 rounded-2xl border border-emerald-100 bg-white p-2 shadow-xl">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-emerald-50"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </details>

          <Link href={MARKETING_START_HREF}>
            <Button className="h-10 px-5 text-sm">Başla</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
