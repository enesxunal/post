import Link from "next/link";
import { ArrowRight, CalendarDays, CreditCard, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { listSpecialDays } from "@/lib/special-days/repository";
import { listPendingEftOrders } from "@/lib/orders/service";
import { sectorModifiers, styles } from "@/lib/mock-data";

export async function AdminDashboard() {
  const [days, pendingOrders] = await Promise.all([
    listSpecialDays(),
    listPendingEftOrders().catch(() => []),
  ]);

  return (
    <div>
      <Badge>Admin</Badge>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Genel Bakış</h1>
      <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
        Post üretiminde kullanılan özel gün metinlerini buradan düzenleyebilir, EFT ödemelerini
        onaylayabilirsiniz.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Özel gün" value={String(days.length)} />
        <MetricCard label="Bekleyen EFT" value={String(pendingOrders.length)} highlight />
        <MetricCard label="Sektör kuralı" value={String(sectorModifiers.length)} />
        <MetricCard label="Stil kuralı" value={String(styles.length)} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <QuickLinkCard
          href="/admin/special-days"
          icon={CalendarDays}
          title="Özel Günler & Metinler"
          description="Caption fikirleri, başlıklar, görsel yön ve AI prompt şablonlarını düzenleyin."
        />
        <QuickLinkCard
          href="/admin/orders"
          icon={CreditCard}
          title="EFT Onayları"
          description="Havale ile gelen ödemeleri onaylayın; kullanıcı üretime başlayabilsin."
        />
        <QuickLinkCard
          href="/admin/prompt-library"
          icon={Sparkles}
          title="Prompt Önizleme"
          description="Seçili marka bağlamında AI'ya giden görsel promptunu test edin."
        />
      </div>

      <Card className="mt-8">
        <CardTitle>Son düzenlenen özel günler</CardTitle>
        <CardDescription className="mt-2">
          Üretimde kullanılan metinler buradan yönetilir. Detaylı düzenleme için özel günler
          sayfasına gidin.
        </CardDescription>
        <div className="mt-5 space-y-3">
          {days.slice(0, 5).map((day) => (
            <div
              key={day.id}
              className="rounded-2xl border border-emerald-100 bg-white px-4 py-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-900">{day.name}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">{day.culturalContext}</p>
                </div>
                <Badge>{day.category}</Badge>
              </div>
            </div>
          ))}
        </div>
        <Link
          href="/admin/special-days"
          className="mt-5 inline-flex h-11 items-center justify-center rounded-full border border-emerald-200 bg-white px-5 text-sm font-semibold text-slate-900 transition hover:bg-emerald-50"
        >
          Tümünü düzenle
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Card>
    </div>
  );
}

function MetricCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? "border-amber-200 bg-amber-50/60" : undefined}>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
    </Card>
  );
}

function QuickLinkCard({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <Card className="flex flex-col">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
        <Icon className="h-5 w-5" />
      </div>
      <CardTitle className="mt-4">{title}</CardTitle>
      <CardDescription className="mt-2 flex-1">{description}</CardDescription>
      <Link
        href={href}
        className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-full border border-emerald-200 bg-white px-5 text-sm font-semibold text-slate-900 transition hover:bg-emerald-50"
      >
        Aç
      </Link>
    </Card>
  );
}
