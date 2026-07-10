export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "poust";
export const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN ?? "poust.app";
/** Kanonik canlı adres — SEO, sitemap, ödeme callback */
export const CANONICAL_APP_URL = "https://www.poust.app";
export const CANONICAL_HOST = "www.poust.app";
export const APEX_HOST = "poust.app";

export function getAppUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim()?.replace(/\/$/, "");

  if (fromEnv) {
    // Canlıda yanlışlıkla localhost env girilmişse www kullan
    if (process.env.NODE_ENV === "production" && fromEnv.includes("localhost")) {
      return CANONICAL_APP_URL;
    }
    // Eski Vercel preview URL veya apex domain → kanonik www kullan
    if (
      fromEnv.includes("vercel.app") ||
      fromEnv === `https://${APEX_HOST}` ||
      fromEnv === `http://${APEX_HOST}`
    ) {
      return CANONICAL_APP_URL;
    }
    return fromEnv;
  }

  if (process.env.NODE_ENV === "production") return CANONICAL_APP_URL;
  return "http://localhost:3000";
}

/** SEO / sitemap / metadata için her zaman güncel kanonik URL */
export function getCanonicalAppUrl(): string {
  return getAppUrl();
}

export const APP_URL = getAppUrl();

/** İletişim — vitrin ve iletişim sayfası */
export const CONTACT_EMAIL = "destek@poust.app";
export const CONTACT_ADDRESS = "Mustafa Kemal Mah. 2139. Sok. 15 Çankaya/ANKARA";

/** Pazarlama sayfalarındaki Başla / paket CTA'ları önce girişe yönlendirir */
export const MARKETING_START_HREF = "/login?next=%2Fonboarding";

/** Logo gradyanı — poust marka rengi */
export const BRAND_GRADIENT = {
  from: "#38C661",
  to: "#1E9E4B",
} as const;

export const BASE_PACKAGE_PRICE = 299;
export const CAPTION_ADDON_PRICE = 99;
export const STORY_ADDON_PRICE = 149;
export const CALENDAR_ADDON_PRICE = 199;
export const MAX_SELECTED_DAYS = 30;
export const INCLUDED_REVISION_CREDITS = 10;
export const BONUS_REVISION_CREDITS = 5;

export const MAX_BRAND_COLORS = 3;
export const FRIDAY_DAY_ID = "friday-blessing";
export const MAX_FRIDAY_POST_COUNT = 4;

/** Hazır palet — KOBİ’lerin en sık kullandığı marka renkleri. */
export const BRAND_COLOR_PALETTE = [
  { hex: "#1D4ED8", label: "Kurumsal mavi" },
  { hex: "#0F172A", label: "Lacivert" },
  { hex: "#16A34A", label: "Yeşil" },
  { hex: "#DC2626", label: "Kırmızı" },
  { hex: "#991B1B", label: "Bordo" },
  { hex: "#EA580C", label: "Turuncu" },
  { hex: "#EAB308", label: "Sarı" },
  { hex: "#FACC15", label: "Altın sarı" },
  { hex: "#D97706", label: "Altın" },
  { hex: "#7C3AED", label: "Mor" },
  { hex: "#DB2777", label: "Pembe" },
  { hex: "#0891B2", label: "Turkuaz" },
  { hex: "#92400E", label: "Kahverengi" },
  { hex: "#171717", label: "Siyah" },
  { hex: "#64748B", label: "Gri" },
  { hex: "#FFFFFF", label: "Beyaz" },
  { hex: "#FFFBEB", label: "Krem" },
] as const;

export const BRAND_COLORS = BRAND_COLOR_PALETTE.map((item) => item.hex);

export const MAX_JOB_RETRIES = 1;
export const JOB_STUCK_MINUTES = 3;
export const GENERATION_POLL_MS = 5000;
/** Dashboard arka plan polling — üretim ekranından daha seyrek */
export const DASHBOARD_POLL_MS = 15000;

/** true: sadece 1 görsel isteği + yerel prompt (marka brief ve vision QC kapalı) */
export const LEAN_GENERATION_MODE =
  process.env.LEAN_GENERATION_MODE?.trim() !== "false";

/** Gemini vision kalite kontrolü — varsayılan kapalı (hız için) */
export const QUALITY_CHECK_ENABLED =
  process.env.QUALITY_CHECK_ENABLED?.trim() === "true";

export const GENERATING_MESSAGES = [
  "Markanız analiz ediliyor...",
  "Özel günleriniz sıraya alındı...",
  "Tasarım brief'leri hazırlanıyor...",
  "AI atölyesi çalışıyor...",
  "Postlarınız galeriye yerleştiriliyor...",
];

export const TODO_LABELS = {
  tosla: "Tosla canlı ödeme bağlı — env eksikse mock moda düşer",
  imageProvider: "OpenAI gpt-image-1.5 görsel + Gemini caption/QC",
  emailProvider: "TODO: configure email provider",
  cronWorker: "TODO: deploy cron worker",
} as const;
