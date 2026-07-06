import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCircle2, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { APP_NAME, BASE_PACKAGE_PRICE } from "@/lib/config";
import { metrics, sectors } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

const mockupDays = ["29 Ekim", "Kandil", "Hayırlı Cumalar", "Anneler Günü", "Ramazan Bayramı"];

export function LandingPage() {
  return (
    <div className="bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_40%),linear-gradient(180deg,_#f7fef9_0%,_#ffffff_45%,_#f5fff7_100%)]">
      <section className="mx-auto max-w-7xl px-4 pb-12 pt-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between rounded-full border border-emerald-100 bg-white/80 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 font-semibold text-white">
              P
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{APP_NAME}</p>
              <p className="text-xs text-slate-500">Ajans kalitesi tek tıkla</p>
            </div>
          </div>
          <Link href="/login" className="text-sm font-medium text-slate-600">
            Giriş Yap
          </Link>
        </header>

        <div className="grid gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
          <div>
            <Badge>Tek ödeme {formatCurrency(BASE_PACKAGE_PRICE)} • Abonelik yok</Badge>
            <h1 className="mt-5 max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              İşletmenizin 1 yıllık özel gün postları dakikalar içinde hazır.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
              Logonuzu yükleyin, sektörünüzü seçin; bayramlar, kandiller, cuma mesajları,
              milli günler ve sektörünüze özel günler için markanıza uygun 30 post oluşturun.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/onboarding">
                <Button className="w-full sm:w-auto">
                  Postlarımı Oluştur
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <div className="flex items-center rounded-full border border-emerald-100 bg-white px-4 py-3 text-sm text-slate-600">
                Ajansa tek post parası vermeden 30 özel gün içeriği.
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                "30 özel gün postu",
                "10 revizyon kredisi",
                "Kandiller, cuma mesajları, bayramlar ve milli günler dahil",
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

          <FloatingPostMockups />
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-6 sm:px-6 lg:grid-cols-3 lg:px-8">
        {[
          {
            title: "Nasıl çalışır?",
            description: "Logonu ve marka rengini yükle, özel günlerini seç, postlarını indir ve paylaş.",
          },
          {
            title: "Paket içeriği",
            description: `${metrics.includedPosts} post, ${metrics.revisionCredits} revizyon kredisi, PNG indirme ve panel takibi.`,
          },
          {
            title: "Hangi işletmeler için?",
            description: "Güzellik salonu, kafe, diş kliniği, emlak, eğitim, butik, oto servis ve daha fazlası.",
          },
        ].map((item) => (
          <Card key={item.title} className="p-5">
            <CardTitle>{item.title}</CardTitle>
            <CardDescription className="mt-2">{item.description}</CardDescription>
          </Card>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="3 adımda hazır"
          title="Canva gibi karışık değil, akış gibi ilerler."
          description="Mobilde hızlı, masaüstünde premium görünen tek ekran hissine sahip onboarding deneyimi."
        />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ["1", "Logonu ve marka rengini yükle", "Markana ait temel görsel dili birkaç dakikada tanımla."],
            ["2", "Özel günlerini seç", "Önerilen günleri hazır al, istersen sektörüne göre otomatik tamamla."],
            ["3", "Postlarını indir ve paylaş", "Galeri, caption, story ve takvim seçeneklerini panelden yönet."],
          ].map(([step, title, description]) => (
            <Card key={title}>
              <Badge>{step}. adım</Badge>
              <CardTitle className="mt-5">{title}</CardTitle>
              <CardDescription className="mt-2">{description}</CardDescription>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Örnek postlar"
          title="Her özel gün için aynı marka dilinde içerik"
          description="Küçük işletmelerin yıl içi görünürlüğünü bozmadan, düzenli ve güven veren paylaşım akışı."
        />
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-5">
          {mockupDays.map((day, index) => (
            <div
              key={day}
              className="aspect-square rounded-[28px] border border-emerald-100 bg-white p-4"
            >
              <div
                className="flex h-full flex-col justify-between rounded-[22px] p-4 text-white"
                style={{
                  background:
                    index % 2 === 0
                      ? "linear-gradient(160deg, #10b981 0%, #16a34a 100%)"
                      : "linear-gradient(160deg, #064e3b 0%, #22c55e 100%)",
                }}
              >
                <span className="text-xs font-medium uppercase tracking-[0.2em] opacity-80">
                  {APP_NAME}
                </span>
                <div>
                  <p className="text-xs opacity-80">Özel Gün Postu</p>
                  <p className="mt-2 text-xl font-semibold leading-tight">{day}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="KOBİ odaklı"
          title="En çok bu işletmeler için değer üretir"
          description="Sosyal medyayı düzenli ama pratik yönetmek isteyen yerel işletmeler için tasarlandı."
        />
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {sectors.slice(0, 8).map((sector) => (
            <Card key={sector.key} className="p-4">
              <p className="text-sm font-medium text-slate-800">{sector.label}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <PricingCard />
          <Card className="space-y-4">
            <SectionTitle
              eyebrow="SSS"
              title="Kısa ama güven veren cevaplar"
              description="İlk satın alma kararını hızlandırmak için en kritik sorular."
            />
            {[
              ["Tek seferlik mi?", "Evet. Ana paket tek ödeme 299₺, abonelik yok."],
              ["Üretim ne kadar sürer?", "İlk sürümde mock akış var; gerçek entegrasyonda arka planda devam edecek."],
              ["Sayfadan çıkarsam ne olur?", "Üretim arka planda sürer ve hazır olduğunda e-posta mimarisi hazırdır."],
            ].map(([question, answer]) => (
              <div key={question} className="rounded-2xl border border-emerald-100 p-4">
                <p className="font-medium text-slate-900">{question}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{answer}</p>
              </div>
            ))}
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
        <Card className="overflow-hidden bg-emerald-950 p-8 text-white sm:p-10">
          <Badge className="border-white/20 bg-white/10 text-white">Hazır olduğunda indir</Badge>
          <h2 className="mt-5 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
            30 özel gün postunu tek bir akışla hazırla.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-emerald-50/85 sm:text-base">
            Tek ödeme, mobil-first deneyim, arka planda çalışan üretim akışı ve büyümeye açık mimari.
          </p>
          <div className="mt-8">
            <Link href="/onboarding">
              <Button variant="secondary">Paketimi Hazırla</Button>
            </Link>
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

function FloatingPostMockups() {
  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div className="absolute -left-6 top-6 hidden h-28 w-28 rounded-full bg-emerald-200/50 blur-3xl sm:block" />
      <div className="absolute -right-6 bottom-6 hidden h-32 w-32 rounded-full bg-lime-200/50 blur-3xl sm:block" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="translate-y-6">
          <Badge>Tek ödeme 299₺</Badge>
          <div className="mt-5 rounded-[26px] bg-gradient-to-br from-emerald-500 to-emerald-700 p-5 text-white">
            <div className="flex items-center justify-between text-xs opacity-90">
              <span>{APP_NAME}</span>
              <Sparkles className="h-4 w-4" />
            </div>
            <p className="mt-10 text-2xl font-semibold">29 Ekim</p>
            <p className="mt-2 text-sm text-emerald-50">Cumhuriyet Bayramımız kutlu olsun</p>
          </div>
        </Card>
        <div className="space-y-4">
          {[
            ["Kandil", "Saygılı, modern, sakin tasarım"],
            ["Hayırlı Cumalar", "İstediğiniz adet kadar cuma postu seçin"],
            ["Anneler Günü", "Premium ve sıcak sosyal medya dili"],
          ].map(([title, text]) => (
            <Card key={title} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-2 text-emerald-600">
                  <CalendarDays className="h-5 w-5" />
                </div>
              </div>
            </Card>
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
          "30 özel gün postu",
          "10 revizyon / yeniden üretim kredisi",
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
