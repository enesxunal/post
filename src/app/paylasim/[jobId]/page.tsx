import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SharePostPage } from "@/components/share/share-post-page";
import { decodeProjectMeta } from "@/lib/generation/project-service";
import { mapGenerationJobsForDashboard } from "@/lib/generation/map-jobs";
import { requireSessionUser } from "@/lib/supabase/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{ jobId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { jobId } = await params;
  return {
    title: "Paylaşım",
    robots: { index: false, follow: false },
    description: `poust paylaşım sayfası — ${jobId}`,
  };
}

export default async function PaylasimJobPage({ params }: PageProps) {
  const { jobId } = await params;
  const user = await requireSessionUser(`/paylasim/${jobId}`);
  const supabase = await createSupabaseServerClient();

  const { data: job } = await supabase
    .from("generation_jobs")
    .select("id, status, type, caption_text, image_url, approved_at, hashtags, project_id")
    .eq("id", jobId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!job || job.status !== "ready" || !job.approved_at) {
    notFound();
  }

  const { data: project } = await supabase
    .from("projects")
    .select("id, brand_name, brand_description, user_id")
    .eq("id", job.project_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!project) {
    notFound();
  }

  const meta = decodeProjectMeta(project.brand_description);
  const hasCalendarAddon = meta?.purchasedAddons.includes("calendar") ?? false;
  if (!hasCalendarAddon) {
    notFound();
  }

  const mapped = mapGenerationJobsForDashboard([
    {
      id: job.id,
      status: job.status,
      type: job.type,
      caption_text: job.caption_text,
      image_url: job.image_url,
      created_at: new Date().toISOString(),
      approved_at: job.approved_at,
      hashtags: job.hashtags,
    },
  ])[0];

  return (
    <SharePostPage
      jobId={mapped.id}
      dayName={mapped.dayName}
      dateLabel={mapped.dateLabel}
      brandName={project.brand_name}
      caption={mapped.caption}
      hashtags={mapped.hashtags ?? []}
      postFormat={meta?.postFormat ?? "square"}
      imageUrl={mapped.imageUrl}
      gradient={mapped.gradient}
    />
  );
}
