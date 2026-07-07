"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  CreditCard,
  ImagePlus,
  LayoutDashboard,
  Palette,
  Sparkles,
  TrendingUp,
  Wrench,
} from "lucide-react";

import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Genel Bakış", icon: LayoutDashboard },
  { href: "/admin/economics", label: "Muhasebe & Karlılık", icon: TrendingUp },
  { href: "/admin/orders", label: "EFT Onayları", icon: CreditCard },
  { href: "/admin/special-days", label: "Özel Günler & Metinler", icon: CalendarDays },
  { href: "/admin/generation-test", label: "Görsel Test", icon: ImagePlus },
  { href: "/admin/prompt-library", label: "Prompt Önizleme", icon: Sparkles },
  { href: "/admin/sector-modifiers", label: "Sektör Kuralları", icon: Wrench },
  { href: "/admin/style-modifiers", label: "Stil Kuralları", icon: Palette },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row lg:px-8">
        <aside className="lg:w-64 lg:shrink-0">
          <div className="rounded-[28px] border border-emerald-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
              Post Admin
            </p>
            <h2 className="mt-2 text-lg font-semibold text-slate-950">Yönetim Paneli</h2>
            <p className="mt-1 text-sm text-slate-500">
              Ödeme onayı, özel gün metinleri ve prompt ayarları.
            </p>

            <nav className="mt-6 space-y-1">
              {NAV_ITEMS.map((item) => {
                const active =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition",
                      active
                        ? "bg-emerald-50 text-emerald-800"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
