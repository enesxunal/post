import { LEAN_GENERATION_MODE, QUALITY_CHECK_ENABLED } from "@/lib/config";

export function isLeanGenerationMode() {
  return LEAN_GENERATION_MODE;
}

/** Post başına yaklaşık API maliyeti (lean vs full). */
export function generationApiProfile() {
  if (LEAN_GENERATION_MODE) {
    return {
      mode: "lean" as const,
      callsPerPost: "1 görsel (+1 caption varsa)",
      brandBrief: false,
      visionQualityCheck: QUALITY_CHECK_ENABLED,
      maxRetries: 1,
    };
  }

  return {
    mode: "full" as const,
    callsPerPost: "1 brief + 1 görsel + 1 vision QC (+ caption)",
    brandBrief: true,
    visionQualityCheck: true,
    maxRetries: 3,
  };
}
