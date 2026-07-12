import type { SessionUser } from "@/lib/supabase/auth";

export function parseProfileNames(fullName: string | null | undefined, user: SessionUser) {
  if (fullName?.trim()) {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    return {
      firstName: parts[0] ?? user.firstName,
      lastName: parts.slice(1).join(" "),
    };
  }

  return {
    firstName: user.firstName,
    lastName: user.lastName,
  };
}

export function resolveBrandColors(
  brandColors: string[] | undefined,
  primaryColor: string,
): string[] {
  const palette = [...new Set((brandColors ?? []).filter(Boolean))];
  if (palette.length > 0) return palette;
  return [primaryColor];
}
