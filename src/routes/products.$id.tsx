import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useStore } from "@/lib/store";
import type { Product } from "@/lib/types";
import { useI18n, formatEGP } from "@/lib/i18n";
import { Check, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/products/$id")({
  component: ProductDetail,
});

function ProductDetail() {
  const { id } = Route.useParams();
  const { products, productsLoading } = useStore();
  const { t } = useI18n();
  const product = products.find((p) => p.id === id);

  if (!product && productsLoading) {
    return (
      <Layout>
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="grid md:grid-cols-2 gap-10 animate-pulse">
            <div className="rounded-3xl bg-secondary/50 aspect-square" />
            <div className="space-y-4">
              <div className="h-4 w-24 rounded bg-secondary/60" />
              <div className="h-8 w-2/3 rounded bg-secondary/60" />
              <div className="h-4 w-full rounded bg-secondary/50" />
              <div className="h-4 w-5/6 rounded bg-secondary/50" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <h1 className="font-serif text-2xl">Product not found</h1>
          <Link to="/products" className="mt-4 inline-block text-primary hover:underline">
            ← {t("nav_shop")}
          </Link>
        </div>
      </Layout>
    );
  }

  return <ProductView product={product} />;
}

function ProductView({ product }: { product: Product }) {
  const { addToCart } = useStore();
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const variants = (product.variants ?? []).filter((v: any) => v.label);
  const [variantIdx, setVariantIdx] = useState(0);
  const variant = variants[variantIdx];
  const gallery: string[] = [product.image, ...(product.images ?? [])].filter(Boolean);
  const [imgIdx, setImgIdx] = useState(0);
  const activeImage = variant?.image || gallery[imgIdx] || product.image;

  const price = variant ? variant.price : product.price;
  const salePrice = variant ? variant.salePrice : product.salePrice;
  const onSale = salePrice != null && salePrice < price;
  const effective = onSale ? salePrice! : price;

  return (
    <Layout>
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        <Link to="/products" className="text-sm text-muted-foreground hover:text-primary">
          ← {t("nav_shop")}
        </Link>
        <div className="mt-6 grid md:grid-cols-2 gap-10">
          <div>
            <div className="rounded-3xl overflow-hidden bg-secondary/40 aspect-square">
              <img src={activeImage} alt={product.name[lang]} fetchPriority="high" decoding="async" className="h-full w-full object-cover" />
            </div>
            {gallery.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {gallery.map((url, i) => (
                  <button
                    key={url}
                    onClick={() => setImgIdx(i)}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border transition ${
                      activeImage === url ? "border-primary" : "border-border hover:border-primary/50"
                    }`}
                    aria-label={`Image ${i + 1}`}
                  >
                    <img src={url} alt="" loading="lazy" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-primary font-medium">{product.brand}</p>
            <h1 className="mt-3 font-serif text-3xl sm:text-4xl text-charcoal">{product.name[lang]}</h1>

            <div className="mt-4">
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full ${
                product.availability === "instant"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}>
                {product.availability === "instant" ? t("instant_ship") : t("preorder")}
              </span>
            </div>

            <div className="mt-6 flex items-baseline gap-3">
              {onSale ? (
                <>
                  <span className="text-3xl font-semibold text-primary">
                    {formatEGP(salePrice!, lang)}
                  </span>
                  <span className="text-lg text-muted-foreground line-through">
                    {formatEGP(price, lang)}
                  </span>
                  <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full uppercase">
                    {t("sale")}
                  </span>
                </>
              ) : (
                <span className="text-3xl font-semibold">{formatEGP(price, lang)}</span>
              )}
            </div>

            {variants.length > 0 && (
              <div className="mt-6">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {lang === "ar" ? "اختاري الحجم" : "Choose size"}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {variants.map((v: any, i: number) => (
                    <button
                      key={v.label + i}
                      onClick={() => setVariantIdx(i)}
                      className={`rounded-full border px-4 py-2 text-sm transition active:scale-95 ${
                        i === variantIdx
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:border-primary"
                      }`}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p className="mt-6 text-sm text-muted-foreground leading-relaxed">
              {product.description[lang]}
            </p>

            {product.benefits[lang].length > 0 && (
              <div className="mt-8 rounded-2xl border border-border bg-secondary/30 p-5">
                <h2 className="font-serif text-lg mb-3">{t("benefits")}</h2>
                <ul className="space-y-2">
                  {product.benefits[lang].map((b: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {product.usage && (product.usage[lang]?.trim() ?? "") !== "" && (
              <div className="mt-5 rounded-2xl border border-border bg-card p-5">
                <h2 className="font-serif text-lg mb-2">{t("usage")}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {product.usage[lang]}
                </p>
              </div>
            )}

            {product.ingredients && (product.ingredients[lang]?.trim() ?? "") !== "" && (
              <div className="mt-5 rounded-2xl border border-border bg-card p-5">
                <h2 className="font-serif text-lg mb-2">{t("ingredients")}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {product.ingredients[lang]}
                </p>
              </div>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => {
                  addToCart(product.id);
                  toast.success(lang === "ar" ? "تم الإضافة للسلة" : "Added to cart");
                }}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 hover:shadow-lg active:scale-95 transition-all duration-300"
              >
                <ShoppingBag className="h-4 w-4" />
                {t("add_to_cart")}
              </button>
              <button
                onClick={() => {
                  addToCart(product.id);
                  navigate({ to: "/checkout" });
                }}
                className="inline-flex items-center rounded-full border border-primary px-7 py-3 text-sm font-medium text-primary hover:bg-primary hover:text-primary-foreground transition"
              >
                {t("buy_now")}
              </button>
            </div>

            <p className="mt-6 text-xs text-muted-foreground">
              {t("deposit_50")} • {formatEGP(effective / 2, lang)}
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
