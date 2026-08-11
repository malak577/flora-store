import { supabase } from "@/integrations/supabase/client";
import type { Order, OrderCustomer, OrderLine, OrderStatus } from "./types";

const BUCKET = "order-receipts";

export interface DbOrder extends Order {
  orderNumber: number | null;
  paymentMethod: string;
  receiptPath: string | null;
  shippingFee: number;
  total: number;
}

/** Never leak raw database/API errors to customers. */
export function friendlyError(err: unknown, ar: boolean): string {
  const raw = err instanceof Error ? err.message : String(err ?? "");
  const msg = raw.toLowerCase();
  if (msg.includes("failed to fetch") || msg.includes("network")) {
    return ar
      ? "تعذر الاتصال بالإنترنت. برجاء المحاولة مرة أخرى."
      : "Connection problem. Please check your internet and try again.";
  }
  if (msg.includes("payload") || msg.includes("too large") || msg.includes("413")) {
    return ar ? "حجم الصورة كبير جدًا. برجاء رفع صورة أصغر." : "The image is too large. Please upload a smaller one.";
  }
  if (msg.includes("permission") || msg.includes("row-level") || msg.includes("jwt") || msg.includes("401")) {
    return ar ? "ليس لديك صلاحية لتنفيذ هذا الإجراء." : "You don't have permission to do that.";
  }
  return ar
    ? "حدث خطأ غير متوقع. برجاء المحاولة مرة أخرى بعد قليل."
    : "Something went wrong. Please try again in a moment.";
}

function isRetryable(err: unknown): boolean {
  const m = (err instanceof Error ? err.message : String(err ?? "")).toLowerCase();
  return (
    m.includes("failed to fetch") ||
    m.includes("network") ||
    m.includes("timeout") ||
    m.includes("503") ||
    m.includes("504") ||
    m.includes("fetch failed")
  );
}

/** Retries transient network/infra failures with exponential backoff + jitter. */
async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (!isRetryable(err) || i === attempts - 1) throw err;
      const delay = 300 * 2 ** i + Math.random() * 200;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastError;
}

function mapRow(row: Record<string, any>): DbOrder {
  return {
    id: row.id as string,
    orderNumber: (row.order_number as number | null) ?? null,
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
    shippingFee: Number(row.shipping_fee ?? 0),
    total: Number(row.total ?? row.subtotal ?? 0),
    paymentMethod: (row.payment_method as string) ?? "vodafone_cash",
    receiptPath: (row.receipt_path as string | null) ?? null,
  };
}

/** Stable per-checkout id so retries / double clicks can never duplicate an order. */
export function newClientOrderId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

/** Uploads a payment receipt screenshot. Guests are allowed to upload. */
export async function uploadReceipt(file: File): Promise<string> {
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext || "jpg"}`;
  return withRetry(async () => {
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });
    if (error) throw error;
    return path;
  });
}

/**
 * Creates an order as a guest. A single INSERT is atomic, and the unique
 * client_order_id makes it idempotent: a retry of the same checkout either
 * succeeds once or is silently ignored — never duplicated, never lost.
 */
export async function createOrder(input: {
  clientOrderId: string;
  customer: OrderCustomer;
  items: OrderLine[];
  subtotal: number;
  shippingFee: number;
  total: number;
  deposit: number;
  paymentMethod: string;
  receiptPath: string | null;
}): Promise<void> {
  await withRetry(async () => {
    // No .select() here: guests may INSERT but not SELECT orders (admin-only reads).
    const { error } = await supabase.from("orders").insert({
      client_order_id: input.clientOrderId,
      status: "pending",
      customer_name: input.customer.name.trim(),
      customer_phone: input.customer.phone.trim(),
      customer_alt_phone: input.customer.altPhone.trim(),
      governorate: input.customer.governorate.trim(),
      address: input.customer.address.trim(),
      items: input.items as unknown as never,
      subtotal: input.subtotal,
      shipping_fee: input.shippingFee,
      total: input.total,
      deposit: input.deposit,
      payment_method: input.paymentMethod,
      receipt_path: input.receiptPath,
    });
    if (error) {
      // 23505 = the exact same checkout was already stored. Treat as success.
      if ((error as { code?: string }).code === "23505") return;
      throw error;
    }
  });
}

export interface OrdersPage {
  orders: DbOrder[];
  total: number;
}

/** Admin-only, paginated + optionally filtered. RLS blocks everyone else. */
export async function fetchOrders(opts?: {
  page?: number;
  pageSize?: number;
  status?: OrderStatus | "all";
}): Promise<OrdersPage> {
  const page = opts?.page ?? 0;
  const pageSize = opts?.pageSize ?? 20;
  const from = page * pageSize;

  return withRetry(async () => {
    let query = supabase
      .from("orders")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, from + pageSize - 1);

    if (opts?.status && opts.status !== "all") query = query.eq("status", opts.status);

    const { data, error, count } = await query;
    if (error) throw error;
    return { orders: (data ?? []).map(mapRow), total: count ?? 0 };
  });
}

export async function setOrderStatus(id: string, status: OrderStatus) {
  await withRetry(async () => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) throw error;
  });
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
