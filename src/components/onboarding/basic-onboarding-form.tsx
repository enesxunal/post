"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { BrandColorSelector } from "@/components/onboarding/brand-color-selector";
import { LogoInput } from "@/components/onboarding/logo-input";
import { PostFormatSelector } from "@/components/onboarding/post-format-selector";
import { SpecialDaySelector } from "@/components/onboarding/special-day-selector";
import { addonOptions, sectors } from "@/lib/mock-data";
import { BASE_PACKAGE_PRICE, MAX_SELECTED_DAYS } from "@/lib/config";
import { buildQuickPackageDays } from "@/lib/special-days-data";
import { saveOnboardingDraft } from "@/lib/onboarding/draft";
import { countSelectedSlots } from "@/lib/selected-days";
import { formatCurrency } from "@/lib/utils";
import type { AddonKey, PostFormat, SectorKey, SelectedDayEntry, VisualStyle } from "@/types/domain";

const schema = z.object({
  brandName: z.string().min(2, "İşletme adı gerekli."),
  logoUrl: z.string().optional(),
  brandColors: z.array(z.string()).min(1, "En az bir renk seçin.").max(3),
  sector: z.string().min(1, "Sektör seçin."),
});

type FormValues = z.infer<typeof schema>;

export function BasicOnboardingForm({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selectedAddons, setSelectedAddons] = useState<AddonKey[]>([]);
  const [postFormat, setPostFormat] = useState<PostFormat>("square");
  const [selectedDays, setSelectedDays] = useState<SelectedDayEntry[]>([]);
  const [daysInitializedForSector, setDaysInitializedForSector] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      brandName: "",
      logoUrl: "",
      brandColors: [],
      sector: "",
    },
  });

  const watched = useWatch({ control: form.control });

  const total = useMemo(() => {
    const addonsTotal = addonOptions
      .filter((addon) => selectedAddons.includes(addon.key))
      .reduce((sum, addon) => sum + addon.price, 0);
    return BASE_PACKAGE_PRICE + addonsTotal;
  }, [selectedAddons]);

  function toggleAddon(addon: AddonKey) {
    setSelectedAddons((current) =>
      current.includes(addon) ? current.filter((item) => item !== addon) : [...current, addon],
    );
  }

  const usedDaySlots = countSelectedSlots(selectedDays);
  const daysRemaining = MAX_SELECTED_DAYS - usedDaySlots;
  const canContinueDays = usedDaySlots === MAX_SELECTED_DAYS;

  function initializeRecommendedDays(sector: string) {
    if (daysInitializedForSector !== sector) {
      setSelectedDays(buildQuickPackageDays(sector as SectorKey, MAX_SELECTED_DAYS));
      setDaysInitializedForSector(sector);
    }
  }

  function buildDraft() {
    const values = form.getValues();

    return {
      brandName: values.brandName,
      logoUrl: values.logoUrl,
      brandColors: values.brandColors,
      sector: values.sector,
      visualStyle: "modern" as VisualStyle,
      selectedDays,
      purchasedAddons: selectedAddons,
      postFormat,
      formMode: "basic" as const,
    };
  }

  async function goCheckout() {
    const draft = buildDraft();

    try {
      const needsResponse = await fetch("/api/generation/needs-setup");
      if (needsResponse.ok) {
        const needsData = (await needsResponse.json()) as {
          needsSetup?: boolean;
          orderId?: string;
        };
        if (needsData.needsSetup) {
          const completeResponse = await fetch("/api/generation/complete-setup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(draft),
          });
          const completeData = (await completeResponse.json()) as {
            redirectUrl?: string;
            orderId?: string;
            error?: string;
          };
          if (completeResponse.ok && completeData.redirectUrl) {
            saveOnboardingDraft({
              ...draft,
              orderId: completeData.orderId ?? needsData.orderId,
            });
            router.push(completeData.redirectUrl);
            return;
          }
        }
      }
    } catch {
      // Ödeme akışına devam et
    }

    saveOnboardingDraft(draft);
    router.push("/checkout");
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_36%),linear-gradient(180deg,_#f8fffa_0%,_#ffffff_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Badge className="bg-emerald-100 text-emerald-800">Hızlı kurulum</Badge>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950">Birkaç bilgi, hazır paket</h1>
            <p className="mt-1 text-sm text-slate-600">
              30 popüler özel gün önerilir; isterseniz değiştirebilirsiniz.
            </p>
          </div>
          <button type="button" onClick={onBack} className="text-sm font-medium text-slate-500">
            Mod seçimine dön
          </button>
        </div>

        <Card className="p-6 sm:p-8">
          {step === 0 ? (
            <div className="space-y-5">
              <Field label="İşletme adı">
                <Input placeholder="Örn: Liva Güzellik" {...form.register("brandName")} />
              </Field>
              <Field label="Logo (isteğe bağlı)">
                <LogoInput
                  value={watched.logoUrl ?? ""}
                  onChange={(logoUrl) => form.setValue("logoUrl", logoUrl)}
                />
              </Field>
              <Field label="Marka renkleri">
                <BrandColorSelector
                  value={watched.brandColors ?? []}
                  onChange={(colors) => form.setValue("brandColors", colors, { shouldValidate: true })}
                />
              </Field>
              <Field label="Sektör">
                <div className="grid max-h-48 gap-2 overflow-y-auto sm:grid-cols-3">
                  {sectors.map((sector) => (
                    <button
                      key={sector.key}
                      type="button"
                      onClick={() => form.setValue("sector", sector.key, { shouldValidate: true })}
                      className={`rounded-2xl border px-3 py-2 text-sm transition ${
                        watched.sector === sector.key
                          ? "border-emerald-400 bg-emerald-50 font-medium"
                          : "border-emerald-100"
                      }`}
                    >
                      {sector.label}
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          ) : step === 1 ? (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">Özel günleriniz</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Sektörünüze göre en popüler 30 gün seçildi. İstemediğinizi çıkarıp yerine başka gün
                  ekleyebilirsiniz.
                </p>
              </div>
              <SpecialDaySelector
                selectedDays={selectedDays}
                onChange={setSelectedDays}
                sector={watched.sector as SectorKey | undefined}
                buildAutoComplete={buildQuickPackageDays}
                autoCompleteLabel="Önerilen 30 günü yükle"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <Card className="p-5">
                <CardTitle>Ana paket</CardTitle>
                <CardDescription className="mt-2">
                  {MAX_SELECTED_DAYS} özel gün, modern stil, 10 revizyon hakkı.
                </CardDescription>
                <p className="mt-4 text-3xl font-semibold">{formatCurrency(BASE_PACKAGE_PRICE)}</p>
              </Card>
              <PostFormatSelector value={postFormat} onChange={setPostFormat} />
              {addonOptions.map((addon) => (
                <Card key={addon.key} className="flex items-center justify-between gap-4 p-4">
                  <div>
                    <p className="font-medium">{addon.label}</p>
                    <p className="text-sm text-slate-600">{addon.description}</p>
                  </div>
                  <Checkbox
                    checked={selectedAddons.includes(addon.key)}
                    onCheckedChange={() => toggleAddon(addon.key)}
                  />
                </Card>
              ))}
              <Card className="bg-emerald-950 p-5 text-white">
                <p className="text-sm text-emerald-100">Toplam</p>
                <p className="mt-2 text-4xl font-semibold">{formatCurrency(total)}</p>
                <Button type="button" variant="secondary" className="mt-4 w-full" onClick={goCheckout}>
                  Güvenli Öde
                </Button>
              </Card>
            </div>
          )}

          {step === 1 && !canContinueDays && (
            <p className="mt-4 text-center text-sm text-amber-700">
              Devam etmek için {daysRemaining} gün daha seçin veya &quot;Önerilen 30 günü yükle&quot;
              butonunu kullanın.
            </p>
          )}

          <div className="mt-6 flex justify-between border-t border-emerald-100 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                if (step === 0) onBack();
                else setStep(step - 1);
              }}
            >
              Geri
            </Button>
            {step === 0 ? (
              <Button
                type="button"
                onClick={async () => {
                  const valid = await form.trigger();
                  if (!valid) return;
                  initializeRecommendedDays(form.getValues().sector);
                  setStep(1);
                }}
              >
                Özel günlere geç
              </Button>
            ) : step === 1 ? (
              <Button type="button" disabled={!canContinueDays} onClick={() => setStep(2)}>
                Pakete geç
              </Button>
            ) : (
              <Button type="button" variant="outline" onClick={goCheckout}>
                <Sparkles className="mr-2 h-4 w-4" />
                Ödemeye git
              </Button>
            )}
          </div>
        </Card>

        <p className="mt-4 text-center text-sm text-slate-500">
          Daha fazla kontrol ister misiniz?{" "}
          <button type="button" onClick={onBack} className="font-medium text-emerald-700">
            Detaylı kuruluma geçin
          </button>
        </p>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-800">{label}</span>
      {children}
    </label>
  );
}
