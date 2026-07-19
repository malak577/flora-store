import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { useStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { Heart } from "lucide-react";

export const Route = createFileRoute("/wishlist")({
  head: () => ({ meta: [{ title: "Wishlist — Flora Store" }] }),
  component: Wishlist,
});

function Wishlist() {
  const { wishlist, products, hydrated } = useStore();
  const { lang } = useI18n();
  const ar = lang === "ar";
  const items = products.filter((p) => wishlist.includes(p.id));

  return (
    <Layout>
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="h-6 w-6 text-primary" />
          <h1 className="font-serif text-3xl sm:text-4xl">{ar ? "المفضلة" : "Wishlist"}</h1>
        </div>
        {!hydrated ? null : items.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-dashed border-border">
            <p className="text-muted-foreground">{ar ? "قائمة المفضلة فارغة." : "Your wishlist is empty."}</p>
            <Link to="/products" className="mt-4 inline-block text-primary hover:underline">
              {ar ? "تسوق الآن" : "Shop now"} →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {items.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
    </Layout>
  );
}
