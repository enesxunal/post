import { GenerationModeSetup } from "@/components/generation/generation-mode-setup";

export default async function OrderStartPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f8fffa_0%,_#f1f5f9_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <GenerationModeSetup orderId={orderId} />
    </main>
  );
}
