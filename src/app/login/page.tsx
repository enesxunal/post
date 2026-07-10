import { Suspense } from "react";

import { AuthForm } from "@/components/auth/auth-form";
import { MarketingPage, MarketingShell } from "@/components/marketing/marketing-shell";

export default function LoginPage() {
  return (
    <MarketingShell>
      <MarketingPage>
        <div className="mx-auto max-w-md space-y-4 py-6">
          <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-white" />}>
            <AuthForm />
          </Suspense>
        </div>
      </MarketingPage>
    </MarketingShell>
  );
}
