import { NextResponse } from "next/server";

import { updateUserProfile } from "@/lib/profile/update-user-profile";
import { getSessionUser } from "@/lib/supabase/auth";

export async function PATCH(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    projectId?: string;
    fullName?: string;
    brandName?: string;
    primaryColor?: string;
    brandColors?: string[];
    avatarUrl?: string | null;
    logoUrl?: string | null;
    syncAvatarWithLogo?: boolean;
  };

  if (!body.projectId) {
    return NextResponse.json({ error: "projectId gerekli" }, { status: 400 });
  }

  try {
    const result = await updateUserProfile({
      userId: user.id,
      projectId: body.projectId,
      fullName: body.fullName,
      brandName: body.brandName,
      primaryColor: body.primaryColor,
      brandColors: body.brandColors,
      avatarUrl: body.avatarUrl,
      logoUrl: body.logoUrl,
      syncAvatarWithLogo: body.syncAvatarWithLogo,
    });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Profil güncellenemedi";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
