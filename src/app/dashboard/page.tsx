import { DashboardProjectBootstrap } from "@/components/dashboard/dashboard-project-bootstrap";
import { UserDashboard } from "@/components/dashboard/user-dashboard";
import { decodeProjectMeta } from "@/lib/generation/project-service";
import { mapGenerationJobsForDashboard } from "@/lib/generation/map-jobs";
import { findProjectIdByOrderId } from "@/lib/generation/queue-processor";
import { getSectorOptionsFromSeed } from "@/lib/sectors/seed-data";
import { resolveStyleName } from "@/lib/styles/seed-data";
import { requireSessionUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ProjectRow = {
  id: string;
  brand_name: string;
  brand_description: string | null;
  sector: string;
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

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ job?: string }>;
}) {
  const { job: initialJobId } = await searchParams;
  const user = await requireSessionUser("/dashboard");
  const supabase = await createSupabaseServerClient();

  const { data: projects } = await supabase
    .from("projects")
    .select(
      `
      id,
      brand_name,
      brand_description,
      sector,
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

  const postsGenerating = jobs.filter((job) => job.status === "generating").length;
  const sectorLabel =
    meta?.customSector ??
    (project
      ? getSectorOptionsFromSeed().find((item) => item.key === project.sector)?.label ?? "—"
      : "—");
  const styleLabel = project?.visual_style ? resolveStyleName(project.visual_style) : "—";

  let paidOrderNeedsSetup = false;
  if (!project) {
    const { data: paidOrders } = await supabase
      .from("orders")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "paid")
      .order("created_at", { ascending: false });

    for (const order of paidOrders ?? []) {
      const existing = await findProjectIdByOrderId(user.id, order.id);
      if (!existing?.id) {
        paidOrderNeedsSetup = true;
        break;
      }
    }
  }

  return (
    <>
      <DashboardProjectBootstrap hasProject={Boolean(project)} />
      <UserDashboard
      liveGenerating={postsGenerating > 0}
      user={{
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        businessName: project?.brand_name ?? "Henüz proje yok",
        sector: sectorLabel,
        visualStyle: styleLabel,
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
      hasCaptionAddon={meta?.purchasedAddons.includes("caption") ?? false}
      hasCalendarAddon={meta?.purchasedAddons.includes("calendar") ?? false}
      emptyMessage={
        paidOrderNeedsSetup
          ? "Ödemeniz onaylandı ama paket kurulumu yarım kalmış. Aşağıdaki butona tıklayıp formu tekrar doldurun — yeniden ödeme gerekmez."
          : undefined
      }
      initialSelectedJobId={initialJobId}
    />
    </>
  );
}
