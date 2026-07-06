import { NextResponse } from "next/server";

import {
  createProjectWithJobs,
  getProjectStatus,
} from "@/lib/generation/project-service";
import type { OnboardingDraft } from "@/lib/onboarding/draft";
import { requireSessionUser } from "@/lib/supabase/auth";

export async function POST(request: Request) {
  const user = await requireSessionUser("/login");

  const body = (await request.json()) as {
    draft?: OnboardingDraft;
    orderId?: string;
    projectId?: string;
  };

  if (body.projectId) {
    const status = await getProjectStatus(body.projectId, user.id);
    if (!status) {
      return NextResponse.json({ error: "Proje bulunamadı" }, { status: 404 });
    }
    return NextResponse.json(status);
  }

  if (!body.draft?.brandName || !body.draft.selectedDays?.length) {
    return NextResponse.json(
      { error: "Onboarding bilgileri eksik. Formu tekrar doldurun." },
      { status: 400 },
    );
  }

  try {
    const created = await createProjectWithJobs(user.id, body.draft, body.orderId);
    const status = await getProjectStatus(created.projectId, user.id);
    return NextResponse.json({ ...created, ...status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Proje başlatılamadı";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const user = await requireSessionUser("/login");
  const projectId = new URL(request.url).searchParams.get("projectId");

  if (!projectId) {
    return NextResponse.json({ error: "projectId gerekli" }, { status: 400 });
  }

  const status = await getProjectStatus(projectId, user.id);
  if (!status) {
    return NextResponse.json({ error: "Proje bulunamadı" }, { status: 404 });
  }

  return NextResponse.json(status);
}
