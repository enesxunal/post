import type { SectorKey } from "@/types/domain";

export type SectorNativeProfile = {
  /** Prompt'ta sahne kimliği cümlesi */
  nativeScene: string;
  /** SectorLayer element havuzu — anti-repeat ile döner */
  elements: string[];
  /** Sektöre özel kaçınılacaklar (client post) */
  avoid: string[];
  /** Özel gün + sektör birleşim ipucu */
  blendHint: string;
};

/**
 * Tüm müşteri (client_post) üretimleri için sektör-native sahne profilleri.
 * Poust showcase / vitrin görselleri bu dosyayı kullanmaz.
 */
export const SECTOR_NATIVE_PROFILES: Record<SectorKey, SectorNativeProfile> = {
  beauty: {
    nativeScene: "premium beauty salon atmosphere with soft lighting and elegant feminine composition",
    elements: [
      "soft beauty textures",
      "skincare product reflection",
      "salon mirror light",
      "silk or floral accent",
      "elegant feminine surface",
      "premium skincare bottles",
    ],
    avoid: ["cheap salon flyer", "distorted faces", "low-quality makeup", "abusive beauty filters"],
    blendHint: "Occasion mood leads; weave beauty salon elegance as natural scene texture, not decoration.",
  },
  cafe: {
    nativeScene: "warm inviting cafe or restaurant hospitality scene with cozy table light",
    elements: [
      "warm table atmosphere",
      "coffee cup with steam",
      "dessert plate detail",
      "cozy hospitality lighting",
      "fresh bakery warmth",
      "natural food texture",
    ],
    avoid: ["dirty table", "artificial food", "dark stock restaurant", "aggressive discount flyer"],
    blendHint: "Occasion leads; cafe warmth appears as lived-in hospitality, not a stock food photo.",
  },
  dental: {
    nativeScene: "bright hygienic dental clinic with calm trustworthy medical minimalism",
    elements: [
      "bright hygienic clinic light",
      "soft white medical surfaces",
      "minimal dental icon hint",
      "calm confidence atmosphere",
      "gentle light reflections",
      "clean clinical trust",
    ],
    avoid: ["disturbing teeth closeups", "blood", "scary equipment", "medical claims"],
    blendHint: "Occasion leads; clinic feels clean and reassuring, never clinical horror.",
  },
  "real-estate": {
    nativeScene: "modern home and city lifestyle with architectural confidence",
    elements: [
      "modern home silhouette",
      "architectural lines",
      "warm window light",
      "city skyline hint",
      "key or home detail",
      "premium real estate atmosphere",
    ],
    avoid: ["cheap listing poster", "fake luxury mansion", "stock realtor cliché"],
    blendHint: "Occasion leads; real estate trust via architecture and lifestyle, not billboard.",
  },
  agency: {
    nativeScene: "premium digital agency creative atmosphere with strategic modern depth",
    elements: [
      "abstract creative grid",
      "subtle glass depth layers",
      "strategic brand panels",
      "refined digital texture",
      "premium editorial tech mood",
      "soft gradient depth",
    ],
    avoid: [
      "generic SaaS dashboard",
      "clip art",
      "neon cyber UI",
      "random code screen",
      "amatör startup template",
    ],
    blendHint: "Occasion leads; digital agency layer is abstract and premium, never a product screenshot.",
  },
  education: {
    nativeScene: "inspiring clean learning atmosphere with academic warmth",
    elements: [
      "soft classroom light",
      "books or notebook texture",
      "academic calm pattern",
      "inspiring learning mood",
      "friendly education symbol",
      "bright trustworthy study scene",
    ],
    avoid: ["childish clip art", "chaotic infographic", "stock student crowd"],
    blendHint: "Occasion leads; education feels hopeful and professional, not childish poster.",
  },
  boutique: {
    nativeScene: "stylish boutique retail scene with product-forward elegance",
    elements: [
      "fabric texture",
      "boutique display hint",
      "gift packaging",
      "shopping bag silhouette",
      "hanger or product vignette",
      "chic seasonal retail mood",
    ],
    avoid: ["cheap discount flyer", "messy storefront", "marketplace banner clutter"],
    blendHint: "Occasion leads; boutique retail feels curated and premium.",
  },
  fitness: {
    nativeScene: "energetic but clean fitness studio with motivating athletic atmosphere",
    elements: [
      "clean gym object",
      "studio lighting",
      "motion energy hint",
      "athletic texture",
      "premium fitness mood",
      "positive workout atmosphere",
    ],
    avoid: ["aggressive body imagery", "dark steroid gym", "before/after bodies"],
    blendHint: "Occasion leads; fitness energy is positive and professional.",
  },
  nutrition: {
    nativeScene: "fresh wellness lifestyle with natural balanced health atmosphere",
    elements: [
      "fresh produce texture",
      "clean plate composition",
      "natural food detail",
      "leaf or water accent",
      "balanced wellness light",
      "trustworthy health mood",
    ],
    avoid: ["medical claims", "body-shaming", "before/after body images", "pill bottles"],
    blendHint: "Occasion leads; wellness feels fresh and balanced, not medical poster.",
  },
  "auto-service": {
    nativeScene: "trustworthy automotive service scene with polished mechanical detail",
    elements: [
      "clean vehicle detail",
      "headlight reflection",
      "metallic surface texture",
      "polished garage light",
      "wheel or tool silhouette",
      "reliable service atmosphere",
    ],
    avoid: ["dirty garage", "oily mess", "broken car", "cheap mechanic flyer"],
    blendHint: "Occasion leads; auto service feels clean and trustworthy.",
  },
  veterinary: {
    nativeScene: "warm friendly pet care clinic with gentle trustworthy atmosphere",
    elements: [
      "soft pet care warmth",
      "paw pattern accent",
      "friendly clinic light",
      "gentle animal silhouette",
      "caring veterinary mood",
      "clean pet clinic calm",
    ],
    avoid: ["injured animals", "scary medical scene", "distressing pet imagery"],
    blendHint: "Occasion leads; veterinary feels caring and gentle.",
  },
  law: {
    nativeScene: "serious premium corporate legal atmosphere with institutional trust",
    elements: [
      "refined corporate texture",
      "subtle law book hint",
      "institutional calm",
      "structured premium layout",
      "trustworthy legal mood",
      "dark corporate elegance",
    ],
    avoid: ["dramatic courtroom cliché", "cheap gavel poster", "stock lawyer drama"],
    blendHint: "Occasion leads; law office feels premium and restrained.",
  },
  accounting: {
    nativeScene: "organized business desk with precise trustworthy finance calm",
    elements: [
      "clean desk atmosphere",
      "subtle chart texture",
      "document grid hint",
      "precise corporate order",
      "trustworthy finance mood",
      "structured business calm",
    ],
    avoid: ["cluttered tax tables", "scary paperwork", "too much money imagery"],
    blendHint: "Occasion leads; accounting feels orderly and reassuring.",
  },
  hotel: {
    nativeScene: "hospitality lifestyle scene with welcoming travel warmth",
    elements: [
      "hospitality lounge light",
      "room detail hint",
      "travel welcome mood",
      "breakfast or nature cue",
      "premium hotel atmosphere",
      "welcoming lobby warmth",
    ],
    avoid: ["generic stock tourism poster", "fake luxury resort", "clip art palm trees"],
    blendHint: "Occasion leads; hotel feels inviting and premium.",
  },
  photography: {
    nativeScene: "editorial photography studio with lens light and creative bokeh",
    elements: [
      "studio softbox glow",
      "lens or frame detail",
      "editorial bokeh",
      "creative depth mood",
      "professional camera atmosphere",
      "gallery-quality composition",
    ],
    avoid: ["amateur camera clip art", "cheap photo booth flyer"],
    blendHint: "Occasion leads; photography studio feels editorial and refined.",
  },
  construction: {
    nativeScene: "modern architecture and material detail with solid professional structure",
    elements: [
      "architectural lines",
      "blueprint texture hint",
      "modern facade detail",
      "material surface",
      "solid structure mood",
      "professional build atmosphere",
    ],
    avoid: ["dirty construction site", "cheap contractor poster", "unsafe site imagery"],
    blendHint: "Occasion leads; construction feels modern and solid.",
  },
  cleaning: {
    nativeScene: "bright sparkling clean surfaces with fresh hygienic service mood",
    elements: [
      "sparkling clean surface",
      "fresh room light",
      "clean towel or window",
      "bright hygienic mood",
      "fresh service atmosphere",
      "soft cleanliness glow",
    ],
    avoid: ["disgusting dirt closeups", "chemical-heavy look", "gross before/after"],
    blendHint: "Occasion leads; cleaning feels fresh and bright.",
  },
  "flower-gift": {
    nativeScene: "premium floral and gift scene with ribbon and bouquet elegance",
    elements: [
      "bouquet detail",
      "gift ribbon texture",
      "floral premium accent",
      "gift box hint",
      "soft romantic surface",
      "boutique gift mood",
    ],
    avoid: ["plastic flowers", "cheap gift poster", "tacky valentine clip art"],
    blendHint: "Occasion leads; floral gift feels premium and emotional.",
  },
  barber: {
    nativeScene: "classic barbershop atmosphere with grooming tools and mirror glow",
    elements: [
      "barbershop mirror glow",
      "grooming tool detail",
      "hair texture accent",
      "classic masculine warmth",
      "clean salon chair mood",
      "premium barber atmosphere",
    ],
    avoid: ["low-quality hair", "dirty barber shop", "cheap barbershop flyer"],
    blendHint: "Occasion leads; barber feels classic and clean.",
  },
  jewelry: {
    nativeScene: "luxury jewelry showcase with silk fabric and subtle sparkle",
    elements: [
      "jewelry closeup hint",
      "silk fabric texture",
      "subtle metallic sparkle",
      "premium display mood",
      "velvet surface",
      "refined boutique elegance",
    ],
    avoid: ["fake luxury", "overdone gold", "tacky sparkle explosion"],
    blendHint: "Occasion leads; jewelry feels refined and premium.",
  },
  ecommerce: {
    nativeScene: "clean product showcase with modern ecommerce retail energy",
    elements: [
      "product vignette",
      "clean packaging",
      "shopping cue hint",
      "retail card mood",
      "unboxing atmosphere",
      "modern online store feel",
    ],
    avoid: ["marketplace banner", "huge discount clutter", "amazon-style overload"],
    blendHint: "Occasion leads; ecommerce feels polished product-forward.",
  },
  other: {
    nativeScene: "friendly local business atmosphere with modern trustworthy service mood",
    elements: [
      "local business warmth",
      "friendly service detail",
      "modern trustworthy layout",
      "neighborhood brand mood",
      "clean professional surface",
      "approachable business scene",
    ],
    avoid: ["generic clip art", "amateur flyer", "stock family photo"],
    blendHint: "Occasion leads; local business feels personal and professional.",
  },
};

