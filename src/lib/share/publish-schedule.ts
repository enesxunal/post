import { getSpecialDayById } from "@/lib/special-days-data";

export type PublishScheduleInput = {
  dayId: string;
  dayName: string;
  dateLabel: string;
  brandName: string;
  caption?: string | null;
  hashtags?: string[];
};

const MOVABLE_HINTS: Record<string, string> = {
  "ramadan-feast": "Ramazan Bayramı — tarihi her yıl değişir, takvimde günü kontrol edin.",
  "eid-al-adha": "Kurban Bayramı — tarihi her yıl değişir, takvimde günü kontrol edin.",
  regaib: "Regaib Kandili — hicri takvime göre değişir.",
  mirac: "Miraç Kandili — hicri takvime göre değişir.",
  berat: "Berat Kandili — hicri takvime göre değişir.",
  qadr: "Kadir Gecesi — hicri takvime göre değişir.",
  mawlid: "Mevlid Kandili — hicri takvime göre değişir.",
  ashura: "Aşure Günü — hicri takvime göre değişir.",
  "three-months-start": "Üç ayların başlangıcı — hicri takvime göre değişir.",
  "hijri-new-year": "Hicri yılbaşı — hicri takvime göre değişir.",
  "mothers-day": "Anneler Günü — genelde Mayıs'ın 2. Pazarı.",
  "fathers-day": "Babalar Günü — genelde Haziran'ın 3. Pazarı.",
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function formatIcsUtc(date: Date) {
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
}

function escapeIcs(text: string) {
  return text.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

/** MM-DD veya özel anahtar → bir sonraki yayın tarihi (sabah 10:00 TR) */
export function resolvePublishDate(dayId: string, dateLabel: string): Date {
  const day = getSpecialDayById(dayId);
  const raw = day?.dateValue ?? dateLabel;
  const now = new Date();

  const fixed = raw.match(/^(\d{2})-(\d{2})$/);
  if (fixed) {
    const month = Number(fixed[2]) - 1;
    const dayOfMonth = Number(fixed[1]);
    let candidate = new Date(Date.UTC(now.getFullYear(), month, dayOfMonth, 7, 0, 0));
    if (candidate.getTime() < now.getTime()) {
      candidate = new Date(Date.UTC(now.getFullYear() + 1, month, dayOfMonth, 7, 0, 0));
    }
    return candidate;
  }

  if (raw === "weekly-friday" || dayId.includes("friday")) {
    const candidate = new Date(now);
    const dayIndex = candidate.getDay();
    const daysUntilFriday = (5 - dayIndex + 7) % 7 || 7;
    candidate.setDate(candidate.getDate() + daysUntilFriday);
    candidate.setHours(10, 0, 0, 0);
    return candidate;
  }

  // Değişken / hicri günler: 7 gün sonrası hatırlatıcı (kullanıcı tarihi düzenler)
  const fallback = new Date(now);
  fallback.setDate(fallback.getDate() + 7);
  fallback.setHours(10, 0, 0, 0);
  return fallback;
}

export function buildShareCaption(input: PublishScheduleInput): string {
  const tags = input.hashtags?.length ? `\n\n${input.hashtags.join(" ")}` : "";
  return (input.caption?.trim() || `${input.brandName} — ${input.dayName} paylaşımı`) + tags;
}

export function buildIcsEvent(input: PublishScheduleInput): { filename: string; content: string } {
  const start = resolvePublishDate(input.dayId, input.dateLabel);
  const end = new Date(start.getTime() + 30 * 60 * 1000);
  const caption = buildShareCaption(input);
  const day = getSpecialDayById(input.dayId);
  const movableNote = MOVABLE_HINTS[input.dayId] ?? MOVABLE_HINTS[day?.dateValue ?? ""] ?? "";

  const description = [
    `Marka: ${input.brandName}`,
    "",
    "Instagram / Facebook paylaşım metni:",
    caption,
    "",
    "Adımlar:",
    "1) poust panelinden görseli indir",
    "2) Metni kopyala",
    "3) Meta Business Suite veya Instagram'da paylaş",
    movableNote ? `\nNot: ${movableNote}` : "",
    "",
    "poust.app",
  ]
    .filter(Boolean)
    .join("\n");

  const uid = `${input.dayId}-${start.getTime()}@poust.app`;
  const content = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//poust//Paylasim Takvimi//TR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${formatIcsUtc(new Date())}`,
    `DTSTART:${formatIcsUtc(start)}`,
    `DTEND:${formatIcsUtc(end)}`,
    `SUMMARY:${escapeIcs(`${input.brandName} — ${input.dayName} paylaşımı`)}`,
    `DESCRIPTION:${escapeIcs(description)}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT30M",
    "ACTION:DISPLAY",
    "DESCRIPTION:Paylaşım zamanı yaklaşıyor",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return {
    filename: `poust-${input.dayId}-paylasim.ics`,
    content,
  };
}

function formatGoogleCalendarDate(date: Date) {
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}00Z`;
}

export function buildGoogleCalendarUrl(input: PublishScheduleInput): string {
  const start = resolvePublishDate(input.dayId, input.dateLabel);
  const end = new Date(start.getTime() + 30 * 60 * 1000);
  const caption = buildShareCaption(input);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${input.brandName} — ${input.dayName}`,
    dates: `${formatGoogleCalendarDate(start)}/${formatGoogleCalendarDate(end)}`,
    details: `Paylaşım metni:\n${caption}\n\nGörseli poust panelinden indirip Instagram veya Meta Business Suite ile paylaşın.`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function downloadIcsFile(input: PublishScheduleInput) {
  const { filename, content } = buildIcsEvent(input);
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
