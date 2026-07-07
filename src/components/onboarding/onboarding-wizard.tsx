"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronRight, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BasicOnboardingForm } from "@/components/onboarding/basic-onboarding-form";
import { BrandColorSelector } from "@/components/onboarding/brand-color-selector";
import { DayCustomizationPanel } from "@/components/onboarding/day-customization-panel";
import { OnboardingModePicker } from "@/components/onboarding/onboarding-mode-picker";
import { SpecialDaySelector } from "@/components/onboarding/special-day-selector";
import {
  addonOptions,
  sectors,
  styles,
} from "@/lib/mock-data";
import { getDefaultSelectedDays, getSpecialDayById } from "@/lib/special-days-data";
import { countSelectedSlots } from "@/lib/selected-days";
import type { SelectedDayEntry } from "@/types/domain";
import {
  BASE_PACKAGE_PRICE,
  MAX_SELECTED_DAYS,
} from "@/lib/config";
import { formatCurrency } from "@/lib/utils";
import {
  saveOnboardingDraft,
  type DayCustomization,
  type OnboardingFormMode,
} from "@/lib/onboarding/draft";
import { PostFormatSelector } from "@/components/onboarding/post-format-selector";
import type { AddonKey, PostFormat, SectorKey, VisualStyle } from "@/types/domain";

const schema = z.object({
  brandName: z.string().min(2, "İşletme adı gerekli."),
  logoUrl: z.string().optional(),
  brandColors: z
    .array(z.string())
    .min(1, "En az bir marka rengi seçin.")
    .max(3, "En fazla 3 renk seçebilirsiniz."),
  sector: z.string().min(1, "Sektör seçin."),
  customSector: z.string().optional(),
  brandDescription: z.string().optional(),
  visualStyle: z.string().min(1, "Stil seçin."),
});

type FormValues = z.infer<typeof schema>;

const steps = [
  "Marka bilgileri",
  "Sektör",
  "Marka açıklaması",
  "Stil",
  "Özel günler",
  "Paket özeti",
];

export function OnboardingWizard() {
  const [mode, setMode] = useState<OnboardingFormMode | null>(null);

  if (!mode) {
    return <OnboardingModePicker onSelect={setMode} />;
  }

  if (mode === "basic") {
    return <BasicOnboardingForm onBack={() => setMode(null)} />;
  }

  return <DetailedOnboardingWizard onBack={() => setMode(null)} />;
}

