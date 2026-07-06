import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { specialDays, styles, sectorModifiers } from "@/lib/mock-data";

export function AdminOverview() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Badge>Admin</Badge>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
          Prompt library ve operasyon paneli
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
          Bu alan Supabase `profiles.role = admin` kontrolü ile korunacak şekilde tasarlandı. İlk sürümde prompt kütüphanesi, sektör ve stil düzenleyicilerinin ürün omurgası oluşturuldu.
        </p>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <MetricCard label="Özel gün kaydı" value={String(specialDays.length)} />
          <MetricCard label="Sektör modifier" value={String(sectorModifiers.length)} />
          <MetricCard label="Stil modifier" value={String(styles.length)} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="space-y-4">
            <CardTitle>Prompt Library</CardTitle>
            <CardDescription>
              Özel günlerin kültürel bağlamı, headline seçenekleri, avoid kuralları ve prompt şablonları tek yerden yönetilir.
            </CardDescription>

            <div className="space-y-3">
              {specialDays.map((day) => (
                <div
                  key={day.id}
                  className="rounded-[24px] border border-emerald-100 bg-white p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-slate-900">{day.name}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{day.culturalContext}</p>
                    </div>
                    <Badge>{day.category}</Badge>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {day.headlineAlternatives.slice(0, 2).map((headline) => (
                      <Badge key={headline} className="border-slate-200 bg-slate-50 text-slate-600">
                        {headline}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardTitle>Sektör kuralları</CardTitle>
              <CardDescription className="mt-2">
                Güzellik, kafe, diş kliniği gibi sektörlere özel görsel ipuçları ve kaçınılacak detaylar.
              </CardDescription>
              <div className="mt-4 space-y-3">
                {sectorModifiers.map((item) => (
                  <div key={item.key} className="rounded-2xl border border-emerald-100 p-4">
                    <p className="font-medium text-slate-900">{item.name}</p>
                    <p className="mt-1 text-sm text-slate-600">{item.promptModifier}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <CardTitle>Stil kuralları</CardTitle>
              <CardDescription className="mt-2">
                Modern, minimal, kurumsal ve premium tonlar tek bir veri katmanından yönetilir.
              </CardDescription>
              <div className="mt-4 flex flex-wrap gap-2">
                {styles.map((style) => (
                  <Badge key={style.key}>{style.name}</Badge>
                ))}
              </div>
              <Button className="mt-5 w-full">Prompt preview ac</Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
    </Card>
  );
}
