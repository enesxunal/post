import { NextResponse } from "next/server";

import {
  createProjectWithJobs,
  getProjectStatus,
  getProjectStatusLightweight,
} from "@/lib/generation/project-service";
import { findProjectIdByOrderId } from "@/lib/generation/queue-processor";
import { scheduleQueueProcessing } from "@/lib/generation/schedule-queue";
import type { OnboardingDraft } from "@/lib/onboarding/draft";
import { isOrderPaid, userHasPaidOrder } from "@/lib/orders/service";
import { getSessionUser } from "@/lib/supabase/auth";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

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
  if (!status.done && !status.stopped) {
    scheduleQueueProcessing(body.projectId);
  }
    return NextResponse.json(status);
  }

  const orderId = body.orderId ?? body.draft?.orderId;

  if (orderId) {
    const existing = await findProjectIdByOrderId(user.id, orderId);
    if (existing?.id) {
      scheduleQueueProcessing(existing.id);
      const status = await getProjectStatus(existing.id, user.id);
      return NextResponse.json(status ?? { projectId: existing.id });
    }
  }

  if (!body.draft?.brandName || !body.draft.selectedDays?.length) {
    return NextResponse.json(
      { error: "Onboarding bilgileri eksik. Formu tekrar doldurun." },
      { status: 400 },
    );
  }

  const paymentOk = orderId
    ? await isOrderPaid(orderId, user.id)
    : await userHasPaidOrder(user.id);

  if (!paymentOk) {
    return NextResponse.json(
      {
        error:
          "Ödeme henüz onaylanmadı. EFT yaptıysanız admin onayını bekleyin veya kart ile ödeyin.",
      },
      { status: 402 },
    );
  }

  try {
    const created = await createProjectWithJobs(
      {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
      body.draft,
      orderId,
    );

    scheduleQueueProcessing(created.projectId);

    const status = await getProjectStatus(created.projectId, user.id);
    return NextResponse.json({ ...created, ...status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Proje başlatılamadı";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const url = new URL(request.url);
  const projectId = url.searchParams.get("projectId");
  const lightweight = url.searchParams.get("lightweight") === "1";

  if (!projectId) {
    return NextResponse.json({ error: "projectId gerekli" }, { status: 400 });
  }

  const status = lightweight
    ? await getProjectStatusLightweight(projectId, user.id)
    : await getProjectStatus(projectId, user.id);

  if (!status) {
    return NextResponse.json({ error: "Proje bulunamadı" }, { status: 404 });
  }

  return NextResponse.json(status);
}
