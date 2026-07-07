import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;
  const dashboardHref = orderId ? `/dashboard` : "/dashboard";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-lg space-y-4 text-center">
        <h1 className="text-3xl font-semibold text-slate-950">Ödeme başarılı</h1>
        <p className="text-sm leading-7 text-slate-600">
          Paketiniz hazır. Profilinizde boş kartlar görünecek — istediğiniz posta tıklayıp{" "}
          <strong>Üret</strong> ile tek tek görsel oluşturabilirsiniz.
        </p>
        <Link href={dashboardHref}>
          <Button className="w-full">Profilime git</Button>
        </Link>
      </Card>
    </div>
  );
}
