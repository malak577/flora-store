import { supabase } from "@/integrations/supabase/client";

export interface ShippingRate {
  id: string;
  nameEn: string;
  nameAr: string;
  price: number;
  sortOrder: number;
}

function map(row: Record<string, any>): ShippingRate {
  return {
    id: row.id as string,
    nameEn: row.name_en as string,
    nameAr: row.name_ar as string,
    price: Number(row.price ?? 0),
    sortOrder: Number(row.sort_order ?? 0),
  };
}

/** Public read — anyone (including guests) can see shipping prices. */
export async function fetchShippingRates(): Promise<ShippingRate[]> {
  const { data, error } = await supabase
    .from("shipping_rates")
    .select("id,name_en,name_ar,price,sort_order")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(map);
}

/** Admin only (enforced by RLS). */
export async function updateShippingRate(id: string, price: number): Promise<void> {
  const { error } = await supabase.from("shipping_rates").update({ price }).eq("id", id);
  if (error) throw error;
}
