import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { requireSessionUser } from "@/lib/supabase/auth";

export default async function OnboardingPage() {
  await requireSessionUser("/onboarding");
  return <OnboardingWizard />;
}
