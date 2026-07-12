"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, Save } from "lucide-react";

import { ProfileAvatar } from "@/components/dashboard/profile-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogoInput } from "@/components/onboarding/logo-input";
import {
  isAcceptedLogoFile,
  LOGO_ACCEPT,
  readLogoFileAsDataUrl,
} from "@/lib/client/logo-file";
import { buildBrandBannerGradient } from "@/lib/profile/brand-gradient";

type ProfileSettingsProps = {
  projectId: string;
  fullName: string;
  email: string;
  businessName: string;
  primaryColor: string;
  brandColors: string[];
  avatarUrl?: string | null;
  logoUrl?: string | null;
  memberSince: string;
};

export function ProfileSettings({
  projectId,
  fullName: initialFullName,
  email,
  businessName: initialBusinessName,
  primaryColor: initialPrimaryColor,
  brandColors: initialBrandColors,
  avatarUrl: initialAvatarUrl,
  logoUrl: initialLogoUrl,
  memberSince,
}: ProfileSettingsProps) {
  const router = useRouter();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState(initialFullName);
  const [businessName, setBusinessName] = useState(initialBusinessName);
  const [primaryColor, setPrimaryColor] = useState(initialPrimaryColor);
  const [secondaryColor, setSecondaryColor] = useState(
    initialBrandColors[1] ?? initialBrandColors[0] ?? initialPrimaryColor,
  );
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl ?? initialLogoUrl ?? "");
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl ?? "");
  const [syncAvatarWithLogo, setSyncAvatarWithLogo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const bannerGradient = useMemo(
    () => buildBrandBannerGradient([primaryColor, secondaryColor], primaryColor),
    [primaryColor, secondaryColor],
  );

  const displayInitial = (businessName || fullName || "P").charAt(0).toUpperCase();

  async function handleAvatarFile(file: File) {
    if (!isAcceptedLogoFile(file)) {
      setError("PNG, JPG, SVG veya WebP formatında bir görsel seçin.");
      return;
    }
    const dataUrl = await readLogoFileAsDataUrl(file);
    setAvatarUrl(dataUrl);
    setError(null);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          fullName,
          brandName: businessName,
          primaryColor,
          brandColors: [primaryColor, secondaryColor].filter(Boolean),
          avatarUrl: avatarUrl || null,
          logoUrl: logoUrl || null,
          syncAvatarWithLogo,
        }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Kaydedilemedi");

      setMessage("Bilgileriniz güncellendi.");
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Kaydedilemedi");
    } finally {
      setSaving(false);
    }
  }

  function useLogoAsAvatar() {
    if (logoUrl) {
      setAvatarUrl(logoUrl);
      setSyncAvatarWithLogo(true);
    }
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-white">
        <div className="h-24" style={{ background: bannerGradient }} />
        <div className="relative px-5 pb-5">
          <div className="-mt-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <ProfileAvatar
                imageUrl={avatarUrl}
                fallbackInitial={displayInitial}
                brandColors={[primaryColor, secondaryColor]}
                primaryColor={primaryColor}
                className="h-20 w-20 border-4 border-white shadow-md"
                withGradientRing
              />
              <div>
                <p className="text-lg font-semibold text-slate-950">
                  {businessName || "İşletme adı"}
                </p>
                <p className="text-sm text-slate-500">{fullName || email}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                ref={avatarInputRef}
                type="file"
                accept={LOGO_ACCEPT}
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void handleAvatarFile(file);
                }}
              />
              <Button
                type="button"
                variant="outline"
                className="h-9"
                onClick={() => avatarInputRef.current?.click()}
              >
                <ImagePlus className="mr-2 h-4 w-4" />
                Profil fotoğrafı
              </Button>
              {logoUrl ? (
                <Button type="button" variant="outline" className="h-9" onClick={useLogoAsAvatar}>
                  Logoyu kullan
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-emerald-100 bg-white p-5">
          <p className="text-sm font-semibold text-slate-900">Hesap bilgileri</p>
          <div className="mt-4 space-y-3">
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-slate-700">Ad Soyad</span>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-slate-700">E-posta</span>
              <Input value={email} disabled />
            </label>
            <p className="text-xs text-slate-500">Üyelik: {memberSince}</p>
          </div>
        </div>

        <div className="rounded-3xl border border-emerald-100 bg-white p-5">
          <p className="text-sm font-semibold text-slate-900">Marka bilgileri</p>
          <div className="mt-4 space-y-3">
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-slate-700">İşletme adı</span>
              <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium text-slate-700">Ana renk</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-10 w-12 cursor-pointer rounded-lg border border-slate-200"
                  />
                  <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
                </div>
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block font-medium text-slate-700">İkinci renk</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="h-10 w-12 cursor-pointer rounded-lg border border-slate-200"
                  />
                  <Input
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                  />
                </div>
              </label>
            </div>
            <p className="text-xs text-slate-500">
              Üst banner ve profil alanı bu renklere göre oluşturulur.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-emerald-100 bg-white p-5">
        <p className="text-sm font-semibold text-slate-900">Marka logosu</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          Görsellerinize bindirilen logo. İlk kurulumda profil fotoğrafınız da bu logo olur; isterseniz
          ayrı bir profil fotoğrafı yükleyebilirsiniz.
        </p>
        <div className="mt-4">
          <LogoInput
            value={logoUrl}
            onChange={(value) => {
              setLogoUrl(value);
              setSyncAvatarWithLogo(false);
            }}
          />
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={syncAvatarWithLogo}
            onChange={(event) => setSyncAvatarWithLogo(event.target.checked)}
          />
          Logoyu kaydedince profil fotoğrafı da aynı olsun
        </label>
      </div>

      {error ? (
        <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </p>
      ) : null}

      <Button className="w-full sm:w-auto" onClick={() => void handleSave()} disabled={saving}>
        {saving ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Save className="mr-2 h-4 w-4" />
        )}
        Değişiklikleri kaydet
      </Button>
    </div>
  );
}
