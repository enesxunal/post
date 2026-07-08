export type {
  ArtDirection,
  BrandCreativeProfile,
  BrandIntegration,
  CollectionDayInput,
  CollectionPlan,
  GeneratedDesignMetadata,
  ColorBalance,
  DensityLevel,
  LayoutVariant,
  LogoPlacement,
  LogoTreatment,
  SectorIntegrationStyle,
  SectorLayer,
  SectorLayerIntensity,
  TextPosition,
  TypographyMood,
  VisualFocus,
} from "@/lib/ai/art-direction/types";

export { LAYOUT_VARIANTS } from "@/lib/ai/art-direction/types";
export {
  buildCollectionPlan,
  assignArtDirectionForDay,
  buildBrandProfile,
  artDirectionToMetadata,
} from "@/lib/ai/art-direction/collection-planner";
export { regenerateArtDirection } from "@/lib/ai/art-direction/regenerate-direction";
export { artDirectionToPromptSentence } from "@/lib/ai/art-direction/prompt-sentence";
export { scoreLayoutDiversity } from "@/lib/ai/art-direction/anti-repeat";
export { normalizeArtDirection } from "@/lib/ai/art-direction/normalize";
export {
  DEFAULT_SECTOR_ELEMENTS,
  sectorLayerToPromptPhrase,
  buildSectorLayer,
} from "@/lib/ai/art-direction/sector-layer";
export {
  brandIntegrationToPromptPhrase,
  defaultBrandIntegrationForCategory,
  buildBrandIntegration,
} from "@/lib/ai/art-direction/brand-integration";
export { formatArtDirectionForDisplay } from "@/lib/ai/art-direction/labels";
