"use client";

import { ProfileAvatar } from "@/components/dashboard/profile-avatar";
import { cn } from "@/lib/utils";

export type ProjectSwitcherOption = {
  id: string;
  brandName: string;
  logoUrl?: string | null;
  primaryColor: string;
  brandColors: string[];
  logoInitial: string;
  postsReady: number;
  postsTotal: number;
};

type ProjectSwitcherProps = {
  projects: ProjectSwitcherOption[];
  activeProjectId: string;
  onSelect: (projectId: string) => void;
};

export function ProjectSwitcher({
  projects,
  activeProjectId,
  onSelect,
}: ProjectSwitcherProps) {
  if (projects.length <= 1) return null;

  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-2">
      <p className="px-2 pb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
        Proje seçin
      </p>
      <div className="flex flex-wrap gap-2">
        {projects.map((item) => {
          const active = item.id === activeProjectId;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={cn(
                "flex min-w-[140px] items-center gap-2 rounded-xl border px-3 py-2 text-left transition",
                active
                  ? "border-emerald-400 bg-emerald-50 ring-2 ring-emerald-100"
                  : "border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/40",
              )}
            >
              <ProfileAvatar
                imageUrl={item.logoUrl}
                fallbackInitial={item.logoInitial}
                brandColors={item.brandColors}
                primaryColor={item.primaryColor}
                className="h-9 w-9 shrink-0 rounded-lg"
                withGradientRing
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{item.brandName}</p>
                <p className="text-[11px] text-slate-500">
                  {item.postsReady}/{item.postsTotal} hazır
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
