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
  StyleOption,
} from "@/types/domain";
import { getSectorOptionsFromSeed, getSectorRulesFromSeed } from "@/lib/sectors/seed-data";
import { getStyleOptionsFromSeed } from "@/lib/styles/seed-data";
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
    description: "Feed postu onayladıktan sonra aynı tasarımdan 1080×1920 story üretilir.",
    price: STORY_ADDON_PRICE,
  },
  {
    key: "calendar",
    label: "Paylaşım takvimi",
    description:
      "Onaylı postlar için takvim hatırlatıcısı (.ics), Google Takvim ve Instagram/Meta paylaşım paketi.",
    price: CALENDAR_ADDON_PRICE,
  },
];

export const sectors = getSectorOptionsFromSeed();

export const sectorModifiers: SectorModifier[] = getSectorRulesFromSeed().map((rule) => ({
  key: rule.key,
  name: rule.name,
  description: rule.description,
  visualCues: rule.visualCues,
  toneHints: rule.toneHints,
  avoidRules: rule.avoidRules.join(", "),
  promptModifier: rule.promptModifier,
}));

export const styles: StyleOption[] = getStyleOptionsFromSeed();

export const metrics = {
  basePrice: BASE_PACKAGE_PRICE,
  includedPosts: 30,
  revisionCredits: INCLUDED_REVISION_CREDITS,
};

export const userProfileMock = {
  firstName: "Ayşe",
  lastName: "Yılmaz",
  email: "ayse@liva-guzellik.com",
  businessName: "Liva Güzellik",
  sector: "Güzellik salonu",
  visualStyle: "Premium",
  primaryColor: "#16A34A",
  logoInitial: "L",
  packageName: "Ana Paket",
  postsTotal: 30,
  postsReady: 12,
  postsGenerating: 3,
  addons: ["Caption paketi"],
  memberSince: "Mart 2026",
};

export const dashboardMock = {
  project: {
    id: "project-demo",
    brandName: "Liva Güzellik",
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
      imageIndex: 0,
      caption: "Cumhuriyet Bayramımız kutlu olsun. Liva Güzellik ailesi olarak nice mutlu yıllara.",
      hasCaption: true,
      hasStory: true,
    },
    {
      id: "job-2",
      dayName: "Ramazan Bayramı",
      dateLabel: "Değişken tarih",
      status: "ready",
      imageIndex: 1,
      caption: "Bayramınız mübarek olsun.",
      hasCaption: true,
      hasStory: true,
    },
    {
      id: "job-3",
      dayName: "Anneler Günü",
      dateLabel: "Mayıs",
      status: "ready",
      imageIndex: 2,
      caption: "Tüm annelerin günü kutlu olsun.",
      hasCaption: true,
      hasStory: false,
    },
    {
      id: "job-4",
      dayName: "Hayırlı Cumalar",
      dateLabel: "Haftalık seri",
      status: "generating",
      imageIndex: 3,
      caption: null,
      hasCaption: true,
      hasStory: false,
    },
    {
      id: "job-5",
      dayName: "Regaib Kandili",
      dateLabel: "Değişken tarih",
      status: "generating",
      imageIndex: 4,
      caption: null,
      hasCaption: true,
      hasStory: false,
    },
    {
      id: "job-6",
      dayName: "Yılbaşı",
      dateLabel: "1 Ocak",
      status: "queued",
      imageIndex: 5,
      caption: null,
      hasCaption: true,
      hasStory: false,
    },
    {
      id: "job-7",
      dayName: "Dünya Kahve Günü",
      dateLabel: "1 Ekim",
      status: "queued",
      imageIndex: 6,
      caption: null,
      hasCaption: false,
      hasStory: false,
    },
    {
      id: "job-8",
      dayName: "8 Mart Dünya Kadınlar Günü",
      dateLabel: "8 Mart",
      status: "ready",
      imageIndex: 7,
      caption: "Kadınların gücünü kutluyoruz.",
      hasCaption: true,
      hasStory: true,
    },
    {
      id: "job-9",
      dayName: "Black Friday",
      dateLabel: "Kasım",
      status: "failed",
      imageIndex: 8,
      caption: null,
      hasCaption: false,
      hasStory: false,
    },
  ],
};
