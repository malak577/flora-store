import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { FadeIn } from "@/components/FadeIn";
import { FeedbackGallery } from "@/components/FeedbackGallery";
import { useStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { Sparkles, Truck, ShieldCheck, Award } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { t, lang } = useI18n();
  const { products } = useStore();
  const ar = lang === "ar";
  const brands = Array.from(new Set(products.map((p) => p.brand)));
  const bestSellers = products.filter((p) => p.bestSeller).slice(0, 4);
  const featured = products.slice(0, 8);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rose/40 via-cream to-nude/40" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-20 sm:py-28 grid md:grid-cols-2 gap-10 items-center">
          <FadeIn>
            <p className="text-xs uppercase tracking-[0.35em] text-primary font-medium">{t("brand_name")}</p>
            <h1 className="mt-5 font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.05] text-charcoal">
              {t("hero_title")}
            </h1>
            <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-lg leading-relaxed">
              {t("hero_sub")}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/products"
                className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 hover:shadow-lg active:scale-95 transition-all"
              >
                {t("shop_now")}
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center justify-center rounded-full border border-charcoal/20 px-8 py-3.5 text-sm font-medium text-charcoal hover:bg-charcoal hover:text-cream active:scale-95 transition-all"
              >
                {ar ? "تعرف علينا" : "Our Story"}
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex -space-x-2 rtl:space-x-reverse">
                {[
                  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop",
                  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop",
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop",
                ].map((s, i) => <img key={i} src={s} alt="" loading="lazy" decoding="async" className="h-7 w-7 rounded-full border-2 border-background object-cover" />)}
              </div>
              <span>{ar ? "أكثر من ٢,٠٠٠ عميلة سعيدة" : "2,000+ happy customers"}</span>
            </div>
          </FadeIn>
          <FadeIn delay={150}>
            <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&auto=format&fit=crop"
                alt="Skincare products"
                className="h-full w-full object-cover"
              />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Value props */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 grid sm:grid-cols-4 gap-4">
        {[
          { icon: ShieldCheck, key: ar ? "أصلي ١٠٠٪" : "100% Authentic" },
          { icon: Truck, key: ar ? "توصيل لكل مصر" : "Egypt-wide Delivery" },
          { icon: Award, key: ar ? "ماركات موثوقة" : "Trusted Brands" },
          { icon: Sparkles, key: ar ? "دعم واتساب" : "WhatsApp Support" },
        ].map((v, i) => (
          <FadeIn key={i} delay={i * 80}>
            <div className="rounded-2xl border border-border bg-card p-5 flex items-center gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                <v.icon className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm font-medium">{v.key}</p>
            </div>
          </FadeIn>
        ))}
      </section>

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
          <FadeIn>
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-primary font-medium">{ar ? "الأكثر مبيعاً" : "Best Sellers"}</p>
                <h2 className="mt-2 font-serif text-3xl sm:text-4xl text-charcoal">
                  {ar ? "المنتجات المفضلة لعميلاتنا" : "Loved by our customers"}
                </h2>
              </div>
              <Link to="/products" className="hidden sm:inline text-sm text-primary hover:underline">
                {ar ? "عرض الكل" : "View all"} →
              </Link>
            </div>
          </FadeIn>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {bestSellers.map((p, i) => (
              <FadeIn key={p.id} delay={i * 80}>
                <ProductCard product={p} />
              </FadeIn>
            ))}
          </div>
        </section>
      )}

      {/* Brands */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <FadeIn>
          <div className="flex items-end justify-between mb-6">
            <h2 className="font-serif text-2xl sm:text-3xl">{t("brands")}</h2>
            <Link to="/brands" className="text-sm text-primary hover:underline">
              {ar ? "عرض كل الماركات" : "View all brands"} →
            </Link>
          </div>
        </FadeIn>
        <div className="flex flex-wrap gap-3">
          {topBrands.map((b) => (
            <Link
              key={b.id}
              to="/products"
              search={{ brand: b.nameEn }}
              className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium hover:bg-primary hover:text-primary-foreground hover:border-primary hover:-translate-y-0.5 transition-all"
            >
              {ar && b.nameAr ? b.nameAr : b.nameEn}
            </Link>
          ))}
          <Link
            to="/brands"
            className="rounded-full border border-primary/40 px-5 py-2.5 text-sm font-medium text-primary hover:bg-primary hover:text-primary-foreground transition-all"
          >
            {ar ? "كل الماركات" : "View all brands"}
          </Link>
        </div>
      </section>


      {/* All products */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <FadeIn>
          <h2 className="font-serif text-2xl sm:text-3xl mb-8">{t("products")}</h2>
        </FadeIn>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {featured.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      <FeedbackGallery />
    </Layout>
  );
}
