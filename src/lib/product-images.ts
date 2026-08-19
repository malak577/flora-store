import { supabase } from "@/integrations/supabase/client";

export const PRODUCT_IMAGES_BUCKET = "product-images";
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** Permanent, stable URL served by our own app (bucket stays private). */
export function productImageUrl(path: string) {
  return `/api/public/product-images/${path.split("/").map(encodeURIComponent).join("/")}`;
}

function extOf(file: File) {
  const fromName = file.name.includes(".") ? file.name.split(".").pop()! : "";
  const ext = (fromName || file.type.split("/")[1] || "jpg").toLowerCase();
  return ext.replace(/[^a-z0-9]/g, "") || "jpg";
}

/**
 * Uploads a product image to storage and returns a permanent URL to store in
 * the products table. The URL never expires and survives refreshes.
 */
export async function uploadProductImage(file: File, productId?: string): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");
  if (file.size > MAX_IMAGE_BYTES) throw new Error("Image must be smaller than 5MB.");

  const slug = (productId || "product").replace(/[^a-zA-Z0-9-_]/g, "").slice(0, 40) || "product";
  const path = `${slug}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extOf(file)}`;

  const { error } = await supabase.storage
    .from(PRODUCT_IMAGES_BUCKET)
    .upload(path, file, { cacheControl: "31536000", upsert: false, contentType: file.type });
  if (error) throw error;

  return productImageUrl(path);
}
