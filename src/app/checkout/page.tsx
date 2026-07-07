import { CheckoutSummary } from "@/components/checkout/checkout-summary";
import { requireSessionUser } from "@/lib/supabase/auth";

export default async function CheckoutPage() {
  await requireSessionUser("/checkout");
  return <CheckoutSummary />;
}
