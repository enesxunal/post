import {
  BASE_PACKAGE_PRICE,
  CALENDAR_ADDON_PRICE,
  CAPTION_ADDON_PRICE,
  INCLUDED_REVISION_CREDITS,
  STORY_ADDON_PRICE,
} from "@/lib/config";
import type {
  AddonOption,
  SectorModifier,
  StyleModifier,
} from "@/types/domain";
import { specialDaysCatalog } from "@/lib/special-days-data";

export { specialDaysCatalog as specialDays };

export const addonOptions: AddonOption[] = [
  {
    key: "caption",
    label: "Caption paketi",
    description: "Her post için açıklama metni, ton seçimi ve 3 hashtag önerisi.",
    price: CAPTION_ADDON_PRICE,
  },
  {
    key: "story",
    label: "Story paketi",
    description: "Aynı özel günler için 9:16 story versiyonları.",
    price: STORY_ADDON_PRICE,
  },
  {
    key: "calendar",
    label: "Paylaşım takvimi",
    description: "Panel içi takvim görünümü ve ICS export.",
    price: CALENDAR_ADDON_PRICE,
  },
];

export const sectors = [
  { key: "beauty", label: "Güzellik salonu" },
  { key: "cafe", label: "Kafe / restoran" },
  { key: "dental", label: "Diş kliniği" },
  { key: "real-estate", label: "Emlak ofisi" },
  { key: "education", label: "Eğitim kurumu / kurs" },
  { key: "boutique", label: "Butik / mağaza" },
  { key: "auto-service", label: "Oto servis" },
  { key: "fitness", label: "Spor salonu" },
  { key: "nutrition", label: "Diyetisyen / fizyoterapi" },
  { key: "agency", label: "Reklam ajansı / hizmet firması" },
  { key: "other", label: "Diğer" },
] as const;

export const styles: StyleModifier[] = [
  {
    key: "modern",
    name: "Modern",
    description: "Temiz, çağdaş, sosyal medya dostu.",
    promptModifier: "clean, contemporary, social-first layout",
  },
  {
    key: "minimal",
    name: "Minimal",
    description: "Az metin, bol boşluk, sade tasarım.",
    promptModifier: "minimal, spacious, refined typography",
  },
  {
    key: "corporate",
    name: "Kurumsal",
    description: "Güven veren, ciddi ve profesyonel.",
    promptModifier: "trustworthy, formal, polished corporate feel",
  },
  {
    key: "friendly",
    name: "Samimi",
    description: "Sıcak, küçük işletme dostu.",
    promptModifier: "warm, approachable, neighborhood business tone",
  },
  {
    key: "premium",
    name: "Premium",
    description: "Şık, kaliteli, ajans havasında.",
    promptModifier: "luxury-inspired, elegant, agency-quality design",
  },
  {
    key: "colorful",
    name: "Renkli / enerjik",
    description: "Daha canlı, dikkat çekici.",
    promptModifier: "energetic, vibrant, high-contrast social design",
  },
];

export const sectorModifiers: SectorModifier[] = [
  {
    key: "beauty",
    name: "Güzellik salonu",
    description: "Premium bakım ve estetik odaklı işletmeler.",
    visualCues: "soft lighting, skincare textures, feminine balance",
    toneHints: "zarif, bakımlı, güven veren",
    avoidRules: "aşırı karmaşa, düşük kalite makyaj görünümleri",
    promptModifier: "elegant, feminine, polished, clean beauty aesthetic",
  },
  {
    key: "cafe",
    name: "Kafe / restoran",
    description: "Sıcak, iştah açıcı, samimi mekanlar.",
    visualCues: "coffee steam, cozy seating, appetizing serving",
    toneHints: "sıcak, davetkar, iştah açıcı",
    avoidRules: "kirli masa, karanlık sahne, yapay yiyecekler",
    promptModifier: "warm, inviting, appetizing, cozy",
  },
  {
    key: "dental",
    name: "Diş kliniği",
    description: "Hijyen ve güven odaklı sağlık işletmeleri.",
    visualCues: "white surfaces, subtle clinical accents, clean smiles",
    toneHints: "temiz, profesyonel, güvenilir",
    avoidRules: "rahatsız edici medikal detay, aşırı mavi ton",
    promptModifier: "clean, trustworthy, hygienic, professional",
  },
  {
    key: "real-estate",
    name: "Emlak ofisi",
    description: "Şehirli, güven veren gayrimenkul hizmetleri.",
    visualCues: "modern architecture, city outlines, premium living",
    toneHints: "kendinden emin, modern, kurumsal",
    avoidRules: "stok fotoğraf hissi, aşırı lüks abartısı",
    promptModifier: "corporate, confident, modern, city lifestyle feel",
  },
];

export const metrics = {
  basePrice: BASE_PACKAGE_PRICE,
  includedPosts: 30,
  revisionCredits: INCLUDED_REVISION_CREDITS,
};

export const dashboardMock = {
  project: {
    id: "project-demo",
    brandName: "Marka Postları",
    primaryColor: "#16A34A",
    visualStyle: "premium" as const,
    remainingCredits: 7,
    bonusCreditsGranted: false,
  },
  jobs: [
    {
      id: "job-1",
      dayName: "29 Ekim Cumhuriyet Bayramı",
      dateLabel: "29 Ekim",
      status: "ready",
      thumbnailLabel: "29 Ekim",
      hasCaption: true,
      hasStory: true,
    },
    {
      id: "job-2",
      dayName: "Ramazan Bayramı",
      dateLabel: "Değişken tarih",
      status: "generating",
      thumbnailLabel: "Bayram",
      hasCaption: true,
      hasStory: false,
    },
    {
      id: "job-3",
      dayName: "Hayırlı Cumalar",
      dateLabel: "Haftalık seri",
      status: "queued",
      thumbnailLabel: "Cuma",
      hasCaption: false,
      hasStory: false,
    },
  ],
};
