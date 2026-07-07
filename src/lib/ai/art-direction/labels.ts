import type {
  ArtDirection,
  ColorBalance,
  DensityLevel,
  LayoutVariant,
  TextPosition,
  TypographyMood,
  VisualFocus,
} from "@/lib/ai/art-direction/types";

const LAYOUT_LABELS: Record<LayoutVariant, string> = {
  "centered-hero-typography": "Ortada büyük başlık",
  "image-led-cinematic": "Görsel odaklı sinematik",
  "split-layout": "İkiye bölünmüş düzen",
  "editorial-poster": "Dergi posteri",
  "minimal-emblem": "Minimal amblem",
  "diagonal-dynamic": "Çapraz dinamik",
  "full-bleed-overlay": "Tam ekran arka plan + yazı",
  "object-focused-still-life": "Nesne odaklı still life",
  "pattern-based": "Desen tabanlı",
  "layered-card": "Katmanlı kart",
};

const TEXT_POSITION_LABELS: Record<TextPosition, string> = {
  center: "Ortada",
  top: "Üstte",
  bottom: "Altta",
  left: "Solda",
  right: "Sağda",
  integrated: "Görselle bütünleşik",
};

const VISUAL_FOCUS_LABELS: Record<VisualFocus, string> = {
  "symbolic-background": "Sembolik arka plan",
  "hero-object": "Ana nesne",
  "typography-first": "Önce tipografi",
  "atmospheric-scene": "Atmosferik sahne",
  "brand-accent": "Marka vurgusu",
  "pattern-texture": "Desen ve doku",
};

const TYPOGRAPHY_LABELS: Record<TypographyMood, string> = {
  "bold-impact": "Kalın ve vurucu",
  "refined-elegant": "Zarif ve ince",
  "corporate-clean": "Kurumsal sade",
  "warm-friendly": "Sıcak ve samimi",
  "premium-editorial": "Premium dergi stili",
};

const DENSITY_LABELS: Record<DensityLevel, string> = {
  low: "Az detay",
  medium: "Orta detay",
  high: "Yoğun detay",
};

const COLOR_BALANCE_LABELS: Record<ColorBalance, string> = {
  "occasion-dominant": "Özel gün renkleri önde",
  "brand-accent": "Marka rengi aksan",
  "brand-dominant": "Marka rengi önde",
  balanced: "Dengeli",
};

export function formatArtDirectionForDisplay(direction: ArtDirection) {
  return [
    { key: "layout", label: "Düzen", value: LAYOUT_LABELS[direction.layout] ?? direction.layout },
    {
      key: "textPosition",
      label: "Metin yeri",
      value: TEXT_POSITION_LABELS[direction.textPosition] ?? direction.textPosition,
    },
    {
      key: "visualFocus",
      label: "Görsel odağı",
      value: VISUAL_FOCUS_LABELS[direction.visualFocus] ?? direction.visualFocus,
    },
    {
      key: "typographyMood",
      label: "Yazı stili",
      value: TYPOGRAPHY_LABELS[direction.typographyMood] ?? direction.typographyMood,
    },
    {
      key: "density",
      label: "Yoğunluk",
      value: DENSITY_LABELS[direction.density] ?? direction.density,
    },
    {
      key: "motifStrategy",
      label: "Motif",
      value: direction.motifStrategy,
    },
    {
      key: "colorBalance",
      label: "Renk dengesi",
      value: COLOR_BALANCE_LABELS[direction.colorBalance] ?? direction.colorBalance,
    },
    ...(direction.antiRepeatNote
      ? [{ key: "antiRepeatNote", label: "Çeşitlilik notu", value: direction.antiRepeatNote }]
      : []),
  ];
}
