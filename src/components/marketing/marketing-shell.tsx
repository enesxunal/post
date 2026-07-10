import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.14),transparent),linear-gradient(180deg,#f7fdf9_0%,#ffffff_50%,#f0fdf4_100%)]">
      <MarketingHeader />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}

/** İçerik sayfaları için ortak genişlik ve boşluk */
export function MarketingPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">{children}</div>
  );
}
