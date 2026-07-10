import type { FaqItem } from "@/lib/marketing-guide";
import { faqCategoryLabels } from "@/lib/marketing-guide";

type FaqListProps = {
  items: FaqItem[];
  grouped?: boolean;
};

export function FaqList({ items, grouped = false }: FaqListProps) {
  if (!grouped) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <FaqCard key={item.question} item={item} />
        ))}
      </div>
    );
  }

  const categories = [...new Set(items.map((item) => item.category))];

  return (
    <div className="space-y-10">
      {categories.map((category) => (
        <section key={category}>
          <h2 className="text-lg font-semibold text-slate-950">
            {faqCategoryLabels[category]}
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {items
              .filter((item) => item.category === category)
              .map((item) => (
                <FaqCard key={item.question} item={item} />
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function FaqCard({ item }: { item: FaqItem }) {
  return (
    <details className="group rounded-3xl border border-emerald-100 bg-white/90 p-5 shadow-sm open:shadow-md">
      <summary className="cursor-pointer list-none text-base font-semibold text-slate-950 marker:hidden [&::-webkit-details-marker]:hidden">
        <span className="flex items-start justify-between gap-3">
          {item.question}
          <span className="mt-0.5 text-emerald-600 transition group-open:rotate-45">+</span>
        </span>
      </summary>
      <p className="mt-3 text-sm leading-6 text-slate-600">{item.answer}</p>
    </details>
  );
}
