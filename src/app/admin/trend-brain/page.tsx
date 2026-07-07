import { TrendBrainPanel } from "@/components/admin/trend-brain-panel";
import { requireAdminUser } from "@/lib/admin/auth";

export default async function AdminTrendBrainPage() {
  await requireAdminUser("/admin/trend-brain");
  return <TrendBrainPanel />;
}
