import { specialDaysCatalog } from "@/lib/special-days-data";
import {
  enrichSpecialDayCopy,
  rowToSpecialDay,
  specialDayToRow,
  type SpecialDayRow,
} from "@/lib/special-days/db-mapper";
import { buildSpecialDaysFromPromptSeed } from "@/lib/special-days/prompt-seed-merge";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SpecialDay } from "@/types/domain";

async function getClient() {
  return createSupabaseAdminClient() ?? (await createSupabaseServerClient());
}

function catalogDays(): SpecialDay[] {
  return buildSpecialDaysFromPromptSeed();
}

export async function listSpecialDays(): Promise<SpecialDay[]> {
  const supabase = await getClient();
  const { data, error } = await supabase
    .from("special_days")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error || !data?.length) {
    return catalogDays();
  }

  return (data as SpecialDayRow[]).map((row) => enrichSpecialDayCopy(rowToSpecialDay(row)));
}

export async function getSpecialDayFromStore(dayId: string): Promise<SpecialDay | undefined> {
  const fromCatalog = specialDaysCatalog.find((day) => day.id === dayId || day.slug === dayId);

  const supabase = await getClient();
  const slugCandidates = [dayId, fromCatalog?.id, fromCatalog?.slug].filter(Boolean) as string[];

  for (const slug of slugCandidates) {
    const { data } = await supabase
      .from("special_days")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (data) {
      return enrichSpecialDayCopy(rowToSpecialDay(data as SpecialDayRow));
    }
  }

  return fromCatalog ? enrichSpecialDayCopy(fromCatalog) : undefined;
}

export async function updateSpecialDay(
  slug: string,
  payload: Partial<SpecialDay>,
): Promise<SpecialDay> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    throw new Error("Güncelleme için SUPABASE_SECRET_KEY gerekli");
  }

  const existing =
    (await getSpecialDayFromStore(slug)) ??
    specialDaysCatalog.find((day) => day.id === slug || day.slug === slug);

  if (!existing) {
    throw new Error("Özel gün bulunamadı");
  }

  const merged: SpecialDay = enrichSpecialDayCopy({
    ...existing,
    ...payload,
    id: existing.id,
    slug: existing.slug || slug,
  });

  const row = specialDayToRow(merged);

  const { data, error } = await supabase
    .from("special_days")
    .upsert(row, { onConflict: "slug" })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Kayıt güncellenemedi");
  }

  return enrichSpecialDayCopy(rowToSpecialDay(data as SpecialDayRow));
}

export async function seedSpecialDaysFromCatalog(): Promise<number> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    throw new Error("Seed için SUPABASE_SECRET_KEY gerekli");
  }

  const rows = buildSpecialDaysFromPromptSeed().map((day) => specialDayToRow(day));
  const { error } = await supabase.from("special_days").upsert(rows, { onConflict: "slug" });

  if (error) {
    throw new Error(error.message);
  }

  return rows.length;
}
