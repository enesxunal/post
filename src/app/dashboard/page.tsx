import { UserDashboard } from "@/components/dashboard/user-dashboard";
import { DashboardLiveRefresh } from "@/components/dashboard/dashboard-live-refresh";
import { mapGenerationJobsForDashboard } from "@/lib/generation/map-jobs";
import { requireSessionUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const user = await requireSessionUser("/dashboard");
  const supabase = await createSupabaseServerClient();

  const { data: projects } = await supabase
    .from("projects")
    .select(
      "id, brand_name, primary_color, visual_style, remaining_credits, bonus_credits_granted, status, created_at",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1);

  const project = projects?.[0] ?? null;

  let jobs: ReturnType<typeof mapGenerationJobsForDashboard> = [];

  if (project) {
    const { data: generationJobs } = await supabase
      .from("generation_jobs")
      .select("id, status, type, caption_text, image_url, created_at, error_message")
      .eq("project_id", project.id)
      .order("created_at", { ascending: true });

    jobs = mapGenerationJobsForDashboard(generationJobs ?? []);
  }

  const memberSince = project?.created_at
    ? new Date(project.created_at).toLocaleDateString("tr-TR", {
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleDateString("tr-TR", { month: "long", year: "numeric" });

  const postsGenerating = jobs.filter((job) => job.status === "generating" || job.status === "queued").length;

  return (
    <>
      <DashboardLiveRefresh isGenerating={postsGenerating > 0 || project?.status === "generating"} />
      <UserDashboard
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
        postsGenerating: jobs.filter((job) => job.status === "generating" || job.status === "queued").length,
        addons: [],
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
      />
    </>
  );
}
