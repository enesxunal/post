/** Anasayfa vitrin — gradient placeholder veya public/marketing/ altındaki gerçek görsel */
export const heroShowcase = [
  {
    id: "29-ekim",
    day: "29 Ekim",
    subtitle: "Cumhuriyet Bayramımız kutlu olsun",
    accent: "#DC2626",
    gradient: "from-rose-600 via-red-700 to-rose-950",
    pattern: "stars" as const,
    imageSrc: "/marketing/showcase-29-ekim.jpg",
    sector: "poust marka postu",
  },
  {
    id: "ramazan-bayrami",
    day: "Ramazan Bayramı",
    subtitle: "Bayramınız mübarek olsun",
    accent: "#38C661",
    gradient: "from-emerald-500 via-green-600 to-emerald-900",
    pattern: "crescent" as const,
    imageSrc: "/marketing/showcase-ramazan-bayrami.jpg",
    sector: "poust marka postu",
  },
  {
    id: "anneler-gunu",
    day: "Anneler Günü",
    subtitle: "Sevgiyle kutlarız",
    accent: "#DB2777",
    gradient: "from-pink-400 via-rose-500 to-fuchsia-800",
    pattern: "hearts" as const,
    imageSrc: "/marketing/showcase-anneler-gunu.jpg",
    sector: "poust marka postu",
  },
  {
    id: "hayirli-cumalar",
    day: "Hayırlı Cumalar",
    subtitle: "Huzurlu ve saygılı ton",
    accent: "#0F766E",
    gradient: "from-teal-500 via-emerald-600 to-teal-950",
    pattern: "lines" as const,
    imageSrc: "/marketing/showcase-hayirli-cumalar.jpg",
    sector: "poust marka postu",
  },
  {
    id: "kandil",
    day: "Kandil",
    subtitle: "Kandiliniz mübarek olsun",
    accent: "#7C3AED",
    gradient: "from-violet-500 via-purple-600 to-indigo-950",
    pattern: "glow" as const,
    imageSrc: "/marketing/showcase-kandil.jpg",
    sector: "poust marka postu",
  },
] as const;

export type ShowcasePost = (typeof heroShowcase)[number];

export const sectorShowcase = [
  { key: "beauty", label: "Güzellik salonu", icon: "sparkles", tone: "from-rose-100 to-pink-50" },
  { key: "cafe", label: "Kafe / restoran", icon: "coffee", tone: "from-amber-100 to-orange-50" },
  { key: "dental", label: "Diş kliniği", icon: "smile", tone: "from-sky-100 to-cyan-50" },
  { key: "real-estate", label: "Emlak ofisi", icon: "building", tone: "from-slate-100 to-zinc-50" },
  { key: "education", label: "Eğitim kurumu", icon: "graduation", tone: "from-blue-100 to-indigo-50" },
  { key: "boutique", label: "Butik / mağaza", icon: "shopping", tone: "from-fuchsia-100 to-purple-50" },
  { key: "auto-service", label: "Oto servis", icon: "car", tone: "from-stone-100 to-neutral-50" },
  { key: "fitness", label: "Spor salonu", icon: "dumbbell", tone: "from-lime-100 to-emerald-50" },
] as const;

export const howItWorksSteps = [
  {
    step: 1,
    title: "Markanı tanımla",
    description: "Logo, renk ve sektör bilgilerini gir.",
    icon: "palette",
    tone: "from-emerald-500 to-teal-600",
  },
  {
    step: 2,
    title: "Günleri seç",
    description: "30 özel günü tek tek veya otomatik tamamla.",
    icon: "calendar",
    tone: "from-emerald-600 to-green-700",
  },
  {
    step: 3,
    title: "İndir ve paylaş",
    description: "Panelden görselleri ve captionları yönet.",
    icon: "download",
    tone: "from-green-600 to-emerald-800",
  },
] as const;
