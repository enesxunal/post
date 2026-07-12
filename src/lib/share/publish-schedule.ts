import { getSpecialDayById } from "@/lib/special-days-data";
import { CANONICAL_APP_URL } from "@/lib/config";
import { slugifyDownloadName } from "@/lib/share/download-filename";

export type PublishScheduleInput = {
  jobId: string;
  dayId: string;
  dayName: string;
  dateLabel: string;
  brandName: string;
  caption?: string | null;
  hashtags?: string[];
  /** Onaylı + hazır postlarda paylaşım sayfası, değilse panele yönlendir */
  shareReady?: boolean;
  /** Cuma mesajları için kaçıncı cuma (0 = en yakın) */
  fridayOccurrence?: number;
  /** Sabit tarihi olmayan günler için paket sırası */
  sequenceIndex?: number;
};

const POUST_SHARE_HOUR_TR = 9;
/** Türkiye UTC+3 — sabah paylaşım saati */
const POUST_SHARE_HOUR_UTC = POUST_SHARE_HOUR_TR - 3;

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

/** MM-DD veya özel anahtar → yayın tarihi (sabah 09:00 TR) */
export function resolvePublishDate(
  dayId: string,
  dateLabel: string,
  options?: { fridayOccurrence?: number; sequenceIndex?: number },
): Date {
  const day = getSpecialDayById(dayId);
  const raw = day?.dateValue ?? dateLabel;
  const now = new Date();

  const fixed = raw.match(/^(\d{2})-(\d{2})$/);
  if (fixed) {
    const month = Number(fixed[1]) - 1;
    const dayOfMonth = Number(fixed[2]);
    let year = now.getFullYear();
    let candidate = new Date(
      Date.UTC(year, month, dayOfMonth, POUST_SHARE_HOUR_UTC, 0, 0),
    );
    if (candidate.getTime() < now.getTime()) {
      year += 1;
      candidate = new Date(
        Date.UTC(year, month, dayOfMonth, POUST_SHARE_HOUR_UTC, 0, 0),
      );
    }
    return candidate;
  }

  if (raw === "weekly-friday" || dayId.includes("friday")) {
    const occurrence = options?.fridayOccurrence ?? 0;
    const candidate = new Date(now);
    const dayIndex = candidate.getDay();
    let daysUntilFriday = (5 - dayIndex + 7) % 7;
    if (daysUntilFriday === 0 && now.getHours() >= POUST_SHARE_HOUR_TR) {
      daysUntilFriday = 7;
    }
    daysUntilFriday += occurrence * 7;
    candidate.setDate(candidate.getDate() + daysUntilFriday);
    candidate.setHours(POUST_SHARE_HOUR_TR, 0, 0, 0);
    return candidate;
  }

  const fallback = new Date(now);
  const offsetWeeks = Math.max(1, (options?.sequenceIndex ?? 0) + 1);
  fallback.setDate(fallback.getDate() + offsetWeeks * 7);
  fallback.setHours(POUST_SHARE_HOUR_TR, 0, 0, 0);
  return fallback;
}

export function buildShareCaption(input: PublishScheduleInput): string {
  const tags = input.hashtags?.length ? `\n\n${input.hashtags.join(" ")}` : "";
  return (input.caption?.trim() || `${input.brandName} — ${input.dayName} paylaşımı`) + tags;
}

function resolveEventShareUrl(input: PublishScheduleInput) {
  if (input.shareReady) {
    return `${CANONICAL_APP_URL}/paylasim/${input.jobId}`;
  }
  return `${CANONICAL_APP_URL}/dashboard?job=${input.jobId}`;
}

function buildCalendarDescription(input: PublishScheduleInput, caption: string) {
  const shareUrl = resolveEventShareUrl(input);
  const day = getSpecialDayById(input.dayId);
  const movableNote = MOVABLE_HINTS[input.dayId] ?? MOVABLE_HINTS[day?.dateValue ?? ""] ?? "";

  return [
    `poust paylaşım saati`,
    `Marka: ${input.brandName}`,
    "",
    input.shareReady
      ? "Paylaşım sayfası (görsel indir + metin kopyala):"
      : "Görsel henüz hazır değil — panele gidin:",
    shareUrl,
    "",
    "Instagram / Facebook paylaşım metni:",
    caption,
    "",
    "Adımlar:",
    "1) Bağlantıya tıklayın",
    "2) Görseli indirin",
    "3) Metni kopyalayıp Instagram veya Meta Business Suite'te paylaşın",
    movableNote ? `\nNot: ${movableNote}` : "",
    "",
    "poust.app",
  ]
    .filter(Boolean)
    .join("\n");
}

