import { CreativeWorkshopLoader } from "@/components/generating/creative-workshop-loader";

export default async function GeneratingPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  return <CreativeWorkshopLoader orderId={orderId} />;
}
