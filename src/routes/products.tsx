import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { Layout } from "@/components/Layout";
import { ProductCard } from "@/components/ProductCard";
import { useStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";

const searchSchema = z.object({
  brand: z.string().optional(),
});

export const Route = createFileRoute("/products")({
  validateSearch: (s) => searchSchema.parse(s),
  component: Products,
});

function Products() {
  const { t } = useI18n();
  const { products } = useStore();
  const { brand } = Route.useSearch();
  const navigate = Route.useNavigate();

  const brands = Array.from(new Set(products.map((p) => p.brand))).sort();
  const filtered = brand ? products.filter((p) => p.brand === brand) : products;

  return (
    <Layout>
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="mb-6">
          <h1 className="font-serif text-3xl sm:text-4xl">{t("products")}</h1>
          <p className="text-sm text-muted-foreground mt-2">{t("filter_brand")}</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => navigate({ search: {} })}
            className={`rounded-full px-4 py-2 text-sm font-medium border transition ${
              !brand
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border hover:border-primary/40"
            }`}
          >
            {t("all_brands")}
          </button>
          {brands.map((b) => (
            <button
              key={b}
              onClick={() => navigate({ search: { brand: b } })}
              className={`rounded-full px-4 py-2 text-sm font-medium border transition ${
                brand === b
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border hover:border-primary/40"
              }`}
            >
              {b}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="text-center py-16 text-muted-foreground">No products.</p>
        )}
      </section>
    </Layout>
  );
}
