import { decodeProjectMeta } from "@/lib/generation/project-service";
import { mapGenerationJobsForDashboard } from "@/lib/generation/map-jobs";
import { resolveBrandColors } from "@/lib/profile/dashboard-user";
import { getSectorOptionsFromSeed } from "@/lib/sectors/seed-data";
import { resolveStyleName } from "@/lib/styles/seed-data";
import type { PostFormat } from "@/types/domain";

export type DashboardProject = {
  id: string;
  brandName: string;
  primaryColor: string;
  visualStyle: string;
  remainingCredits: number;
  bonusCreditsGranted: boolean;
};

export type DashboardJob = {
  id: string;
  dayId: string;
  dayName: string;
  dateLabel: string;
  status: string;
  imageIndex: number;
  caption: string | null;
  hashtags?: string[];
  imageUrl?: string | null;
  previousVersions?: Array<{
    id: string;
    imageUrl: string;
    thumbnailUrl?: string;
    createdAt: string;
    revisionNote?: string;
  }>;
  approvedAt?: string | null;
  storyImageUrl?: string | null;
  storyStatus?: string | null;
  gradient: string;
  errorMessage?: string | null;
};

export type ProjectBundle = {
  project: DashboardProject;
  jobs: DashboardJob[];
  postFormat: PostFormat;
  hasStoryAddon: boolean;
  hasCaptionAddon: boolean;
  hasCalendarAddon: boolean;
  addons: string[];
  brandName: string;
  sectorLabel: string;
  visualStyleLabel: string;
  primaryColor: string;
  brandColors: string[];
  logoUrl: string | null;
  logoInitial: string;
  postsReady: number;
  postsTotal: number;
  postsGenerating: number;
  createdAt: string;
};

type RawProject = {
  id: string;
  brand_name: string;
  brand_description: string | null;
  sector: string;
  primary_color: string;
  visual_style: string;
  logo_url: string | null;
  remaining_credits: number;
  bonus_credits_granted: boolean;
  status: string;
  created_at: string;
  generation_jobs: Array<{
    id: string;
    status: string;
    type: string;
    caption_text: string | null;
    image_url?: string | null;
    design_metadata?: unknown;
    created_at: string;
    error_message?: string | null;
    approved_at?: string | null;
    story_status?: string | null;
    hashtags?: string[] | null;
  }> | null;
};

export function buildProjectBundles(rows: RawProject[]): ProjectBundle[] {
  return rows.map((row) => {
    const meta = decodeProjectMeta(row.brand_description);
    const rawJobs = row.generation_jobs ?? [];
    const jobs = mapGenerationJobsForDashboard(
      [...rawJobs].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      ),
    );
    const postsGenerating = jobs.filter((job) => job.status === "generating").length;

    return {
      project: {
        id: row.id,
        brandName: row.brand_name,
        primaryColor: row.primary_color,
        visualStyle: row.visual_style,
        remainingCredits: row.remaining_credits,
        bonusCreditsGranted: row.bonus_credits_granted,
      },
      jobs,
      postFormat: meta.postFormat,
      hasStoryAddon: meta.purchasedAddons.includes("story"),
      hasCaptionAddon: meta.purchasedAddons.includes("caption"),
      hasCalendarAddon: meta.purchasedAddons.includes("calendar"),
      addons: meta.purchasedAddons.map((key) => key),
      brandName: row.brand_name,
      sectorLabel:
        meta.customSector ??
        getSectorOptionsFromSeed().find((item) => item.key === row.sector)?.label ??
        "—",
      visualStyleLabel: resolveStyleName(row.visual_style),
      primaryColor: row.primary_color,
      brandColors: resolveBrandColors(meta.brandColors, row.primary_color),
      logoUrl: row.logo_url,
      logoInitial: row.brand_name.charAt(0).toUpperCase(),
      postsReady: jobs.filter((job) => job.status === "ready").length,
      postsTotal: jobs.length,
      postsGenerating,
      createdAt: row.created_at,
    };
  });
}

export function pickProjectBundle(
  bundles: ProjectBundle[],
  projectId?: string | null,
): ProjectBundle | null {
  if (!bundles.length) return null;
  if (projectId) {
    const match = bundles.find((bundle) => bundle.project.id === projectId);
    if (match) return match;
  }
  return bundles[0] ?? null;
}
