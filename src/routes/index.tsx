import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { useStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { Sparkles, Truck, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { t, lang } = useI18n();
  const { products } = useStore();
  const brands = Array.from(new Set(products.map((p) => p.brand)));
  const featured = products.slice(0, 8);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rose/40 via-cream to-nude/40" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-28 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-primary font-medium">
              {t("brand_name")}
            </p>
            <h1 className="mt-4 font-serif text-4xl sm:text-5xl lg:text-6xl leading-tight text-charcoal">
              {t("hero_title")}
            </h1>
            <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-lg">
              {t("hero_sub")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/products"
                className="inline-flex items-center justify-center rounded-full bg-primary px-7 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition"
              >
                {t("shop_now")}
              </Link>
            </div>
          </div>
          <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&auto=format&fit=crop"
              alt="Skincare products"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-10 grid sm:grid-cols-3 gap-4">
        {[
          { icon: ShieldCheck, key: lang === "ar" ? "منتجات أصلية ١٠٠٪" : "100% Authentic" },
          { icon: Truck, key: lang === "ar" ? "توصيل لكل المحافظات" : "Egypt-wide Delivery" },
          { icon: Sparkles, key: lang === "ar" ? "أشهر ماركات العناية" : "Top Skincare Brands" },
        ].map((v, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-5 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
              <v.icon className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm font-medium">{v.key}</p>
          </div>
        ))}
      </section>

      {/* Brands */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="flex items-end justify-between mb-6">
          <h2 className="font-serif text-2xl sm:text-3xl">{t("brands")}</h2>
          <Link to="/products" className="text-sm text-primary hover:underline">
            {t("all_brands")} →
          </Link>
        </div>
        <div className="flex flex-wrap gap-3">
          {brands.map((b) => (
            <Link
              key={b}
              to="/products"
              search={{ brand: b }}
              className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium hover:bg-primary hover:text-primary-foreground hover:border-primary transition"
            >
              {b}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <h2 className="font-serif text-2xl sm:text-3xl mb-6">{t("products")}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </Layout>
  );
}
