import { EftPaymentClient } from "@/components/payment/eft-payment-client";

export default async function EftPaymentPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  return <EftPaymentClient orderId={orderId} />;
}
