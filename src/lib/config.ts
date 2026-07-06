export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "PostName";

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
export const JOB_STUCK_MINUTES = 8;
export const GENERATION_POLL_MS = 15000;

/** true: sadece 1 görsel isteği + yerel prompt (marka brief ve vision QC kapalı) */
export const LEAN_GENERATION_MODE =
  process.env.LEAN_GENERATION_MODE?.trim() !== "false";

export const GENERATING_MESSAGES = [
  "Markanız analiz ediliyor...",
  "Özel günleriniz sıraya alındı...",
  "Tasarım brief'leri hazırlanıyor...",
  "AI atölyesi çalışıyor...",
  "Postlarınız galeriye yerleştiriliyor...",
];

export const TODO_LABELS = {
  tosla: "Tosla canlı ödeme bağlı — env eksikse mock moda düşer",
  imageProvider: "Ideogram 4.0 görsel + Gemini caption/QC",
  emailProvider: "TODO: configure email provider",
  cronWorker: "TODO: deploy cron worker",
} as const;
