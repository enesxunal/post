import { GenerationTestPanel } from "@/components/admin/generation-test-panel";
import { listSpecialDays } from "@/lib/special-days/repository";

export default async function AdminGenerationTestPage() {
  const days = await listSpecialDays();
  return <GenerationTestPanel days={days} />;
}
