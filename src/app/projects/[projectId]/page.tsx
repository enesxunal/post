import { UserDashboard } from "@/components/dashboard/user-dashboard";
import {
  buildProjectBundles,
  pickProjectBundle,
} from "@/lib/dashboard/project-bundles";
import { parseProfileNames, resolveBrandColors } from "@/lib/profile/dashboard-user";
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
  const activeBundle = pickProjectBundle(projectBundles, projectId);
  const profileNames = parseProfileNames(profileRow?.full_name, user);

  if (!activeBundle) {
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
          brandColors: ["#16A34A"],
          packageName: "Ana Paket",
          postsTotal: 0,
          postsReady: 0,
          postsGenerating: 0,
          addons: [],
          memberSince: "—",
        }}
        projectBundles={[]}
        emptyMessage="Bu projeye erişiminiz yok veya proje henüz oluşturulmamış."
      />
    );
  }

  const liveGenerating = projectBundles.some((bundle) => bundle.postsGenerating > 0);
  const avatarUrl = profileRow?.avatar_url ?? activeBundle.logoUrl;

  return (
    <UserDashboard
      liveGenerating={liveGenerating}
      user={{
        firstName: profileNames.firstName,
        lastName: profileNames.lastName,
        email: user.email,
        businessName: activeBundle.brandName,
        sector: activeBundle.sectorLabel,
        visualStyle: activeBundle.visualStyleLabel,
        primaryColor: activeBundle.primaryColor,
        logoInitial: activeBundle.logoInitial,
        avatarUrl,
        logoUrl: activeBundle.logoUrl,
        brandColors: resolveBrandColors(activeBundle.brandColors, activeBundle.primaryColor),
        packageName: "Ana Paket",
        postsTotal: activeBundle.postsTotal,
        postsReady: activeBundle.postsReady,
        postsGenerating: activeBundle.postsGenerating,
        addons: activeBundle.addons,
        memberSince: new Date(activeBundle.createdAt).toLocaleDateString("tr-TR", {
          month: "long",
          year: "numeric",
        }),
      }}
      projectBundles={projectBundles}
      initialProjectId={projectId}
      postFormat={activeBundle.postFormat}
      hasStoryAddon={activeBundle.hasStoryAddon}
      hasCaptionAddon={activeBundle.hasCaptionAddon}
      hasCalendarAddon={activeBundle.hasCalendarAddon}
    />
  );
}