/** Tüm müşteri postlarında yasak — Poust vitrin UI dahil */
export const CLIENT_POST_GLOBAL_AVOID = [
  "generic greeting card",
  "plain title plus decoration",
  "occasion wallpaper with headline sticker",
  "stock template",
  "canva template",
  "corner logo pasted on flat background",
  "poust app UI",
  "saas product dashboard",
  "content calendar UI",
  "analytics chart UI chrome",
  "social media app interface",
  "clip art",
  "stock photo family",
];

export function getSectorNativeProfile(sector: SectorKey): SectorNativeProfile {
  return SECTOR_NATIVE_PROFILES[sector] ?? SECTOR_NATIVE_PROFILES.other;
}

export function mergeSectorElementPool(
  sector: SectorKey,
  seedElements?: string[],
): string[] {
  const profile = getSectorNativeProfile(sector);
  const merged = [...profile.elements];
  if (seedElements?.length) {
    for (const el of seedElements) {
      if (!merged.some((item) => item.toLowerCase() === el.toLowerCase())) {
        merged.push(el);
      }
    }
  }
  // Ajans dışı sektörlerde SaaS/UI elementlerini filtrele
  if (sector !== "agency") {
    return merged.filter(
      (el) =>
        !/ui card|dashboard|calendar|analytics|saas|app screen|code screen/i.test(el),
    );
  }
  return merged.filter(
    (el) => !/marketing dashboard|code snippet|content planning/i.test(el),
  );
}

export function mergeSectorAvoidList(sector: SectorKey, seedAvoid?: string[]): string[] {
  const profile = getSectorNativeProfile(sector);
  const merged = [...CLIENT_POST_GLOBAL_AVOID, ...profile.avoid];
  if (seedAvoid?.length) {
    for (const rule of seedAvoid) {
      if (!merged.some((item) => item.toLowerCase() === rule.toLowerCase())) {
        merged.push(rule);
      }
    }
  }
  return [...new Set(merged.map((item) => item.toLowerCase()))];
}
