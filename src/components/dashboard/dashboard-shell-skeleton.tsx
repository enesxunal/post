import { Card } from "@/components/ui/card";

export function DashboardShellSkeleton() {
  return (
    <div className="min-h-screen animate-pulse bg-[linear-gradient(180deg,_#f8fffa_0%,_#f1f5f9_100%)]">
      <header className="border-b border-emerald-100 bg-white/90 px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-emerald-100" />
            <div className="space-y-2">
              <div className="h-4 w-36 rounded bg-slate-200" />
              <div className="h-3 w-20 rounded bg-slate-100" />
            </div>
          </div>
          <div className="h-9 w-24 rounded-full bg-slate-100" />
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[280px_1fr] lg:px-8">
        <aside className="space-y-4">
          <Card className="h-56 bg-white/80" />
          <Card className="h-40 bg-white/80" />
        </aside>
        <main className="space-y-4">
          <div className="h-8 w-48 rounded bg-slate-200" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="aspect-square bg-white/80" />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
