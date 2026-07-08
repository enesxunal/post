import { getAppUrl } from "@/lib/config";

const QUEUE_PATH = "/api/generation/process-queue";

function getQueueSecret() {
  return process.env.CRON_SECRET ?? process.env.GENERATION_QUEUE_SECRET ?? "";
}

export async function triggerQueueProcessing(projectId: string) {
  const secret = getQueueSecret();
  const url = `${getAppUrl()}${QUEUE_PATH}`;

  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(secret ? { Authorization: `Bearer ${secret}` } : {}),
      },
      body: JSON.stringify({ projectId }),
      cache: "no-store",
    });
  } catch (error) {
    console.error("Queue trigger failed:", error);
  }
}

export function scheduleQueueProcessing(projectId: string) {
  void triggerQueueProcessing(projectId);
}
