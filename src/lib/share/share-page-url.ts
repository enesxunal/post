import { CANONICAL_APP_URL } from "@/lib/config";

/** Takvim hatırlatıcılarından açılan paylaşım sayfası */
export function buildSharePageUrl(jobId: string) {
  return `${CANONICAL_APP_URL}/paylasim/${jobId}`;
}
