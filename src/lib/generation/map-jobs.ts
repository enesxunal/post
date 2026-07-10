import { getSpecialDayById } from "@/lib/special-days-data";

const gradients = [
  "from-rose-600 via-red-700 to-rose-950",
  "from-emerald-500 via-green-600 to-emerald-900",
  "from-pink-400 via-rose-500 to-fuchsia-800",
  "from-teal-500 via-emerald-600 to-teal-950",
  "from-violet-500 via-purple-600 to-indigo-950",
  "from-amber-400 via-orange-500 to-amber-900",
];

export function mapJobStatus(status: string) {
  if (status === "ready") return "ready";
  if (status === "failed") return "failed";
  if (status === "draft") return "draft";
  if (status === "queued") return "queued";
  return "generating";
}

export function mapGenerationJobsForDashboard(
  jobs: Array<{
    id: string;
    status: string;
    type: string;
    caption_text: string | null;
    image_url?: string | null;
    created_at: string;
    error_message?: string | null;
    approved_at?: string | null;
    story_image_url?: string | null;
    story_status?: string | null;
    hashtags?: string[] | null;
  }>,
) {
  return jobs.map((job, index) => {
    const day = getSpecialDayById(job.type);
    return {
      id: job.id,
      dayId: job.type,
      dayName: day?.name ?? "Özel gün postu",
      dateLabel: day?.dateValue ?? new Date(job.created_at).toLocaleDateString("tr-TR"),
      status: mapJobStatus(job.status),
      imageIndex: index,
      caption: job.caption_text,
      hashtags: job.hashtags ?? [],
      imageUrl: job.image_url,
      approvedAt: job.approved_at,
      storyImageUrl: job.story_image_url,
      storyStatus: job.story_status,
      gradient: gradients[index % gradients.length],
      errorMessage: job.error_message,
    };
  });
}
