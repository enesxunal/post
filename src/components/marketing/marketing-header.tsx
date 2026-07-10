import Link from "next/link";

import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/nasil-kullanilir", label: "Nasıl kullanılır" },
  { href: "/sss", label: "S.S.S." },
  { href: "/blog", label: "Blog" },
] as const;

type MarketingHeaderProps = {
  showHomeLink?: boolean;
  blogSubNav?: boolean;
  className?: string;
};

export function MarketingHeader({
  showHomeLink = false,
  blogSubNav = false,
  className,
}: MarketingHeaderProps) {
  return (
    <header
      className={cn(
        "flex items-center justify-between gap-3 rounded-2xl border border-emerald-100/80 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-md sm:rounded-full sm:px-6",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-4 sm:gap-6">
        <BrandLogo />
        <nav className="hidden items-center gap-1 md:flex">
          {showHomeLink ? (
            <Link
              href="/"
              className="rounded-full px-3 py-1.5 text-sm text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700"
            >
              Ana sayfa
            </Link>
          ) : null}
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-1.5 text-sm text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700"
            >
              {link.label}
            </Link>
          ))}
          {blogSubNav ? (
            <>
              <span className="mx-1 h-4 w-px bg-emerald-100" aria-hidden />
              <Link
                href="/blog?kategori=ozel-gun"
                className="rounded-full px-3 py-1.5 text-sm text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-700"
              >
                Özel günler
              </Link>
              <Link
                href="/blog?kategori=meslek"
                className="rounded-full px-3 py-1.5 text-sm text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-700"
              >
                Meslekler
              </Link>
            </>
          ) : null}
        </nav>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <nav className="flex items-center gap-1 md:hidden">
          <Link
            href="/nasil-kullanilir"
            className="rounded-full px-2 py-1 text-xs font-medium text-slate-600 hover:text-emerald-700"
          >
            Nasıl
          </Link>
          <Link
            href="/sss"
            className="rounded-full px-2 py-1 text-xs font-medium text-slate-600 hover:text-emerald-700"
          >
            S.S.S.
          </Link>
          <Link
            href="/blog"
            className="rounded-full px-2 py-1 text-xs font-medium text-slate-600 hover:text-emerald-700"
          >
            Blog
          </Link>
        </nav>
        <Link
          href="/login"
          className="hidden text-sm text-slate-600 transition hover:text-emerald-700 sm:block"
        >
          Giriş Yap
        </Link>
        <Link href="/onboarding">
          <Button className="h-9 px-4 text-sm sm:h-10 sm:px-5">Başla</Button>
        </Link>
      </div>
    </header>
  );
}
