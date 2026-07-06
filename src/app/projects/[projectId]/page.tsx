import { UserDashboard } from "@/components/dashboard/user-dashboard";
import { mapGenerationJobsForDashboard } from "@/lib/generation/map-jobs";
import { requireSessionUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const user = await requireSessionUser(`/projects/${projectId}`);
  const supabase = await createSupabaseServerClient();

  const { data: project } = await supabase
    .from("projects")
    .select(
      "id, brand_name, primary_color, visual_style, remaining_credits, bonus_credits_granted, status, created_at, user_id",
    )
    .eq("id", projectId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!project) {
    return (
      <UserDashboard
        user={{
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          businessName: "Proje bulunamadı",
          sector: "—",
          visualStyle: "—",
          primaryColor: "#16A34A",
          logoInitial: user.firstName.charAt(0).toUpperCase(),
          packageName: "Ana Paket",
          postsTotal: 0,
          postsReady: 0,
          postsGenerating: 0,
          addons: [],
          memberSince: "—",
        }}
        project={null}
        jobs={[]}
        emptyMessage="Bu projeye erişiminiz yok veya proje henüz oluşturulmamış."
      />
    );
  }

  const { data: generationJobs } = await supabase
    .from("generation_jobs")
    .select("id, status, type, caption_text, image_url, created_at, error_message")
    .eq("project_id", project.id)
    .order("created_at", { ascending: true });

  const jobs = mapGenerationJobsForDashboard(generationJobs ?? []);

  return (
    <UserDashboard
      user={{
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        businessName: project.brand_name,
        sector: "—",
        visualStyle: project.visual_style,
        primaryColor: project.primary_color,
        logoInitial: project.brand_name.charAt(0).toUpperCase(),
        packageName: "Ana Paket",
        postsTotal: jobs.length,
        postsReady: jobs.filter((job) => job.status === "ready").length,
        postsGenerating: jobs.filter((job) => job.status === "generating").length,
        addons: [],
        memberSince: new Date(project.created_at).toLocaleDateString("tr-TR", {
          month: "long",
          year: "numeric",
        }),
      }}
      project={{
        id: project.id,
        brandName: project.brand_name,
        primaryColor: project.primary_color,
        visualStyle: project.visual_style,
        remainingCredits: project.remaining_credits,
        bonusCreditsGranted: project.bonus_credits_granted,
      }}
      jobs={jobs}
    />
  );
}
