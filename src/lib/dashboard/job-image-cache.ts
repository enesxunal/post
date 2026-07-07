type JobImagePayload = {
  imageUrl?: string;
  storyImageUrl?: string;
};

const cache = new Map<string, Promise<JobImagePayload | null>>();

let inFlight = 0;
const waitQueue: Array<() => void> = [];
const MAX_CONCURRENT = 3;

function releaseSlot() {
  inFlight = Math.max(0, inFlight - 1);
  const next = waitQueue.shift();
  if (next) next();
}

function acquireSlot() {
  if (inFlight >= MAX_CONCURRENT) {
    return new Promise<void>((resolve) => {
      waitQueue.push(resolve);
    });
  }
  inFlight += 1;
  return Promise.resolve();
}

async function fetchJobImage(jobId: string, story: boolean): Promise<JobImagePayload | null> {
  await acquireSlot();
  try {
    const thumb = story ? "" : "&thumb=1";
    const response = await fetch(`/api/generation/job-image?jobId=${jobId}${thumb}`, {
      cache: "no-store",
    });
    if (!response.ok) return null;
    return (await response.json()) as JobImagePayload;
  } finally {
    releaseSlot();
  }
}

export function loadJobImage(jobId: string, story = false): Promise<JobImagePayload | null> {
  const key = `${jobId}:${story ? "story" : "feed"}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const promise = fetchJobImage(jobId, story).then((data) => {
    if (!data) {
      cache.delete(key);
    }
    return data;
  });

  cache.set(key, promise);
  return promise;
}

export function invalidateJobImageCache(jobId?: string) {
  if (!jobId) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (key.startsWith(`${jobId}:`)) {
      cache.delete(key);
    }
  }
}