function buildIcsVevent(input: PublishScheduleInput): string {
  const start = resolvePublishDate(input.dayId, input.dateLabel, {
    fridayOccurrence: input.fridayOccurrence,
    sequenceIndex: input.sequenceIndex,
  });
  const end = new Date(start.getTime() + 30 * 60 * 1000);
  const caption = buildShareCaption(input);
  const shareUrl = resolveEventShareUrl(input);
  const description = buildCalendarDescription(input, caption);

  const uid = `${input.jobId}-${start.getTime()}@poust.app`;
  return [
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${formatIcsUtc(new Date())}`,
    `DTSTART:${formatIcsUtc(start)}`,
    `DTEND:${formatIcsUtc(end)}`,
    `SUMMARY:${escapeIcs(`poust paylaşım saati — ${input.dayName}`)}`,
    `DESCRIPTION:${escapeIcs(description)}`,
    `URL:${shareUrl}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT30M",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeIcs(`poust paylaşım saati: ${input.dayName}`)}`,
    "END:VALARM",
    "END:VEVENT",
  ].join("\r\n");
}

export function buildIcsEvent(input: PublishScheduleInput): { filename: string; content: string } {
  const content = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//poust//Paylasim Takvimi//TR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    buildIcsVevent(input),
    "END:VCALENDAR",
  ].join("\r\n");

  return {
    filename: `poust-${input.dayId}-paylasim.ics`,
    content,
  };
}

export function buildBulkIcsCalendar(
  inputs: PublishScheduleInput[],
  brandName: string,
): { filename: string; content: string } {
  const events = inputs.map((input) => buildIcsVevent(input)).join("\r\n");
  const content = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//poust//Paylasim Takvimi//TR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:poust Paylaşım Takvimi",
    events,
    "END:VCALENDAR",
  ].join("\r\n");

  return {
    filename: `${slugifyDownloadName(brandName, "poust")}-paylasim-takvimi.ics`,
    content,
  };
}

export function buildBulkCalendarInputs(
  jobs: Array<{
    id: string;
    dayId: string;
    dayName: string;
    dateLabel: string;
    caption: string | null;
    hashtags?: string[];
    status: string;
    approvedAt?: string | null;
  }>,
  brandName: string,
): PublishScheduleInput[] {
  let fridayOccurrence = 0;

  return jobs.map((job, index) => {
    const isFriday = job.dayId.includes("friday");
    const input: PublishScheduleInput = {
      jobId: job.id,
      dayId: job.dayId,
      dayName: job.dayName,
      dateLabel: job.dateLabel,
      brandName,
      caption: job.caption,
      hashtags: job.hashtags,
      shareReady: job.status === "ready" && Boolean(job.approvedAt),
      fridayOccurrence: isFriday ? fridayOccurrence++ : undefined,
      sequenceIndex: index,
    };
    return input;
  });
}

function formatGoogleCalendarDate(date: Date) {
  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}00Z`;
}

export function buildGoogleCalendarUrl(input: PublishScheduleInput): string {
  const start = resolvePublishDate(input.dayId, input.dateLabel, {
    fridayOccurrence: input.fridayOccurrence,
    sequenceIndex: input.sequenceIndex,
  });
  const end = new Date(start.getTime() + 30 * 60 * 1000);
  const caption = buildShareCaption(input);
  const shareUrl = resolveEventShareUrl(input);
  const details = buildCalendarDescription(input, caption);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `poust paylaşım saati — ${input.dayName}`,
    dates: `${formatGoogleCalendarDate(start)}/${formatGoogleCalendarDate(end)}`,
    details,
    location: shareUrl,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function downloadIcsFile(input: PublishScheduleInput) {
  const { filename, content } = buildIcsEvent(input);
  triggerIcsDownload(filename, content);
}

export function downloadBulkIcsCalendar(inputs: PublishScheduleInput[], brandName: string) {
  const { filename, content } = buildBulkIcsCalendar(inputs, brandName);
  triggerIcsDownload(filename, content);
}

function triggerIcsDownload(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
