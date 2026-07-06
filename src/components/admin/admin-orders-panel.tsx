"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

type PendingOrder = {
  id: string;
  amount_total: number;
  created_at: string;
  profiles?: { email?: string; full_name?: string } | null;
};

export function AdminOrdersPanel() {
  const [orders, setOrders] = useState<PendingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadOrders() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/orders/pending");
      const data = (await response.json()) as {
        orders?: PendingOrder[];
        error?: string;
      };
      if (!response.ok) throw new Error(data.error ?? "Liste alınamadı");
      setOrders(data.orders ?? []);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Hata oluştu");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function approve(orderId: string) {
    setApprovingId(orderId);
    try {
      const response = await fetch("/api/admin/orders/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Onay başarısız");
      await loadOrders();
    } catch (approveError) {
      setError(approveError instanceof Error ? approveError.message : "Onay hatası");
    } finally {
      setApprovingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Badge>Admin</Badge>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">EFT onay paneli</h1>
        <p className="mt-2 text-sm text-slate-600">
          Havale/EFT ile gelen ödemeleri onaylayın. Onaydan sonra kullanıcı tasarım üretebilir.
        </p>

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
            <p className="mt-2 text-xs">
              Admin olmak için Vercel&apos;de ADMIN_EMAILS env değişkenine e-postanızı ekleyin.
            </p>
          </div>
        ) : null}

        <div className="mt-6 space-y-3">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
          ) : orders.length === 0 ? (
            <Card className="p-8 text-center text-sm text-slate-500">
              Bekleyen EFT ödemesi yok.
            </Card>
          ) : (
            orders.map((order) => (
              <Card key={order.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-slate-900">
                    {order.profiles?.full_name || order.profiles?.email || "Kullanıcı"}
                  </p>
                  <p className="text-sm text-slate-500">{order.profiles?.email}</p>
                  <p className="mt-2 text-sm">
                    {formatCurrency(order.amount_total)} •{" "}
                    {new Date(order.created_at).toLocaleString("tr-TR")}
                  </p>
                  <p className="mt-1 font-mono text-xs text-slate-400">
                    {order.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
                <Button
                  onClick={() => approve(order.id)}
                  disabled={approvingId === order.id}
                  className="shrink-0"
                >
                  {approvingId === order.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Ödemeyi onayla
                    </>
                  )}
                </Button>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
