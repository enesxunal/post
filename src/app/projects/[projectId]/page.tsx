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
  user_id: string;
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
      user_id,
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

  const row = project as ProjectRow;
  const meta = decodeProjectMeta(row.brand_description);
  const rawJobs = row.generation_jobs ?? [];
  const jobs = mapGenerationJobsForDashboard(
    [...rawJobs].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    ),
  );
  const postsGenerating = jobs.filter(
    (job) => job.status === "generating" || job.status === "queued",
  ).length;

  return (
    <UserDashboard
      liveGenerating={postsGenerating > 0 || row.status === "generating"}
      user={{
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        businessName: row.brand_name,
        sector: "—",
        visualStyle: row.visual_style,
        primaryColor: row.primary_color,
        logoInitial: row.brand_name.charAt(0).toUpperCase(),
        packageName: "Ana Paket",
        postsTotal: jobs.length,
        postsReady: jobs.filter((job) => job.status === "ready").length,
        postsGenerating,
        addons: meta.purchasedAddons,
        memberSince: new Date(row.created_at).toLocaleDateString("tr-TR", {
          month: "long",
          year: "numeric",
        }),
      }}
      project={{
        id: row.id,
        brandName: row.brand_name,
        primaryColor: row.primary_color,
        visualStyle: row.visual_style,
        remainingCredits: row.remaining_credits,
        bonusCreditsGranted: row.bonus_credits_granted,
      }}
      jobs={jobs}
      postFormat={meta.postFormat}
      hasStoryAddon={meta.purchasedAddons.includes("story")}
    />
  );
}
