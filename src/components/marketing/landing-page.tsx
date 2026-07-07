import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Car,
  CheckCircle2,
  Coffee,
  Download,
  Dumbbell,
  GraduationCap,
  Palette,
  ShieldCheck,
  ShoppingBag,
  Smile,
  Sparkles,
  Timer,
  Zap,
} from "lucide-react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { HeroVisual } from "@/components/marketing/hero-visual";
import { PostMockCard } from "@/components/marketing/post-mock-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { APP_DOMAIN, APP_NAME, BASE_PACKAGE_PRICE, BRAND_GRADIENT } from "@/lib/config";
import {
  heroShowcase,
  howItWorksSteps,
  sectorShowcase,
} from "@/lib/marketing-showcase";
import { metrics } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

const sectorIcons = {
  sparkles: Sparkles,
  coffee: Coffee,
  smile: Smile,
  building: Building2,
  graduation: GraduationCap,
  shopping: ShoppingBag,
  car: Car,
  dumbbell: Dumbbell,
} as const;

const stepIcons = {
  palette: Palette,
  calendar: CalendarDays,
  download: Download,
} as const;

export function LandingPage() {
  return (
    <div className="overflow-hidden bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.18),transparent),linear-gradient(180deg,#f7fdf9_0%,#ffffff_45%,#f0fdf4_100%)]">
      {/* Üst navigasyon */}
      <section className="mx-auto max-w-7xl px-4 pb-4 pt-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between rounded-2xl border border-emerald-100/80 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-md sm:rounded-full sm:px-6">
          <BrandLogo tagline="Özel gün postları, tek ödeme" />
          <div className="flex items-center gap-3 sm:gap-5">
            <Link
              href="/login"
              className="hidden text-sm text-slate-600 transition hover:text-emerald-700 sm:block"
            >
              Giriş Yap
            </Link>
            <Link href="/onboarding">
              <Button className="h-10 px-5 text-sm">Başla</Button>
            </Link>
          </div>
        </header>

        {/* Hero */}
        <div className="grid gap-14 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
          <div>
            <Badge className="gap-2 border-emerald-200 bg-emerald-50 text-emerald-800">
              <Zap className="h-3.5 w-3.5" />
              Tek ödeme {formatCurrency(BASE_PACKAGE_PRICE)} • Abonelik yok
            </Badge>

            <h1 className="mt-6 max-w-2xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
              İşletmenizin 1 yıllık özel gün postları{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(to right, ${BRAND_GRADIENT.from}, ${BRAND_GRADIENT.to})`,
                }}
              >
                dakikalar içinde
              </span>{" "}
              hazır.
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              Logonuzu yükleyin, sektörünüzü seçin; bayramlar, kandiller, cuma mesajları,
              milli günler ve sektörünüze özel günler için markanıza uygun 30 post oluşturun.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/onboarding">
                <Button className="h-12 w-full px-7 text-base shadow-lg shadow-emerald-500/20 sm:w-auto">
                  Postlarımı Oluştur
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="h-12 w-full sm:w-auto">
                  Giriş Yap
                </Button>
              </Link>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {[
                { icon: Sparkles, text: "30 özel gün postu" },
                { icon: ShieldCheck, text: "10 revizyon kredisi" },
                { icon: Timer, text: "Arka planda üretim" },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-white/80 px-4 py-3.5 text-sm text-slate-700 shadow-sm"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="font-medium">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <HeroVisual />
        </div>
      </section>

      {/* Güven şeridi */}
      <section className="border-y border-emerald-100/80 bg-white/60 backdrop-blur-sm">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 sm:px-6 md:grid-cols-4 lg:px-8">
          {[
            ["30", "özel gün postu"],
            ["10", "revizyon hakkı"],
            ["299₺", "tek seferlik"],
            ["0", "abonelik"],
          ].map(([value, label]) => (
            <div key={label} className="text-center">
              <p className="text-2xl font-bold text-emerald-600 sm:text-3xl">{value}</p>
              <p className="mt-1 text-sm text-slate-600">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Nasıl çalışır */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="3 adımda hazır"
          title="Karmaşık değil, akış gibi ilerler"
          description="Mobilde hızlı, masaüstünde premium görünen onboarding deneyimi."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {howItWorksSteps.map((step) => {
            const Icon = stepIcons[step.icon];
            return (
              <Card
                key={step.title}
                className="group relative overflow-hidden border-emerald-100/80 p-0 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/10"
              >
                <div
                  className={`bg-gradient-to-br ${step.tone} px-6 py-8 text-white`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-4xl font-bold text-white/25">
                      0{step.step}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                  <CardDescription className="mt-2 leading-6">
                    {step.description}
                  </CardDescription>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Örnek postlar */}
      <section className="bg-slate-950 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
              Örnek postlar
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Her özel gün için markanıza uygun görsel dil
            </h2>
            <p className="mt-3 text-base leading-7 text-slate-400">
              Bayram, kandil, cuma ve kampanya günlerinde tutarlı, profesyonel içerik.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {heroShowcase.map((post) => (
              <div
                key={post.day}
                className="transition duration-300 hover:-translate-y-1 hover:scale-[1.02]"
              >
                <PostMockCard post={post} size="md" />
                <p className="mt-3 text-center text-xs text-slate-500">{post.day}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sektörler */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="KOBİ odaklı"
          title="Hangi işletmeler için?"
          description="Yerel işletmelerin yıl boyu düzenli ve profesyonel görünmesi için tasarlandı."
        />
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {sectorShowcase.map((sector) => {
            const Icon = sectorIcons[sector.icon];
            return (
              <Card
                key={sector.key}
                className={`border-emerald-100/80 bg-gradient-to-br ${sector.tone} p-5 transition hover:-translate-y-0.5 hover:shadow-md`}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-800">{sector.label}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Fiyat + panel önizlemesi */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <PricingCard />

          <Card className="overflow-hidden border-emerald-100 p-0">
            <div className="border-b border-emerald-100 bg-gradient-to-r from-slate-900 to-emerald-950 p-6 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
                Üye paneli
              </p>
              <h3 className="mt-2 text-2xl font-bold">Görsellerinizi tek yerden yönetin</h3>
              <p className="mt-2 max-w-md text-sm text-emerald-100/80">
                Profil, paket bilgisi, caption ve indirme işlemleri tek panelde.
              </p>
            </div>

            <div className="grid gap-4 p-6 lg:grid-cols-2">
              <PanelPreview />
              <div className="space-y-3">
                {[
                  ["Tek seferlik mi?", "Evet. Ana paket tek ödeme 299₺, abonelik yok."],
                  ["Üretim ne kadar sürer?", "Arka planda devam eder, hazır olunca e-posta gider."],
                  ["Sayfadan çıkarsam?", "Üretim durmaz, panelden takip edebilirsiniz."],
                ].map(([question, answer]) => (
                  <div
                    key={question}
                    className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4"
                  >
                    <p className="font-semibold text-slate-900">{question}</p>
                    <p className="mt-1.5 text-sm leading-6 text-slate-600">{answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Alt CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-24 pt-4 sm:px-6 lg:px-8">
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-emerald-500 via-emerald-600 to-green-700 p-0 text-white shadow-xl shadow-emerald-500/25">
          <div className="grid lg:grid-cols-2">
            <div className="p-8 sm:p-12">
              <Badge className="border-white/25 bg-white/15 text-white">
                Hazır olduğunda indir
              </Badge>
              <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                30 özel gün postunu tek akışla hazırla
              </h2>
              <p className="mt-4 text-base leading-7 text-emerald-50/90">
                Tek ödeme, mobil-first deneyim, arka planda çalışan üretim ve büyümeye açık
                mimari.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/onboarding">
                  <Button
                    variant="secondary"
                    className="h-12 w-full bg-white px-7 text-emerald-700 hover:bg-emerald-50 sm:w-auto"
                  >
                    Paketimi Hazırla
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="h-12 w-full border-white/40 bg-transparent text-white hover:bg-white/10 sm:w-auto"
                  >
                    Giriş Yap
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative hidden items-center justify-center bg-emerald-700/40 p-8 lg:flex">
              <div className="grid w-full max-w-xs grid-cols-2 gap-3">
                {heroShowcase.slice(0, 4).map((post) => (
                  <PostMockCard key={post.day} post={post} size="sm" />
                ))}
              </div>
            </div>
          </div>
        </Card>

        <footer className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-emerald-100 pt-8 text-sm text-slate-500 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {APP_NAME}. Tüm hakları saklıdır. · {APP_DOMAIN}
          </p>
          <div className="flex gap-6">
            <Link href="/onboarding" className="hover:text-emerald-700">
              Paketi Başlat
            </Link>
            <Link href="/login" className="hover:text-emerald-700">
              Giriş
            </Link>
          </div>
        </footer>
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
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">{title}</h2>
      <p className="mt-3 text-base leading-7 text-slate-600">{description}</p>
    </div>
  );
}

function PanelPreview() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {heroShowcase.slice(0, 6).map((post, i) => (
          <div
            key={post.day}
            className={`aspect-square rounded-lg bg-gradient-to-br ${post.gradient} ${i === 0 ? "ring-2 ring-emerald-500 ring-offset-1" : ""}`}
          />
        ))}
      </div>
      <div className="mt-3 space-y-2">
        <div className="h-2 w-3/4 rounded-full bg-slate-200" />
        <div className="h-2 w-1/2 rounded-full bg-slate-200" />
      </div>
    </div>
  );
}

function PricingCard() {
  return (
    <Card className="flex flex-col border-emerald-200 bg-gradient-to-br from-emerald-500 to-emerald-700 p-8 text-white shadow-lg shadow-emerald-500/20">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
        Ana Paket
      </p>
      <h3 className="mt-3 text-5xl font-bold">{formatCurrency(BASE_PACKAGE_PRICE)}</h3>
      <p className="mt-2 text-sm text-white/80">Tek ödeme • Abonelik yok</p>
      <div className="mt-8 flex-1 space-y-3">
        {[
          `${metrics.includedPosts} özel gün postu`,
          `${metrics.revisionCredits} revizyon kredisi`,
          "Logo ve marka rengi uyumu",
          "PNG indirme ve panel görünümü",
        ].map((item) => (
          <div key={item} className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-lime-200" />
            <span className="text-sm">{item}</span>
          </div>
        ))}
      </div>
      <div className="mt-8">
        <Link href="/onboarding">
          <Button variant="secondary" className="h-12 w-full bg-white text-emerald-700 hover:bg-emerald-50">
            Postlarımı Oluştur
          </Button>
        </Link>
      </div>
    </Card>
  );
}
