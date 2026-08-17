import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Layout } from "@/components/Layout";
import { FadeIn } from "@/components/FadeIn";
import { useI18n } from "@/lib/i18n";
import { useBrands } from "@/hooks/useBrands";

export const Route = createFileRoute("/brands")({
  head: () => ({
    meta: [
      { title: "All Brands — Flora Store" },
      {
        name: "description",
        content:
          "Browse every skincare brand available at Flora Store — search in English or Arabic and jump A-Z.",
      },
      { property: "og:title", content: "All Brands — Flora Store" },
      {
        property: "og:description",
        content: "Browse every skincare brand available at Flora Store, in English and Arabic.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BrandsPage,
});

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function BrandsPage() {
  const { lang } = useI18n();
  const ar = lang === "ar";
  const { brands, loading, error } = useBrands();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return brands;
    return brands.filter(
      (b) => b.nameEn.toLowerCase().includes(term) || b.nameAr.toLowerCase().includes(term),
    );
  }, [brands, q]);

  const groups = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    for (const b of [...filtered].sort((a, c) => a.nameEn.localeCompare(c.nameEn))) {
      const first = (b.nameEn[0] ?? "#").toUpperCase();
      const key = /[A-Z]/.test(first) ? first : "#";
      map.set(key, [...(map.get(key) ?? []), b]);
    }
    return map;
  }, [filtered]);

  return (
    <Layout>
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <FadeIn>
          <p className="text-xs uppercase tracking-[0.3em] text-primary font-medium">
            {ar ? "تسوقي حسب الماركة" : "Shop by brand"}
          </p>
          <h1 className="mt-2 font-serif text-3xl sm:text-4xl">{ar ? "كل الماركات" : "All Brands"}</h1>
        </FadeIn>

        <div className="relative mt-6 max-w-md">
          <Search className="absolute top-1/2 -translate-y-1/2 start-4 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={ar ? "ابحثي عن ماركة..." : "Search brands…"}
            className="w-full rounded-full border border-input bg-background ps-11 pe-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-1.5">
          {LETTERS.map((l) => {
            const has = groups.has(l);
            return has ? (
              <a
                key={l}
                href={`#brand-${l}`}
                className="h-8 w-8 grid place-items-center rounded-full border border-border bg-card text-xs font-medium hover:bg-primary hover:text-primary-foreground hover:border-primary transition"
              >
                {l}
              </a>
            ) : (
              <span
                key={l}
                className="h-8 w-8 grid place-items-center rounded-full text-xs text-muted-foreground/40"
              >
                {l}
              </span>
            );
          })}
        </div>

        {loading && <p className="py-12 text-sm text-muted-foreground">{ar ? "جارٍ التحميل..." : "Loading…"}</p>}
        {error && <p className="py-12 text-sm text-destructive">{error}</p>}
        {!loading && filtered.length === 0 && (
          <p className="py-16 text-center text-muted-foreground">
            {ar ? "لا توجد ماركات مطابقة." : "No brands match your search."}
          </p>
        )}

        <div className="mt-10 space-y-10">
          {[...groups.entries()].map(([letter, list]) => (
            <div key={letter} id={`brand-${letter}`} className="scroll-mt-24">
              <h2 className="font-serif text-2xl text-primary mb-4">{letter}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {list.map((b) => (
                  <Link
                    key={b.id}
                    to="/products"
                    search={{ brand: b.nameEn }}
                    className="rounded-2xl border border-border bg-card p-5 hover:shadow-md hover:-translate-y-0.5 hover:border-primary/40 transition-all"
                  >
                    <p className="font-medium text-charcoal truncate">{b.nameEn}</p>
                    <p className="mt-1 text-sm text-muted-foreground truncate" dir="rtl">{b.nameAr}</p>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