function DetailedOnboardingWizard({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [selectedDays, setSelectedDays] = useState<SelectedDayEntry[]>(getDefaultSelectedDays());
  const [selectedAddons, setSelectedAddons] = useState<AddonKey[]>([]);
  const [postFormat, setPostFormat] = useState<PostFormat>("square");
  const [styleCustomNotes, setStyleCustomNotes] = useState("");
  const [dayCustomizations, setDayCustomizations] = useState<Record<string, DayCustomization>>({});

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      brandName: "",
      logoUrl: "",
      brandColors: [] as string[],
      sector: "",
      customSector: "",
      brandDescription: "",
      visualStyle: "modern",
    },
  });

  const watched = useWatch({ control: form.control });

  const total = useMemo(() => {
    const addonsTotal = addonOptions
      .filter((addon) => selectedAddons.includes(addon.key))
      .reduce((sum, addon) => sum + addon.price, 0);
    return BASE_PACKAGE_PRICE + addonsTotal;
  }, [selectedAddons]);

  const stepFields: (keyof FormValues)[][] = [
    ["brandName", "brandColors"],
    ["sector"],
    ["brandDescription"],
    ["visualStyle"],
    [],
    [],
  ];

  const usedDaySlots = countSelectedSlots(selectedDays);
  const daysRemaining = MAX_SELECTED_DAYS - usedDaySlots;
  const canContinue = step !== 4 || usedDaySlots === MAX_SELECTED_DAYS;

  function toggleAddon(addon: AddonKey) {
    setSelectedAddons((current) =>
      current.includes(addon)
        ? current.filter((item) => item !== addon)
        : [...current, addon],
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_36%),linear-gradient(180deg,_#f8fffa_0%,_#ffffff_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">
              Detaylı kurulum • {steps[step]}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              Markanız için akıcı kurulum
            </h1>
          </div>
          <div className="flex flex-col items-end gap-1 text-sm">
            <Link href="/" className="font-medium text-slate-500">
              Landing sayfasına dön
            </Link>
            <button type="button" onClick={onBack} className="font-medium text-violet-600">
              Mod seçimine dön
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="min-h-[620px] overflow-hidden p-0">
            <div className="border-b border-emerald-100 px-6 py-4">
              <div className="flex flex-wrap gap-2">
                {steps.map((label, index) => (
                  <Badge
                    key={label}
                    className={index === step ? "" : "border-slate-200 bg-slate-50 text-slate-500"}
                  >
                    {index + 1}. {label}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.24 }}
                >
                  {step === 0 && (
                    <div className="space-y-5">
                      <Field label="İşletme adı">
                        <Input placeholder="Örn: Liva Güzellik" {...form.register("brandName")} />
                      </Field>
                      <Field label="Logo yükleme">
                        <Input
                          placeholder="Logo linki (PNG, JPG veya SVG desteklenir)"
                          {...form.register("logoUrl")}
                        />
                        <p className="mt-1.5 text-xs text-slate-500">
                          SVG logolar otomatik dönüştürülür; konum tasarıma göre otomatik seçilir.
                        </p>
                      </Field>
                      <Field label="Marka renkleri">
                        <BrandColorSelector
                          value={watched.brandColors ?? []}
                          onChange={(colors) =>
                            form.setValue("brandColors", colors, { shouldValidate: true })
                          }
                        />
                      </Field>
                    </div>
                  )}

                  {step === 1 && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {sectors.map((sector) => (
                        <button
                          key={sector.key}
                          type="button"
                          onClick={() => form.setValue("sector", sector.key)}
                          className={`rounded-[24px] border p-5 text-left transition ${
                            watched.sector === sector.key
                              ? "border-emerald-400 bg-emerald-50"
                              : "border-emerald-100 bg-white"
                          }`}
                        >
                          <p className="font-medium text-slate-900">{sector.label}</p>
                        </button>
                      ))}

                      {watched.sector === "other" && (
                        <div className="sm:col-span-2">
                          <Field label="Kendi sektörünüz">
                            <Input placeholder="Sektörünüzü yazın" {...form.register("customSector")} />
                          </Field>
                        </div>
                      )}
                    </div>
                  )}

                  {step === 2 && (
                    <Field label="Kısaca işletmenizi anlatın">
                      <Textarea
                        placeholder="Örn: Kadınlara yönelik premium cilt bakımı ve güzellik hizmetleri sunan modern bir salonuz."
                        {...form.register("brandDescription")}
                      />
                    </Field>
                  )}

                  {step === 3 && (
                    <div className="space-y-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        {styles.map((style) => (
                          <button
                            key={style.key}
                            type="button"
                            onClick={() => form.setValue("visualStyle", style.key)}
                            className={`rounded-[24px] border p-5 text-left transition ${
                              watched.visualStyle === style.key
                                ? "border-emerald-400 bg-emerald-50"
                                : "border-emerald-100 bg-white"
                            }`}
                          >
                            <p className="font-medium text-slate-900">{style.name}</p>
                            <p className="mt-2 text-sm leading-6 text-slate-600">{style.description}</p>
                          </button>
                        ))}
                      </div>
                      <Field label="Stil notları (isteğe bağlı)">
                        <Textarea
                          placeholder="Örn: Daha editorial poster hissi, az 3D ikon, sıcak fotoğraf tonu"
                          value={styleCustomNotes}
                          onChange={(event) => setStyleCustomNotes(event.target.value)}
                        />
                      </Field>
                    </div>
                  )}

                  {step === 4 && (
                    <div className="space-y-5">
                      <SpecialDaySelector
                        selectedDays={selectedDays}
                        onChange={setSelectedDays}
                        sector={watched.sector as SectorKey | undefined}
                      />
                      <DayCustomizationPanel
                        selectedDays={selectedDays}
                        customizations={dayCustomizations}
                        onChange={setDayCustomizations}
                      />
                    </div>
                  )}

                  {step === 5 && (
                    <div className="space-y-4">
                      <Card className="p-5">
                        <CardTitle>Ana paket</CardTitle>
                        <CardDescription className="mt-2">
                          30 özel gün postu, 10 revizyon kredisi, logo ve marka rengi uyumu, PNG indirme.
                        </CardDescription>
                        <p className="mt-4 text-3xl font-semibold text-slate-950">
                          {formatCurrency(BASE_PACKAGE_PRICE)}
                        </p>
                      </Card>

                      <PostFormatSelector value={postFormat} onChange={setPostFormat} />

                      <div className="space-y-3">
                        {addonOptions.map((addon) => (
                          <Card key={addon.key} className="flex items-center justify-between gap-4 p-5">
                            <div>
                              <p className="font-medium text-slate-900">
                                {addon.label} +{formatCurrency(addon.price)}
                              </p>
                              <p className="mt-1 text-sm leading-6 text-slate-600">
                                {addon.description}
                              </p>
                            </div>
                            <Checkbox
                              checked={selectedAddons.includes(addon.key)}
                              onCheckedChange={() => toggleAddon(addon.key)}
                            />
                          </Card>
                        ))}
                      </div>

                      <Card className="bg-emerald-950 text-white">
                        <p className="text-sm text-emerald-100">Toplam fiyat</p>
                        <p className="mt-2 text-4xl font-semibold">{formatCurrency(total)}</p>
                        <p className="mt-2 text-sm text-emerald-100">
                          Tek ödeme • Güvenli ödeme • Arka planda üretim
                        </p>
                        <div className="mt-5">
                          <Button
                            type="button"
                            variant="secondary"
                            className="w-full"
                            onClick={() => {
                              const values = form.getValues();
                              saveOnboardingDraft({
                                brandName: values.brandName,
                                logoUrl: values.logoUrl,
                                brandColors: values.brandColors,
                                sector: values.sector,
                                customSector: values.customSector,
                                brandDescription: values.brandDescription,
                                visualStyle: values.visualStyle as VisualStyle,
                                styleCustomNotes: styleCustomNotes.trim() || undefined,
                                dayCustomizations:
                                  Object.keys(dayCustomizations).length > 0
                                    ? dayCustomizations
                                    : undefined,
                                selectedDays,
                                purchasedAddons: selectedAddons,
                                postFormat,
                                formMode: "detailed",
                              });
                              router.push("/checkout");
                            }}
                          >
                            Güvenli Öde
                          </Button>
                        </div>
                      </Card>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="border-t border-emerald-100 px-6 py-4">
              {step === 4 && !canContinue && (
                <p className="mb-3 text-center text-sm text-amber-700">
                  Devam etmek için {daysRemaining} gün daha seçin veya &quot;Otomatik tamamla&quot; butonunu kullanın.
                </p>
              )}
              <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep((current) => Math.max(0, current - 1))}
                disabled={step === 0}
              >
                Geri
              </Button>
              <Button
                type="button"
                onClick={async () => {
                  const valid = await form.trigger(stepFields[step]);
                  if (!valid) return;
                  if (!canContinue) return;
                  setStep((current) => Math.min(steps.length - 1, current + 1));
                }}
                disabled={step === 4 && !canContinue}
              >
                {step === steps.length - 1 ? "Hazır" : "Devam et"}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              </div>
            </div>
          </Card>

          <Card className="h-fit space-y-5">
            <Badge>Canli ozet</Badge>
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">
                {watched.brandName || "Marka adiniz"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Secimleriniz ilerledikce paket ozetiniz burada netlesir.
              </p>
            </div>

            <div
              className="rounded-[28px] p-5 text-white"
              style={{
                background:
                  (watched.brandColors?.length ?? 0) > 1
                    ? `linear-gradient(135deg, ${watched.brandColors?.join(", ")})`
                    : watched.brandColors?.[0] ?? "#16A34A",
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.2em]">Preview</span>
                <Sparkles className="h-4 w-4" />
              </div>
              <p className="mt-12 text-2xl font-semibold">
                {getSpecialDayById(selectedDays[0]?.dayId)?.name ?? "Özel Gün"}
              </p>
              <p className="mt-2 text-sm text-white/80">
                {styles.find((style) => style.key === (watched.visualStyle as VisualStyle))?.name ?? "Modern"} stil
              </p>
            </div>

            <div className="space-y-3 text-sm text-slate-600">
              <SummaryItem
                label="Renkler"
                value={
                  watched.brandColors?.length
                    ? watched.brandColors.join(" → ")
                    : "-"
                }
              />
              <SummaryItem label="Sektor" value={sectorLabel(watched.sector as SectorKey)} />
              <SummaryItem
                label="Stil"
                value={styles.find((style) => style.key === watched.visualStyle)?.name ?? "-"}
              />
              <SummaryItem label="Secilen gun" value={`${usedDaySlots} / ${MAX_SELECTED_DAYS}`} />
              <SummaryItem label="Toplam" value={formatCurrency(total)} />
            </div>
          </Card>
        </div>
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

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-emerald-100 px-4 py-3">
      <span>{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}

function sectorLabel(key?: SectorKey) {
  return sectors.find((item) => item.key === key)?.label ?? "-";
}
