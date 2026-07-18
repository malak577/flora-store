import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/lib/types";
import { useI18n, formatEGP } from "@/lib/i18n";
import { useStore } from "@/lib/store";

export function ProductCard({ product }: { product: Product }) {
  const { t, lang } = useI18n();
  const { addToCart } = useStore();
  const onSale = product.salePrice != null && product.salePrice < product.price;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id, 1);
    toast.success(`${product.name[lang]} — ${t("add_to_cart")} ✓`);
  };

  return (
    <Link
      to="/products/$id"
      params={{ id: product.id }}
      className="group block rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all"
    >
      <div className="relative aspect-square bg-secondary/40 overflow-hidden">
        <img
          src={product.image}
          alt={product.name[lang]}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {onSale && (
          <span className="absolute top-3 start-3 bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-1 rounded-full uppercase tracking-wider">
            {t("sale")}
          </span>
        )}
        <span className={`absolute bottom-3 start-3 text-[10px] font-medium px-2 py-1 rounded-full ${
          product.availability === "instant"
            ? "bg-emerald-100 text-emerald-800"
            : "bg-amber-100 text-amber-800"
        }`}>
          {product.availability === "instant" ? t("instant_ship") : t("preorder")}
        </span>
      </div>
      <div className="p-4">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">{product.brand}</p>
        <h3 className="mt-1 font-medium text-sm line-clamp-2 min-h-10">{product.name[lang]}</h3>
        <div className="mt-3 flex items-baseline gap-2">
          {onSale ? (
            <>
              <span className="font-semibold text-primary">{formatEGP(product.salePrice!, lang)}</span>
              <span className="text-xs text-muted-foreground line-through">{formatEGP(product.price, lang)}</span>
            </>
          ) : (
            <span className="font-semibold">{formatEGP(product.price, lang)}</span>
          )}
        </div>
        <button
          onClick={handleAdd}
          className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground py-2.5 text-xs font-medium hover:bg-primary/90 transition"
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          {t("add_to_cart")}
        </button>
      </div>
    </Link>
  );
}
