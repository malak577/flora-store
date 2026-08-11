import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useStore, priceOf } from "@/lib/store";
import { useI18n, formatEGP } from "@/lib/i18n";
import { Minus, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/cart")({
  component: CartPage,
});

function CartPage() {
  const { cart, products, updateQty, removeFromCart, hydrated } = useStore();
  const { t, lang } = useI18n();

  const items = cart
    .map((i) => ({ item: i, product: products.find((p) => p.id === i.productId) }))
    .filter((x) => x.product) as { item: { productId: string; quantity: number }; product: NonNullable<ReturnType<typeof products.find>> }[];

  const subtotal = items.reduce((s, { item, product }) => s + priceOf(product) * item.quantity, 0);

  return (
    <Layout>
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <h1 className="font-serif text-3xl sm:text-4xl mb-8">{t("nav_cart")}</h1>

        {!hydrated ? null : items.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-dashed border-border">
            <p className="text-muted-foreground">{t("cart_empty")}</p>
            <Link to="/products" className="mt-4 inline-block text-primary hover:underline">
              {t("continue_shopping")} →
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-3">
              {items.map(({ item, product }) => (
                <div key={product.id} className="flex gap-4 rounded-2xl border border-border bg-card p-3">
                  <img src={product.image} alt={product.name[lang]} loading="lazy" decoding="async" width={96} height={96} className="h-24 w-24 rounded-xl object-cover bg-secondary/40" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">{product.brand}</p>
                    <p className="font-medium text-sm line-clamp-2">{product.name[lang]}</p>
                    <p className="mt-1 text-sm font-semibold text-primary">{formatEGP(priceOf(product), lang)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="inline-flex items-center rounded-full border border-border">
                        <button onClick={() => updateQty(product.id, item.quantity - 1)} className="h-8 w-8 flex items-center justify-center hover:bg-secondary rounded-s-full"><Minus className="h-3.5 w-3.5" /></button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button onClick={() => updateQty(product.id, item.quantity + 1)} className="h-8 w-8 flex items-center justify-center hover:bg-secondary rounded-e-full"><Plus className="h-3.5 w-3.5" /></button>
                      </div>
                      <button onClick={() => removeFromCart(product.id)} className="text-xs text-muted-foreground hover:text-destructive inline-flex items-center gap-1">
                        <Trash2 className="h-3.5 w-3.5" /> {t("remove")}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 h-fit">
              <h2 className="font-serif text-xl mb-4">{t("subtotal")}</h2>
              <div className="flex justify-between text-sm mb-2">
                <span>{t("subtotal")}</span>
                <span className="font-medium">{formatEGP(subtotal, lang)}</span>
              </div>
              <div className="border-t border-border my-3" />
              <div className="flex justify-between font-semibold">
                <span>{t("total")}</span>
                <span className="text-primary">{formatEGP(subtotal, lang)}</span>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                {t("deposit_50")}: <b>{formatEGP(subtotal / 2, lang)}</b>
              </p>
              <Link to="/checkout" className="mt-5 block text-center rounded-full bg-primary text-primary-foreground py-3 text-sm font-medium hover:bg-primary/90">
                {t("checkout")}
              </Link>
            </div>
          </div>
        )}
      </section>
    </Layout>
  );
}
