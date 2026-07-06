import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;
  const generatingHref = orderId
    ? `/orders/${orderId}/generating`
    : "/orders/paid/generating";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-lg space-y-4 text-center">
        <h1 className="text-3xl font-semibold text-slate-950">Ödeme başarılı</h1>
        <p className="text-sm leading-7 text-slate-600">
          Siparişiniz alındı. Şimdi markanıza özel postlarınız üretilecek.
        </p>
        <Link href={generatingHref}>
          <Button className="w-full">Postlarımı üret</Button>
        </Link>
      </Card>
    </div>
  );
}
