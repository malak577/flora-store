import { supabase } from "@/integrations/supabase/client";
import type { Product, Availability, ProductBadge, ProductVariant } from "./types";

const COLUMNS =
  "id,brand,brand_id,name_en,name_ar,description_en,description_ar,usage_en,usage_ar,ingredients_en,ingredients_ar,benefits_en,benefits_ar,price,sale_price,image,images,variants,availability,rating,review_count,badge,best_seller,sort_order,category_en,category_ar,stock,size";

function mapVariants(raw: unknown): ProductVariant[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((v) => v && typeof v === "object")
    .map((v: any) => ({
      label: String(v.label ?? "").trim(),
      price: Number(v.price ?? 0),
      salePrice: v.salePrice == null || v.salePrice === "" ? undefined : Number(v.salePrice),
      image: v.image ? String(v.image) : undefined,
    }))
    .filter((v) => v.label !== "")
    .slice(0, 3);
}


function pair(en?: string | null, ar?: string | null) {
  const e = (en ?? "").trim();
  const a = (ar ?? "").trim();
  if (!e && !a) return undefined;
  return { en: e, ar: a };
}

export function mapRow(row: Record<string, any>): Product {
  return {
    id: row.id as string,
    brand: row.brand ?? "",
    brandId: row.brand_id ?? undefined,
    name: { en: row.name_en ?? "", ar: row.name_ar ?? "" },
    description: { en: row.description_en ?? "", ar: row.description_ar ?? "" },
    usage: pair(row.usage_en, row.usage_ar),
    ingredients: pair(row.ingredients_en, row.ingredients_ar),
    category: pair(row.category_en, row.category_ar),
    stock: row.stock == null ? undefined : Number(row.stock),
    size: row.size ?? undefined,
    benefits: { en: row.benefits_en ?? [], ar: row.benefits_ar ?? [] },
    price: Number(row.price ?? 0),
    salePrice: row.sale_price == null ? undefined : Number(row.sale_price),
    image: row.image ?? "",
    images: Array.isArray(row.images) ? (row.images as string[]).filter(Boolean) : [],
    variants: mapVariants(row.variants),
    availability: (row.availability ?? "instant") as Availability,
    rating: row.rating == null ? undefined : Number(row.rating),
    reviewCount: row.review_count == null ? undefined : Number(row.review_count),
    badge: (row.badge ?? undefined) as ProductBadge | undefined,
    bestSeller: Boolean(row.best_seller),
    sortOrder: Number(row.sort_order ?? 0),
  };
}

function clean(s?: string) {
  const v = (s ?? "").trim();
  return v === "" ? null : v;
}

export function toRow(p: Product) {
  return {
    id: p.id,
    brand: p.brand ?? "",
    brand_id: p.brandId ?? null,
    name_en: p.name.en ?? "",
    name_ar: p.name.ar ?? "",
    description_en: p.description.en ?? "",
    description_ar: p.description.ar ?? "",
    usage_en: clean(p.usage?.en),
    usage_ar: clean(p.usage?.ar),
    ingredients_en: clean(p.ingredients?.en),
    ingredients_ar: clean(p.ingredients?.ar),
    category_en: (p.category?.en ?? "").trim(),
    category_ar: (p.category?.ar ?? "").trim(),
    stock: p.stock == null || Number.isNaN(p.stock) ? null : p.stock,
    size: clean(p.size),
    benefits_en: p.benefits?.en ?? [],
    benefits_ar: p.benefits?.ar ?? [],
    price: p.price ?? 0,
    sale_price: p.salePrice == null || Number.isNaN(p.salePrice) ? null : p.salePrice,
    image: p.image ?? "",
    images: (p.images ?? []).filter(Boolean),
    variants: (p.variants ?? [])
      .filter((v) => (v.label ?? "").trim() !== "")
      .slice(0, 3)
      .map((v) => ({
        label: v.label.trim(),
        price: Number(v.price ?? 0),
        salePrice: v.salePrice == null || Number.isNaN(v.salePrice) ? null : Number(v.salePrice),
        image: v.image ?? null,
      })),
    availability: p.availability ?? "instant",
    rating: p.rating ?? null,
    review_count: p.reviewCount ?? null,
    badge: p.badge ?? null,
    best_seller: Boolean(p.bestSeller),
    sort_order: p.sortOrder ?? 0,
  };
}

/** Public read — anyone (including guests) can see products. */
export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(COLUMNS)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

/** Admin only (enforced by RLS). Insert or update in one call. */
export async function saveProduct(p: Product): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .upsert(toRow(p), { onConflict: "id" })
    .select(COLUMNS)
    .single();
  if (error) throw error;
  return mapRow(data as Record<string, any>);
}

/** Admin only (enforced by RLS). */
export async function deleteProductRow(id: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}
