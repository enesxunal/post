import { UserDashboard } from "@/components/dashboard/user-dashboard";
import { decodeProjectMeta } from "@/lib/generation/project-service";
import { mapGenerationJobsForDashboard } from "@/lib/generation/map-jobs";
import { requireSessionUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ProjectRow = {
  id: string;
  brand_name: string;
  brand_description: string | null;
  primary_color: string;
  visual_style: string;
  remaining_credits: number;
  bonus_credits_granted: boolean;
  status: string;
  created_at: string;
  generation_jobs: Array<{
    id: string;
    status: string;
    type: string;
    caption_text: string | null;
    created_at: string;
    error_message: string | null;
    approved_at: string | null;
    story_status: string | null;
    hashtags: string[] | null;
  }> | null;
};

export default async function DashboardPage() {
  const user = await requireSessionUser("/dashboard");
  const supabase = await createSupabaseServerClient();

  const { data: projects } = await supabase
    .from("projects")
    .select(
      `
      id,
      brand_name,
      brand_description,
      primary_color,
      visual_style,
      remaining_credits,
      bonus_credits_granted,
      status,
      created_at,
      generation_jobs (
        id,
        status,
        type,
        caption_text,
        created_at,
        error_message,
        approved_at,
        story_status,
        hashtags
      )
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1);

  const project = (projects?.[0] as ProjectRow | undefined) ?? null;
  const meta = project ? decodeProjectMeta(project.brand_description) : null;
  const rawJobs = project?.generation_jobs ?? [];
  const jobs = mapGenerationJobsForDashboard(
    [...rawJobs].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    ),
  );

  const memberSince = project?.created_at
    ? new Date(project.created_at).toLocaleDateString("tr-TR", {
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleDateString("tr-TR", { month: "long", year: "numeric" });

  const postsGenerating = jobs.filter(
    (job) => job.status === "generating" || job.status === "queued",
  ).length;

  return (
    <UserDashboard
      liveGenerating={postsGenerating > 0 || project?.status === "generating"}
      user={{
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        businessName: project?.brand_name ?? "Henüz proje yok",
        sector: "—",
        visualStyle: project?.visual_style ?? "—",
        primaryColor: project?.primary_color ?? "#16A34A",
        logoInitial: (project?.brand_name ?? user.firstName).charAt(0).toUpperCase(),
        packageName: "Ana Paket",
        postsTotal: jobs.length || 30,
        postsReady: jobs.filter((job) => job.status === "ready").length,
        postsGenerating,
        addons: meta?.purchasedAddons.map((key) => key) ?? [],
        memberSince,
      }}
      project={
        project
          ? {
              id: project.id,
              brandName: project.brand_name,
              primaryColor: project.primary_color,
              visualStyle: project.visual_style,
              remainingCredits: project.remaining_credits,
              bonusCreditsGranted: project.bonus_credits_granted,
            }
          : null
      }
      jobs={jobs}
      postFormat={meta?.postFormat ?? "square"}
      hasStoryAddon={meta?.purchasedAddons.includes("story") ?? false}
    />
  );
}
