import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { APP_NAME, BASE_PACKAGE_PRICE } from "@/lib/config";
import { metrics } from "@/lib/mock-data";
import {
  heroShowcase,
  howItWorksImages,
  sectorShowcase,
} from "@/lib/marketing-images";
import { formatCurrency } from "@/lib/utils";

export function LandingPage() {
  return (
    <div className="overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.14),_transparent_42%),linear-gradient(180deg,_#f8fffa_0%,_#ffffff_50%,_#f0fdf4_100%)]">
      <section className="mx-auto max-w-7xl px-4 pb-8 pt-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between rounded-full border border-emerald-100 bg-white/85 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 font-semibold text-white">
              P
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{APP_NAME}</p>
              <p className="text-xs text-slate-500">Ajans kalitesi tek tıkla</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="hidden text-sm text-slate-600 sm:block">
              Panel
            </Link>
            <Link href="/login" className="text-sm font-medium text-emerald-700">
              Giriş Yap
            </Link>
          </div>
        </header>

        <div className="grid gap-12 py-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:py-16">
          <div>
            <Badge className="gap-2">
              <Zap className="h-3.5 w-3.5" />
              Tek ödeme {formatCurrency(BASE_PACKAGE_PRICE)} • Abonelik yok
            </Badge>
            <h1 className="mt-5 max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
              İşletmenizin 1 yıllık özel gün postları dakikalar içinde hazır.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              Logonuzu yükleyin, sektörünüzü seçin; bayramlar, kandiller, cuma mesajları,
              milli günler ve sektörünüze özel günler için markanıza uygun 30 post oluşturun.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/onboarding">
                <Button className="h-12 w-full px-7 text-base sm:w-auto">
                  Postlarımı Oluştur
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" className="h-12 w-full sm:w-auto">
                  Örnek paneli gör
                </Button>
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                "30 özel gün postu",
                "10 revizyon kredisi",
                "Bayram, kandil ve cuma dahil",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-3xl border border-emerald-100 bg-white/90 px-4 py-4 text-sm text-slate-700"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <HeroVisual />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="3 adımda hazır"
          title="Karmaşık değil, akış gibi ilerler"
          description="Mobilde hızlı, masaüstünde premium görünen onboarding deneyimi."
        />
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            ["Markanı tanımla", "Logo, renk ve sektör bilgilerini gir."],
            ["Günleri seç", "30 özel günü tek tek veya otomatik tamamla."],
            ["İndir ve paylaş", "Panelden görselleri ve captionları yönet."],
          ].map(([title, description], index) => (
            <Card key={title} className="overflow-hidden p-0">
              <div className="relative h-40">
                <Image
                  src={howItWorksImages[index]}
                  alt={title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                <Badge className="absolute left-4 top-4 border-white/20 bg-black/30 text-white">
                  {index + 1}. adım
                </Badge>
              </div>
              <div className="p-5">
                <CardTitle>{title}</CardTitle>
                <CardDescription className="mt-2">{description}</CardDescription>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Örnek postlar"
          title="Her özel gün için markanıza uygun görsel dil"
          description="Aynı işletme için bayram, kandil, cuma ve kampanya günlerinde tutarlı içerik."
        />
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {heroShowcase.map((post) => (
            <div
              key={post.day}
              className="group overflow-hidden rounded-[28px] border border-emerald-100 bg-white shadow-sm transition hover:-translate-y-1"
            >
              <div className="relative aspect-square">
                <Image
                  src={post.image}
                  alt={post.day}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 50vw, 20vw"
                />
                <div
                  className="absolute inset-0 opacity-80"
                  style={{
                    background: `linear-gradient(180deg, transparent 30%, ${post.accent}CC 100%)`,
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <p className="text-[10px] uppercase tracking-[0.18em] opacity-90">{APP_NAME}</p>
                  <p className="mt-1 text-lg font-semibold leading-tight">{post.day}</p>
                  <p className="mt-1 text-xs text-white/85">{post.subtitle}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="KOBİ odaklı"
          title="Hangi işletmeler için?"
          description="Yerel işletmelerin yıl boyu düzenli görünmesi için tasarlandı."
        />
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {sectorShowcase.map((sector) => (
            <Card key={sector.key} className="overflow-hidden p-0">
              <div className="relative h-28">
                <Image
                  src={sector.image}
                  alt={sector.label}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <p className="p-4 text-sm font-medium text-slate-800">{sector.label}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <PricingCard />
          <Card className="overflow-hidden p-0">
            <div className="relative h-56">
              <Image
                src={howItWorksImages[0]}
                alt="Panel önizlemesi"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/80 to-emerald-900/20" />
              <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                <p className="text-sm uppercase tracking-[0.2em] text-emerald-200">Üye paneli</p>
                <h3 className="mt-2 text-2xl font-semibold">Görsellerinizi tek yerden yönetin</h3>
                <p className="mt-2 max-w-md text-sm text-emerald-50/90">
                  Profil, paket bilgisi, caption ve indirme işlemleri tek panelde.
                </p>
              </div>
            </div>
            <div className="space-y-4 p-6">
              {[
                ["Tek seferlik mi?", "Evet. Ana paket tek ödeme 299₺, abonelik yok."],
                ["Üretim ne kadar sürer?", "Arka planda devam eder, hazır olunca e-posta gider."],
                ["Sayfadan çıkarsam?", "Üretim durmaz, panelden takip edebilirsiniz."],
              ].map(([question, answer]) => (
                <div key={question} className="rounded-2xl border border-emerald-100 p-4">
                  <p className="font-medium text-slate-900">{question}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{answer}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 pt-4 sm:px-6 lg:px-8">
        <Card className="overflow-hidden border-emerald-200 p-0">
          <div className="grid lg:grid-cols-2">
            <div className="p-8 sm:p-10">
              <Badge>Hazır olduğunda indir</Badge>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                30 özel gün postunu tek akışla hazırla
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                Tek ödeme, mobil-first deneyim, arka planda çalışan üretim ve büyümeye açık mimari.
              </p>
              <div className="mt-8">
                <Link href="/onboarding">
                  <Button className="h-12 px-7">Paketimi Hazırla</Button>
                </Link>
              </div>
            </div>
            <div className="relative min-h-[280px]">
              <Image
                src={heroShowcase[0].image}
                alt="Örnek post"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{title}</h2>
      <p className="mt-3 text-base leading-7 text-slate-600">{description}</p>
    </div>
  );
}

function HeroVisual() {
  const [main, ...rest] = heroShowcase;

  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div className="absolute -left-8 top-8 h-32 w-32 rounded-full bg-emerald-300/30 blur-3xl" />
      <div className="absolute -right-6 bottom-8 h-36 w-36 rounded-full bg-lime-300/30 blur-3xl" />

      <div className="relative overflow-hidden rounded-[32px] border border-emerald-100 bg-white p-3 shadow-[0_24px_80px_rgba(16,185,129,0.18)]">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[26px]">
          <Image
            src={main.image}
            alt={main.day}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 40vw"
          />
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, rgba(0,0,0,0.05) 0%, ${main.accent}DD 100%)`,
            }}
          />
          <div className="absolute left-4 top-4">
            <Badge className="border-white/20 bg-black/25 text-white">
              Tek ödeme {formatCurrency(BASE_PACKAGE_PRICE)}
            </Badge>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] opacity-90">
              <Sparkles className="h-4 w-4" />
              {APP_NAME}
            </div>
            <p className="mt-4 text-3xl font-semibold">{main.day}</p>
            <p className="mt-2 text-sm text-white/85">{main.subtitle}</p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          {rest.slice(0, 2).map((post) => (
            <div key={post.day} className="relative h-24 overflow-hidden rounded-2xl">
              <Image src={post.image} alt={post.day} fill className="object-cover" sizes="200px" />
              <div className="absolute inset-0 bg-black/35" />
              <p className="absolute bottom-2 left-2 text-xs font-semibold text-white">{post.day}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PricingCard() {
  return (
    <Card className="border-emerald-300 bg-gradient-to-br from-emerald-500 to-emerald-700 p-8 text-white">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">Ana Paket</p>
      <h3 className="mt-3 text-4xl font-semibold">{formatCurrency(BASE_PACKAGE_PRICE)}</h3>
      <p className="mt-2 text-sm text-white/80">Tek ödeme • Abonelik yok</p>
      <div className="mt-6 space-y-3">
        {[
          `${metrics.includedPosts} özel gün postu`,
          `${metrics.revisionCredits} revizyon kredisi`,
          "Logo ve marka rengi uyumu",
          "PNG indirme ve panel görünümü",
        ].map((item) => (
          <div key={item} className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-lime-200" />
            <span className="text-sm">{item}</span>
          </div>
        ))}
      </div>
      <div className="mt-8">
        <Link href="/onboarding">
          <Button variant="secondary" className="w-full">
            Postlarımı Oluştur
          </Button>
        </Link>
      </div>
    </Card>
  );
}
