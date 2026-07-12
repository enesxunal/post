import { DashboardProjectBootstrap } from "@/components/dashboard/dashboard-project-bootstrap";
import { UserDashboard } from "@/components/dashboard/user-dashboard";
import {
  buildProjectBundles,
  pickProjectBundle,
} from "@/lib/dashboard/project-bundles";
import { findProjectIdByOrderId } from "@/lib/generation/queue-processor";
import { parseProfileNames } from "@/lib/profile/dashboard-user";
import { requireSessionUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ job?: string; project?: string }>;
}) {
  const { job: initialJobId, project: initialProjectId } = await searchParams;
  const user = await requireSessionUser("/dashboard");
  const supabase = await createSupabaseServerClient();

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

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
      logo_url,
      remaining_credits,
      bonus_credits_granted,
      status,
      created_at,
      generation_jobs (
        id,
        status,
        type,
        caption_text,
        image_url,
        design_metadata,
        created_at,
        error_message,
        approved_at,
        story_status,
        hashtags
      )
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const projectBundles = buildProjectBundles(projects ?? []);
  const activeBundle = pickProjectBundle(projectBundles, initialProjectId);
  const profileNames = parseProfileNames(profileRow?.full_name, user);
  const avatarUrl = profileRow?.avatar_url ?? activeBundle?.logoUrl ?? null;

  const memberSince = activeBundle?.createdAt
    ? new Date(activeBundle.createdAt).toLocaleDateString("tr-TR", {
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleDateString("tr-TR", { month: "long", year: "numeric" });

  const liveGenerating = projectBundles.some((bundle) => bundle.postsGenerating > 0);

  let paidOrderNeedsSetup = false;
  if (projectBundles.length === 0) {
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
      <DashboardProjectBootstrap hasProject={projectBundles.length > 0} />
      <UserDashboard
        liveGenerating={liveGenerating}
        user={{
          firstName: profileNames.firstName,
          lastName: profileNames.lastName,
          email: user.email,
          businessName: activeBundle?.brandName ?? "Henüz proje yok",
          sector: activeBundle?.sectorLabel ?? "—",
          visualStyle: activeBundle?.visualStyleLabel ?? "—",
          primaryColor: activeBundle?.primaryColor ?? "#16A34A",
          logoInitial: (activeBundle?.brandName ?? user.firstName).charAt(0).toUpperCase(),
          avatarUrl,
          logoUrl: activeBundle?.logoUrl ?? null,
          brandColors: activeBundle?.brandColors ?? ["#16A34A"],
          packageName: "Ana Paket",
          postsTotal: activeBundle?.postsTotal ?? 30,
          postsReady: activeBundle?.postsReady ?? 0,
          postsGenerating: activeBundle?.postsGenerating ?? 0,
          addons: activeBundle?.addons ?? [],
          memberSince,
        }}
        projectBundles={projectBundles}
        initialProjectId={activeBundle?.project.id}
        postFormat={activeBundle?.postFormat ?? "square"}
        hasStoryAddon={activeBundle?.hasStoryAddon ?? false}
        hasCaptionAddon={activeBundle?.hasCaptionAddon ?? false}
        hasCalendarAddon={activeBundle?.hasCalendarAddon ?? false}
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
