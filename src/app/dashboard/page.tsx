import { UserDashboard } from "@/components/dashboard/user-dashboard";
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

  let jobs: Array<{
    id: string;
    dayName: string;
    dateLabel: string;
    status: string;
    imageIndex: number;
    caption: string | null;
    gradient: string;
  }> = [];

  if (project) {
    const { data: generationJobs } = await supabase
      .from("generation_jobs")
      .select("id, status, caption_text, special_day_id, created_at")
      .eq("project_id", project.id)
      .order("created_at", { ascending: true });

    jobs =
      generationJobs?.map((job, index) => ({
        id: job.id,
        dayName: "Özel gün postu",
        dateLabel: new Date(job.created_at).toLocaleDateString("tr-TR"),
        status: mapJobStatus(job.status),
        imageIndex: index,
        caption: job.caption_text,
        gradient: pickGradient(index),
      })) ?? [];
  }

  const memberSince = project?.created_at
    ? new Date(project.created_at).toLocaleDateString("tr-TR", {
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleDateString("tr-TR", { month: "long", year: "numeric" });

  return (
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
        postsTotal: 30,
        postsReady: jobs.filter((job) => job.status === "ready").length,
        postsGenerating: jobs.filter((job) => job.status === "generating").length,
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
  );
}

function mapJobStatus(status: string) {
  if (status === "ready") return "ready";
  if (status === "failed") return "failed";
  if (status === "queued") return "queued";
  return "generating";
}

const gradients = [
  "from-rose-600 via-red-700 to-rose-950",
  "from-emerald-500 via-green-600 to-emerald-900",
  "from-pink-400 via-rose-500 to-fuchsia-800",
  "from-teal-500 via-emerald-600 to-teal-950",
  "from-violet-500 via-purple-600 to-indigo-950",
  "from-amber-400 via-orange-500 to-amber-900",
];

function pickGradient(index: number) {
  return gradients[index % gradients.length];
}
