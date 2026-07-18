import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useStore, priceOf } from "@/lib/store";
import { useI18n, formatEGP } from "@/lib/i18n";
import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";
import type { Order } from "@/lib/types";

export const Route = createFileRoute("/checkout")({
  component: Checkout,
});

function Checkout() {
  const { t, lang } = useI18n();
  const { cart, products, settings, clearCart, hydrated, addOrder } = useStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", phone: "", altPhone: "", governorate: "", address: "" });

  const items = cart
    .map((i) => ({ item: i, product: products.find((p) => p.id === i.productId) }))
    .filter((x) => x.product) as {
    item: { productId: string; quantity: number };
    product: NonNullable<ReturnType<typeof products.find>>;
  }[];

  const subtotal = items.reduce((s, { item, product }) => s + priceOf(product) * item.quantity, 0);
  const deposit = subtotal / 2;

  if (hydrated && items.length === 0) {
    return (
      <Layout>
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <p className="text-muted-foreground">{t("cart_empty")}</p>
          <Link to="/products" className="mt-4 inline-block text-primary hover:underline">
            {t("continue_shopping")} →
          </Link>
        </div>
      </Layout>
    );
  }

  function buildWhatsAppMessage() {
    const L = lang;
    const header =
      L === "ar" ? `طلب جديد من فلورا ستور\n---\n` : `New Order — Flora Store\n---\n`;
    const cust =
      L === "ar"
        ? `الاسم: ${form.name}\nالهاتف: ${form.phone}\nالعنوان: ${form.address}, ${form.city}\n\nالمنتجات:\n`
        : `Name: ${form.name}\nPhone: ${form.phone}\nAddress: ${form.address}, ${form.city}\n\nItems:\n`;

    const lines = items
      .map(({ item, product }) => {
        const line = `• ${product.name[L]} × ${item.quantity} — ${formatEGP(
          priceOf(product) * item.quantity,
          L,
        )}`;
        return line;
      })
      .join("\n");

    const totals =
      L === "ar"
        ? `\n\nالإجمالي: ${formatEGP(subtotal, L)}\nالمقدم المطلوب (٥٠٪): ${formatEGP(deposit, L)}\n\nيرجى تحويل ${formatEGP(deposit, L)} على فودافون كاش: ${settings.vodafoneCash}\nومن ثم إرفاق صورة إيصال التحويل هنا.`
        : `\n\nTotal: ${formatEGP(subtotal, L)}\n50% Deposit Required: ${formatEGP(deposit, L)}\n\nPlease transfer ${formatEGP(deposit, L)} via Vodafone Cash to: ${settings.vodafoneCash}\nThen attach the payment screenshot here.`;

    return header + cust + lines + totals;
  }

  function onConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address || !form.city) return;
    const msg = encodeURIComponent(buildWhatsAppMessage());
    const url = `https://wa.me/${settings.whatsapp}?text=${msg}`;
    clearCart();
    window.open(url, "_blank");
    navigate({ to: "/" });
  }

  return (
    <Layout>
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <h1 className="font-serif text-3xl sm:text-4xl mb-8">{t("checkout")}</h1>

        <div className="grid md:grid-cols-3 gap-8">
          <form onSubmit={onConfirm} className="md:col-span-2 space-y-4">
            <Field label={t("full_name")} value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
            <Field label={t("phone")} value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} required type="tel" />
            <Field label={t("address")} value={form.address} onChange={(v) => setForm({ ...form, address: v })} required />
            <Field label={t("city")} value={form.city} onChange={(v) => setForm({ ...form, city: v })} required />

            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
              <p className="text-sm leading-relaxed">{t("deposit_notice")}</p>
              <p className="mt-3 text-sm">
                <b>Vodafone Cash:</b>{" "}
                <span className="font-mono text-primary">{settings.vodafoneCash}</span>
              </p>
              <p className="mt-1 text-sm">
                <b>{t("deposit_50")}:</b>{" "}
                <span className="font-semibold text-primary">{formatEGP(deposit, lang)}</span>
              </p>
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 text-white py-4 font-medium hover:bg-emerald-700 transition"
            >
              <MessageCircle className="h-5 w-5" />
              {t("confirm_order")}
            </button>
          </form>

          <aside className="rounded-2xl border border-border bg-card p-5 h-fit">
            <h2 className="font-serif text-xl mb-4">{t("order_details")}</h2>
            <div className="space-y-2 text-sm">
              {items.map(({ item, product }) => (
                <div key={product.id} className="flex justify-between gap-2">
                  <span className="line-clamp-1">
                    {product.name[lang]} × {item.quantity}
                  </span>
                  <span className="text-muted-foreground shrink-0">
                    {formatEGP(priceOf(product) * item.quantity, lang)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-border my-4" />
            <div className="flex justify-between text-sm">
              <span>{t("subtotal")}</span>
              <span>{formatEGP(subtotal, lang)}</span>
            </div>
            <div className="flex justify-between font-semibold mt-1">
              <span>{t("total")}</span>
              <span className="text-primary">{formatEGP(subtotal, lang)}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>{t("deposit_50")}</span>
              <span className="font-semibold">{formatEGP(deposit, lang)}</span>
            </div>
          </aside>
        </div>
      </section>
    </Layout>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
      />
    </label>
  );
}
