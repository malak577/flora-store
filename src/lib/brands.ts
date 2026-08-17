import { supabase } from "@/integrations/supabase/client";

export interface Brand {
  id: string;
  nameEn: string;
  nameAr: string;
  sortOrder: number;
}

const COLUMNS = "id,name_en,name_ar,sort_order";

function mapRow(row: Record<string, any>): Brand {
  return {
    id: row.id as string,
    nameEn: row.name_en ?? "",
    nameAr: row.name_ar ?? "",
    sortOrder: Number(row.sort_order ?? 0),
  };
}

/** Public read — anyone can see brands. */
export async function fetchBrands(): Promise<Brand[]> {
  const { data, error } = await supabase
    .from("brands")
    .select(COLUMNS)
    .order("sort_order", { ascending: true })
    .order("name_en", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

/** Admin only (enforced by RLS). */
export async function createBrand(nameEn: string, nameAr: string): Promise<Brand> {
  const { data, error } = await supabase
    .from("brands")
    .insert({ name_en: nameEn.trim(), name_ar: nameAr.trim() })
    .select(COLUMNS)
    .single();
  if (error) throw error;
  return mapRow(data as Record<string, any>);
}

/** Admin only (enforced by RLS). */
export async function updateBrand(
  id: string,
  patch: { nameEn?: string; nameAr?: string; sortOrder?: number },
): Promise<Brand> {
  const row: { name_en?: string; name_ar?: string; sort_order?: number } = {};
  if (patch.nameEn !== undefined) row.name_en = patch.nameEn.trim();
  if (patch.nameAr !== undefined) row.name_ar = patch.nameAr.trim();
  if (patch.sortOrder !== undefined) row.sort_order = patch.sortOrder;

  const { data, error } = await supabase
    .from("brands")
    .update(row)
    .eq("id", id)
    .select(COLUMNS)
    .single();
  if (error) throw error;
  return mapRow(data as Record<string, any>);
}

/** Admin only (enforced by RLS). */
export async function deleteBrand(id: string): Promise<void> {
  const { error } = await supabase.from("brands").delete().eq("id", id);
  if (error) throw error;
}
