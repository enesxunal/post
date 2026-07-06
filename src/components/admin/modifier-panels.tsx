import { sectorModifiers, styles } from "@/lib/mock-data";

import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export function SectorModifiersPanel() {
  return (
    <div>
      <Badge>Sektör</Badge>
      <h1 className="mt-3 text-3xl font-semibold text-slate-950">Sektör Kuralları</h1>
      <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
        Güzellik, kafe, diş kliniği gibi sektörlere özel görsel ipuçları. İlk sürümde kod
        içinden yönetiliyor; sonraki adımda buradan düzenlenebilir olacak.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {sectorModifiers.map((item) => (
          <Card key={item.key} className="p-5">
            <CardTitle>{item.name}</CardTitle>
            <CardDescription className="mt-2">{item.promptModifier}</CardDescription>
            <p className="mt-3 text-sm text-slate-600">{item.avoidRules}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function StyleModifiersPanel() {
  return (
    <div>
      <Badge>Stil</Badge>
      <h1 className="mt-3 text-3xl font-semibold text-slate-950">Stil Kuralları</h1>
      <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
        Modern, minimal, kurumsal ve premium tonlar. İlk sürümde kod içinden yönetiliyor.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {styles.map((style) => (
          <Card key={style.key} className="p-5">
            <CardTitle>{style.name}</CardTitle>
            <CardDescription className="mt-2">{style.promptModifier}</CardDescription>
          </Card>
        ))}
      </div>
    </div>
  );
}
