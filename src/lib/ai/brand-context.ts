import type { BrandContext } from "@/types/domain";

export function buildBrandContext(input: BrandContext) {
  return {
    ...input,
    normalizedBrandName: input.brandName.trim(),
    normalizedDescription: input.brandDescription?.trim() ?? "",
  };
}
