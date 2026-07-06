import { Suspense } from "react";
import Link from "next/link";

import { AuthForm } from "@/components/auth/auth-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md space-y-4">
        <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-white" />}>
          <AuthForm />
        </Suspense>
        <Link href="/" className="block text-center text-sm text-slate-500">
          Anasayfaya dön
        </Link>
      </div>
    </div>
  );
}
