import Link from "next/link";
import { Menu } from "lucide-react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/fiyatlandirma", label: "Fiyatlandırma" },
  { href: "/nasil-kullanilir", label: "Nasıl kullanılır" },
  { href: "/sss", label: "S.S.S." },
  { href: "/blog", label: "Blog" },
] as const;

type MarketingHeaderProps = {
  className?: string;
};

export function MarketingHeader({ className }: MarketingHeaderProps) {
  return (
    <header
      className={cn(
        "rounded-2xl border border-emerald-100/80 bg-white/95 shadow-sm backdrop-blur-md sm:rounded-full",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
        <BrandLogo size="sm" />

        <nav
          className="hidden items-center gap-0.5 lg:flex"
          aria-label="Ana menü"
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-800"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <details className="group relative lg:hidden">
            <summary className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full border border-emerald-100 bg-white text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700 [&::-webkit-details-marker]:hidden">
              <Menu className="h-4 w-4" />
              <span className="sr-only">Menüyü aç</span>
            </summary>
            <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-56 rounded-2xl border border-emerald-100 bg-white p-2 shadow-lg shadow-slate-200/60">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-800"
                >
                  {link.label}
                </Link>
              ))}
              <div className="my-1 h-px bg-emerald-50" />
              <Link
                href="/login"
                className="block rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-800"
              >
                Giriş Yap
              </Link>
            </div>
          </details>

          <Link
            href="/login"
            className="hidden text-sm font-medium text-slate-600 transition hover:text-emerald-700 lg:block"
          >
            Giriş
          </Link>
          <Link href="/onboarding">
            <Button className="h-9 px-4 text-sm sm:h-10 sm:px-5">Başla</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
