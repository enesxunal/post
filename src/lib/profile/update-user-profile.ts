import { patchProjectMeta } from "@/lib/generation/project-service";
import { persistBrandLogo } from "@/lib/storage/brand-logos";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type UpdateUserProfileInput = {
  userId: string;
  projectId: string;
  fullName?: string;
  brandName?: string;
  primaryColor?: string;
  brandColors?: string[];
  avatarUrl?: string | null;
  logoUrl?: string | null;
  /** true ise yeni logo aynı zamanda profil fotoğrafı olur */
  syncAvatarWithLogo?: boolean;
};

async function getWritableClient() {
  return createSupabaseAdminClient() ?? (await createSupabaseServerClient());
}

async function persistImageUrl(url: string | null | undefined, userId: string) {
  if (!url?.trim()) return null;
  if (url.startsWith("data:")) {
    return persistBrandLogo(url, userId);
  }
  return url.trim();
}

export async function updateUserProfile(input: UpdateUserProfileInput) {
  const supabase = await getWritableClient();

  const { data: project } = await supabase
    .from("projects")
    .select("id, user_id, brand_name, brand_description, primary_color, logo_url")
    .eq("id", input.projectId)
    .eq("user_id", input.userId)
    .maybeSingle();

  if (!project) {
    throw new Error("Proje bulunamadı");
  }

  const projectPatch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.brandName?.trim()) {
    projectPatch.brand_name = input.brandName.trim();
  }

  if (input.primaryColor?.trim()) {
    projectPatch.primary_color = input.primaryColor.trim();
  }

  let nextLogoUrl = project.logo_url as string | null;
  if (input.logoUrl !== undefined) {
    nextLogoUrl = await persistImageUrl(input.logoUrl, input.userId);
    projectPatch.logo_url = nextLogoUrl;
  }

  if (input.brandColors?.length) {
    const colors = input.brandColors
      .map((color) => color.trim())
      .filter(Boolean)
      .slice(0, 4);
    projectPatch.brand_description = patchProjectMeta(project.brand_description, {
      brandColors: colors,
    });
    if (!input.primaryColor?.trim() && colors[0]) {
      projectPatch.primary_color = colors[0];
    }
  }

  const { error: projectError } = await supabase
    .from("projects")
    .update(projectPatch)
    .eq("id", input.projectId)
    .eq("user_id", input.userId);

  if (projectError) {
    throw new Error(projectError.message);
  }

  const profilePatch: Record<string, unknown> = {};

  if (input.fullName !== undefined) {
    profilePatch.full_name = input.fullName.trim() || null;
  }

  if (input.avatarUrl !== undefined) {
    profilePatch.avatar_url = await persistImageUrl(input.avatarUrl, input.userId);
  } else if (input.syncAvatarWithLogo && nextLogoUrl) {
    profilePatch.avatar_url = nextLogoUrl;
  }

  if (Object.keys(profilePatch).length > 0) {
    const { error: profileError } = await supabase
      .from("profiles")
      .update(profilePatch)
      .eq("id", input.userId);

    if (profileError) {
      throw new Error(profileError.message);
    }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", input.userId)
    .maybeSingle();

  const { data: updatedProject } = await supabase
    .from("projects")
    .select("brand_name, primary_color, logo_url, brand_description")
    .eq("id", input.projectId)
    .maybeSingle();

  return {
    fullName: profile?.full_name ?? null,
    avatarUrl: profile?.avatar_url ?? null,
    brandName: updatedProject?.brand_name ?? project.brand_name,
    primaryColor: updatedProject?.primary_color ?? project.primary_color,
    logoUrl: updatedProject?.logo_url ?? nextLogoUrl,
  };
}
