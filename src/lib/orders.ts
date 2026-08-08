import { supabase } from "@/integrations/supabase/client";
import type { Order, OrderCustomer, OrderLine, OrderStatus } from "./types";

const BUCKET = "order-receipts";

export interface DbOrder extends Order {
  paymentMethod: string;
  receiptPath: string | null;
}

function mapRow(row: Record<string, any>): DbOrder {
  return {
    id: row.id as string,
    createdAt: new Date(row.created_at as string).getTime(),
    status: row.status as OrderStatus,
    customer: {
      name: row.customer_name ?? "",
      phone: row.customer_phone ?? "",
      altPhone: row.customer_alt_phone ?? "",
      governorate: row.governorate ?? "",
      address: row.address ?? "",
    },
    items: (row.items ?? []) as OrderLine[],
    subtotal: Number(row.subtotal ?? 0),
    deposit: Number(row.deposit ?? 0),
    paymentMethod: (row.payment_method as string) ?? "vodafone_cash",
    receiptPath: (row.receipt_path as string | null) ?? null,
  };
}

/** Uploads a payment receipt screenshot. Guests are allowed to upload. */
export async function uploadReceipt(file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  return path;
}

/** Creates an order as a guest. Always saved with status "pending". */
export async function createOrder(input: {
  customer: OrderCustomer;
  items: OrderLine[];
  subtotal: number;
  deposit: number;
  paymentMethod: string;
  receiptPath: string | null;
}): Promise<void> {
  // No .select() here: guests may INSERT but not SELECT orders (admin-only reads).
  const { error } = await supabase
    .from("orders")
    .insert({
      status: "pending",
      customer_name: input.customer.name,
      customer_phone: input.customer.phone,
      customer_alt_phone: input.customer.altPhone,
      governorate: input.customer.governorate,
      address: input.customer.address,
      items: input.items as unknown as never,
      subtotal: input.subtotal,
      deposit: input.deposit,
      payment_method: input.paymentMethod,
      receipt_path: input.receiptPath,
    });
  if (error) throw error;
}

/** Admin-only: RLS blocks everyone else. */
export async function fetchOrders(): Promise<DbOrder[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function setOrderStatus(id: string, status: OrderStatus) {
  const { error } = await supabase.from("orders").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function removeOrder(id: string, receiptPath: string | null) {
  const { error } = await supabase.from("orders").delete().eq("id", id);
  if (error) throw error;
  if (receiptPath) await supabase.storage.from(BUCKET).remove([receiptPath]);
}

export async function receiptUrl(path: string): Promise<string | null> {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60);
  if (error) return null;
  return data.signedUrl;
}
