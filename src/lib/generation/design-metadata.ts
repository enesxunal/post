import type { ArtDirection } from "@/lib/ai/art-direction";
import { artDirectionToMetadata } from "@/lib/ai/art-direction";

export type JobImageVersion = {
  id: string;
  imageUrl: string;
  thumbnailUrl?: string;
  createdAt: string;
  revisionNote?: string;
};

export type JobDesignMetadata = {
  revisionNote?: string;
  generationNote?: string;
  visualNote?: string;
  isRevision?: boolean;
  previousVersions?: JobImageVersion[];
  layout?: string;
  textPosition?: string;
  visualFocus?: string;
  typographyMood?: string;
  density?: string;
  motifStrategy?: string;
  colorBalance?: string;
  sectorLayer?: ArtDirection["sectorLayer"];
  brandIntegration?: ArtDirection["brandIntegration"];
  supersededArtDirection?: ArtDirection;
};

export const DEFAULT_REVISION_DIRECTIVE =
  "Müşteri önceki görseli beğenmedi. Aynı özel gün ve marka için belirgin şekilde farklı kompozisyon, renk dengesi, sektör detayları ve görsel odak noktasıyla yeni bir kreatif yön üret — öncekiyle karıştırılmamalı.";

function asRecord(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  return raw as Record<string, unknown>;
}

export function parseJobDesignMetadata(raw: unknown): JobDesignMetadata {
  const record = asRecord(raw);
  if (!record) return {};

  const previousVersions = Array.isArray(record.previousVersions)
    ? record.previousVersions
        .map((item) => {
          const row = asRecord(item);
          if (!row || typeof row.imageUrl !== "string" || !row.imageUrl.trim()) return null;
          return {
            id: typeof row.id === "string" ? row.id : `ver-${Date.now()}`,
            imageUrl: row.imageUrl,
            thumbnailUrl:
              typeof row.thumbnailUrl === "string" ? row.thumbnailUrl : undefined,
            createdAt:
              typeof row.createdAt === "string"
                ? row.createdAt
                : new Date().toISOString(),
            revisionNote:
              typeof row.revisionNote === "string" ? row.revisionNote : undefined,
          } satisfies JobImageVersion;
        })
        .filter(Boolean) as JobImageVersion[]
    : [];

  return {
    ...record,
    previousVersions,
  } as JobDesignMetadata;
}

export function parseUserGenerationNote(raw: unknown): string | undefined {
  const meta = parseJobDesignMetadata(raw);
  for (const value of [meta.generationNote, meta.visualNote, meta.revisionNote]) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
}

export function mergeJobDesignMetadata(
  existingRaw: unknown,
  patch: JobDesignMetadata,
): JobDesignMetadata {
  const existing = parseJobDesignMetadata(existingRaw);
  return {
    ...existing,
    ...patch,
    previousVersions: patch.previousVersions ?? existing.previousVersions,
  };
}

export function buildReadyDesignMetadata(
  existingRaw: unknown,
  artDirection: ArtDirection,
): JobDesignMetadata {
  const existing = parseJobDesignMetadata(existingRaw);
  return mergeJobDesignMetadata(existing, {
    ...artDirectionToMetadata(artDirection),
    revisionNote: undefined,
    generationNote: undefined,
    visualNote: undefined,
    isRevision: false,
    supersededArtDirection: undefined,
    previousVersions: existing.previousVersions,
  });
}

export function archiveJobImageVersion(input: {
  existingRaw: unknown;
  imageUrl: string;
  thumbnailUrl?: string | null;
  revisionNote?: string;
}): JobDesignMetadata {
  const existing = parseJobDesignMetadata(input.existingRaw);
  const versions = existing.previousVersions ?? [];

  if (
    versions.some((item) => item.imageUrl === input.imageUrl) ||
    !input.imageUrl.trim()
  ) {
    return existing;
  }

  const entry: JobImageVersion = {
    id: `ver-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    imageUrl: input.imageUrl,
    thumbnailUrl: input.thumbnailUrl ?? input.imageUrl,
    createdAt: new Date().toISOString(),
    revisionNote: input.revisionNote,
  };

  return {
    ...existing,
    previousVersions: [entry, ...versions].slice(0, 6),
  };
}

export function getLatestArchivedImageUrl(raw: unknown): string | null {
  const meta = parseJobDesignMetadata(raw);
  return meta.previousVersions?.[0]?.imageUrl ?? null;
}
