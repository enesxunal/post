const MISSING_TABLE = /relation ["']?([\w.]+)["']? does not exist/i;

export function isTrendBrainSetupError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    MISSING_TABLE.test(message) ||
    message.includes("trend_brain_runs") ||
    message.includes("performance_aggregates") ||
    message.includes("revision_feedback") ||
    message.includes("prompt_versions")
  );
}

export function formatTrendBrainError(error: unknown): string {
  const message = error instanceof Error ? error.message : "Trend Brain hatası";

  if (isTrendBrainSetupError(error)) {
    return [
      "Trend Brain veritabanı tabloları henüz kurulmamış.",
      "Supabase → SQL Editor → migrations/20260710_trend_brain.sql dosyasını çalıştırın.",
      `Teknik: ${message}`,
    ].join(" ");
  }

  if (message.includes("SUPABASE_SECRET_KEY")) {
    return "SUPABASE_SECRET_KEY tanımlı değil. Vercel ortam değişkenlerini kontrol edin.";
  }

  return message;
}
