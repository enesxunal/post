import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type ResetGenerationResult = {
  userId: string;
  email: string;
  projectsReset: number;
  jobsReset: number;
};

export async function resetUserGenerationByEmail(email: string): Promise<ResetGenerationResult> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    throw new Error("SUPABASE_SECRET_KEY gerekli");
  }

  const normalized = email.trim().toLowerCase();
  if (!normalized) {
    throw new Error("E-posta gerekli");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email")
    .eq("email", normalized)
    .maybeSingle();

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (!profile) {
    throw new Error("Kullanıcı bulunamadı");
  }

  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select("id")
    .eq("user_id", profile.id);

  if (projectsError) {
    throw new Error(projectsError.message);
  }

  const projectIds = (projects ?? []).map((project) => project.id);

  if (projectIds.length > 0) {
    const { error: projectUpdateError } = await supabase
      .from("projects")
      .update({
        status: "generating",
        generation_stopped_at: null,
        updated_at: new Date().toISOString(),
      })
      .in("id", projectIds);

    if (projectUpdateError) {
      throw new Error(projectUpdateError.message);
    }
  }

  const { data: jobs, error: jobsError } = await supabase
    .from("generation_jobs")
    .update({
      status: "queued",
      image_url: null,
      thumbnail_url: null,
      story_image_url: null,
      story_status: null,
      caption_text: null,
      hashtags: [],
      error_message: null,
      retry_count: 0,
      approved_at: null,
      prompt: null,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", profile.id)
    .select("id");

  if (jobsError) {
    throw new Error(jobsError.message);
  }

  return {
    userId: profile.id,
    email: profile.email,
    projectsReset: projectIds.length,
    jobsReset: jobs?.length ?? 0,
  };
}
