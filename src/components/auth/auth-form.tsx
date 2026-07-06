"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { SUPABASE_SETUP_HINT } from "@/lib/supabase/env";
import { cn } from "@/lib/utils";

const signupSchema = z.object({
  firstName: z.string().min(2, "Ad gerekli."),
  lastName: z.string().min(2, "Soyad gerekli."),
  email: z.email("Gecerli bir e-posta girin."),
  password: z
    .string()
    .min(8, "Sifre en az 8 karakter olmali.")
    .regex(/[A-Za-z]/, "Sifrede en az 1 harf olmali.")
    .regex(/[0-9]/, "Sifrede en az 1 rakam olmali."),
});

const loginSchema = z.object({
  email: z.email("Gecerli bir e-posta girin."),
  password: z.string().min(1, "Sifre gerekli."),
});

type SignupValues = z.infer<typeof signupSchema>;
type LoginValues = z.infer<typeof loginSchema>;
type AuthMode = "signup" | "login";

export function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/dashboard";
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [mode, setMode] = useState<AuthMode>("login");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const signupForm = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function handleSignup(values: SignupValues) {
    setFeedback(null);

    if (!supabase) {
      setFeedback({
        type: "error",
        message: SUPABASE_SETUP_HINT,
      });
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
        data: {
          full_name: `${values.firstName} ${values.lastName}`.trim(),
          first_name: values.firstName,
          last_name: values.lastName,
        },
      },
    });

    if (error) {
      setFeedback({ type: "error", message: error.message });
      return;
    }

    if (data.user?.id) {
      await supabase.from("profiles").upsert(
        {
          id: data.user.id,
          email: values.email,
          full_name: `${values.firstName} ${values.lastName}`.trim(),
        },
        { onConflict: "id" },
      );
    }

    setFeedback({
      type: "success",
      message: "Hesabiniz olusturuldu. E-posta onayi aciksa maile gelen linki tiklayin.",
    });
    signupForm.reset();
  }

  async function handleLogin(values: LoginValues) {
    setFeedback(null);

    if (!supabase) {
      setFeedback({
        type: "error",
        message: SUPABASE_SETUP_HINT,
      });
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      setFeedback({ type: "error", message: error.message });
      return;
    }

    router.push(nextPath);
    router.refresh();
  }

  async function handleGoogleLogin() {
    setIsGoogleLoading(true);
    setFeedback(null);

    if (!supabase) {
      setFeedback({
        type: "error",
        message: "Google girisi icin once Supabase ve Google provider ayarlarini eklemelisin.",
      });
      setIsGoogleLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
      },
    });

    if (error) {
      setFeedback({ type: "error", message: error.message });
      setIsGoogleLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md space-y-5">
      <Badge>{mode === "signup" ? "Hizli uye ol" : "Hizli giris"}</Badge>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
          {mode === "signup" ? "Dakikalar icinde basla" : "Panele giris yap"}
        </h1>
        <p className="mt-2 text-sm leading-7 text-slate-600">
          Mail, ad soyad ve sifre ile hizlica hesap olusturabilir veya Google ile tek tikla giris yapabilirsiniz.
        </p>
        {!supabase ? (
          <p className="mt-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">
            Supabase bağlantısı bulunamadı. Localhost’ta <strong>.env.local</strong> dosyası
            gerekir; canlı sitede env ekledikten sonra yeniden deploy et.
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-full border border-emerald-100 bg-emerald-50 p-1">
        <ModeButton
          active={mode === "signup"}
          onClick={() => setMode("signup")}
          label="Uye Ol"
        />
        <ModeButton
          active={mode === "login"}
          onClick={() => setMode("login")}
          label="Giris Yap"
        />
      </div>

      {mode === "signup" ? (
        <form className="space-y-4" onSubmit={signupForm.handleSubmit(handleSignup)}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ad" error={signupForm.formState.errors.firstName?.message}>
              <Input placeholder="Adınız" autoComplete="given-name" {...signupForm.register("firstName")} />
            </Field>
            <Field label="Soyad" error={signupForm.formState.errors.lastName?.message}>
              <Input placeholder="Soyadınız" autoComplete="family-name" {...signupForm.register("lastName")} />
            </Field>
          </div>
          <Field label="E-posta" error={signupForm.formState.errors.email?.message}>
            <Input type="email" placeholder="ornek@mail.com" {...signupForm.register("email")} />
          </Field>
          <Field label="Sifre" error={signupForm.formState.errors.password?.message}>
            <Input type="password" placeholder="En az 8 karakter" {...signupForm.register("password")} />
          </Field>
          <Button className="w-full" disabled={signupForm.formState.isSubmitting}>
            {signupForm.formState.isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Uye Ol"
            )}
          </Button>
        </form>
      ) : (
        <form className="space-y-4" onSubmit={loginForm.handleSubmit(handleLogin)}>
          <Field label="E-posta" error={loginForm.formState.errors.email?.message}>
            <Input type="email" placeholder="ornek@mail.com" {...loginForm.register("email")} />
          </Field>
          <Field label="Sifre" error={loginForm.formState.errors.password?.message}>
            <Input type="password" placeholder="Sifreniz" {...loginForm.register("password")} />
          </Field>
          <Button className="w-full" disabled={loginForm.formState.isSubmitting}>
            {loginForm.formState.isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Giris Yap"
            )}
          </Button>
        </form>
      )}

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-emerald-100" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-xs text-slate-400">veya</span>
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={handleGoogleLogin}
        disabled={isGoogleLoading}
      >
        {isGoogleLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Mail className="mr-2 h-4 w-4" />
        )}
        Google ile devam et
      </Button>

      {feedback ? (
        <div
          className={cn(
            "rounded-2xl border px-4 py-3 text-sm",
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700",
          )}
        >
          {feedback.message}
        </div>
      ) : null}
    </Card>
  );
}

function ModeButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-4 py-2 text-sm font-medium transition",
        active ? "bg-white text-slate-950" : "text-slate-500",
      )}
    >
      {label}
    </button>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-800">{label}</span>
      {children}
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </label>
  );
}
