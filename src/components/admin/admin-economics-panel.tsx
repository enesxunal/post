import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { getAdminEconomicsReport, statusLabel } from "@/lib/admin/economics";
import { formatCurrency } from "@/lib/utils";

function MarginBadge({ value }: { value: number | null }) {
  if (value === null) return <span className="text-slate-400">—</span>;
  const tone =
    value >= 70 ? "bg-emerald-100 text-emerald-800" : value >= 40 ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800";
  return <Badge className={tone}>{value.toFixed(1)}%</Badge>;
}

function StatusBadge({ status }: { status: string }) {
  const label = statusLabel(status);
  const tone =
    status === "paid"
      ? "bg-emerald-100 text-emerald-800"
      : status === "pending"
        ? "bg-amber-100 text-amber-800"
        : "bg-slate-100 text-slate-600";
  return <Badge className={tone}>{label}</Badge>;
}

export async function AdminEconomicsPanel() {
  let report;
  let error: string | null = null;

  try {
    report = await getAdminEconomicsReport();
  } catch (loadError) {
    error = loadError instanceof Error ? loadError.message : "Rapor yüklenemedi";
  }

  if (error || !report) {
    return (
      <div>
        <h1 className="text-3xl font-semibold text-slate-950">Muhasebe & Karlılık</h1>
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      </div>
    );
  }

  const { summary, costBreakdownTry, unitCosts, qualityCheckEnabled, orders, unlinkedProjects } =
    report;

  return (
    <div>
      <Badge>İç muhasebe</Badge>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
        Muhasebe & Karlılık
      </h1>
      <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
        Satış tutarları gerçek siparişlerden gelir. AI maliyetleri tahminidir — OpenAI görsel
        üretimi ve Gemini caption kullanımına göre hesaplanır. Gerçek faturayı API panellerinden
        doğrulayın.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Toplam ciro (ödenen)" value={formatCurrency(summary.totalRevenueTry)} highlight />
        <MetricCard label="Bekleyen tahsilat" value={formatCurrency(summary.pendingRevenueTry)} />
        <MetricCard label="Tahmini AI maliyeti" value={formatCurrency(summary.estimatedAiCostTry)} />
        <MetricCard
          label="Tahmini brüt kar"
          value={formatCurrency(summary.estimatedGrossProfitTry)}
          sub={summary.marginPercent !== null ? `Marj %${summary.marginPercent}` : undefined}
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Ödenen sipariş" value={String(summary.paidOrderCount)} />
        <MetricCard label="Bekleyen sipariş" value={String(summary.pendingOrderCount)} />
        <MetricCard
          label="Üretilen görsel"
          value={String(summary.totalFeedImages)}
          sub={`${summary.readyJobs} hazır post`}
        />
        <MetricCard
          label="Caption / Story"
          value={`${summary.totalCaptions} / ${summary.totalStories}`}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>Maliyet dağılımı (tahmini)</CardTitle>
          <CardDescription className="mt-2">
            Kur: 1 USD = {unitCosts.usdTry} ₺ · Kalite kontrolü{" "}
            {qualityCheckEnabled ? "açık" : "kapalı"}
          </CardDescription>
          <dl className="mt-5 space-y-3 text-sm">
            <CostRow
              label="Görsel üretimi (OpenAI)"
              detail={`${summary.totalFeedImages} istek × ~${(unitCosts.openaiImageUsd * unitCosts.usdTry).toFixed(2)} ₺`}
              value={formatCurrency(costBreakdownTry.images)}
            />
            <CostRow
              label="Story üretimi"
              detail={`${summary.totalStories} istek`}
              value={formatCurrency(costBreakdownTry.stories)}
            />
            <CostRow
              label="Caption (Gemini)"
              detail={`${summary.totalCaptions} istek`}
              value={formatCurrency(costBreakdownTry.captions)}
            />
            <CostRow
              label="Kalite kontrolü (Gemini)"
              detail={qualityCheckEnabled ? "Aktif" : "Kapalı — 0 ₺"}
              value={formatCurrency(costBreakdownTry.qualityChecks)}
            />
          </dl>
        </Card>

        <Card>
          <CardTitle>Birim maliyet varsayımları</CardTitle>
          <CardDescription className="mt-2">
            Vercel env ile güncellenebilir (ADMIN_COST_* ve ADMIN_USD_TRY).
          </CardDescription>
          <dl className="mt-5 space-y-3 text-sm">
            <CostRow
              label="OpenAI görsel"
              detail="gpt-image-1.5 tahmini"
              value={`$${unitCosts.openaiImageUsd}`}
            />
            <CostRow label="OpenAI story" detail="Dikey yeniden üretim" value={`$${unitCosts.openaiStoryUsd}`} />
            <CostRow label="Gemini caption" detail="Post başına" value={`$${unitCosts.geminiCaptionUsd}`} />
            <CostRow label="Gemini QC" detail="Görsel başına" value={`$${unitCosts.geminiQcUsd}`} />
          </dl>
        </Card>
      </div>

      <Card className="mt-8 overflow-hidden p-0">
        <div className="border-b border-emerald-100 px-6 py-5">
          <CardTitle>Siparişler</CardTitle>
          <CardDescription className="mt-1">
            Her satırda satış tutarı, tahmini AI maliyeti ve kar marjı.
          </CardDescription>
        </div>

        {orders.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-slate-500">Henüz sipariş yok.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Tarih</th>
                  <th className="px-4 py-3 font-medium">Müşteri</th>
                  <th className="px-4 py-3 font-medium">Paket</th>
                  <th className="px-4 py-3 font-medium">Satış</th>
                  <th className="px-4 py-3 font-medium">AI maliyeti</th>
                  <th className="px-4 py-3 font-medium">Tahmini kar</th>
                  <th className="px-4 py-3 font-medium">Marj</th>
                  <th className="px-4 py-3 font-medium">Post</th>
                  <th className="px-4 py-3 font-medium">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-50">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-emerald-50/40">
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {new Date(order.createdAt).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{order.customerName}</p>
                      <p className="text-xs text-slate-500">{order.customerEmail}</p>
                      {order.projectBrand ? (
                        <p className="mt-1 text-xs text-emerald-700">{order.projectBrand}</p>
                      ) : null}
                    </td>
                    <td className="max-w-[180px] px-4 py-3 text-slate-600">
                      <p>{order.packageLabel}</p>
                      <p className="mt-1 text-xs text-slate-400">{order.paymentProvider}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                      {formatCurrency(order.amountTotal)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {formatCurrency(order.estimatedAiCostTry)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
                      {order.estimatedProfitTry !== null
                        ? formatCurrency(order.estimatedProfitTry)
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <MarginBadge value={order.marginPercent} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {order.readyJobs}/{order.jobCount}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {unlinkedProjects.length > 0 ? (
        <Card className="mt-8">
          <CardTitle>Siparişe bağlı olmayan projeler</CardTitle>
          <CardDescription className="mt-2">
            Test veya eski kayıtlar — AI maliyeti yine hesaplanır ama ciroya dahil değildir.
          </CardDescription>
          <div className="mt-4 space-y-2">
            {unlinkedProjects.map((project) => (
              <div
                key={project.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-emerald-100 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-slate-900">{project.brandName}</p>
                  <p className="text-xs text-slate-500">
                    {project.jobCount} post · {new Date(project.createdAt).toLocaleDateString("tr-TR")}
                  </p>
                </div>
                <p className="font-medium text-slate-700">
                  Tahmini AI: {formatCurrency(project.estimatedAiCostTry)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}

function MetricCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? "border-emerald-200 bg-emerald-50/50" : undefined}>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
      {sub ? <p className="mt-1 text-xs text-slate-500">{sub}</p> : null}
    </Card>
  );
}

function CostRow({ label, detail, value }: { label: string; detail: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <dt className="font-medium text-slate-900">{label}</dt>
        <dd className="text-xs text-slate-500">{detail}</dd>
      </div>
      <dd className="shrink-0 font-medium text-slate-800">{value}</dd>
    </div>
  );
}
