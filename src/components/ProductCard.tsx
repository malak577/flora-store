import { Link } from "@tanstack/react-router";
import { ShoppingBag, Heart, Eye } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import type { Product } from "@/lib/types";
import { useI18n, formatEGP } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { Rating } from "./Rating";
import { QuickViewModal } from "./QuickViewModal";

export function ProductCard({ product }: { product: Product }) {
  const { t, lang } = useI18n();
  const { addToCart, toggleWishlist, wishlist } = useStore();
  const [quickView, setQuickView] = useState(false);
  const onSale = product.salePrice != null && product.salePrice < product.price;
  const wished = wishlist.includes(product.id);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product.id, 1);
    toast.success(`${product.name[lang]} — ${t("add_to_cart")} ✓`);
  };
  const stop = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); };

  return (
    <>
      <Link
        to="/products/$id"
        params={{ id: product.id }}
        className="group block rounded-2xl border border-border bg-card overflow-hidden hover:shadow-xl hover:border-primary/30 hover:-translate-y-1 transition-all duration-300"
      >
        <div className="relative aspect-square bg-secondary/40 overflow-hidden">
          <img
            src={product.image}
            alt={product.name[lang]}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
          />

          {/* Top badges */}
          <div className="absolute top-3 start-3 flex flex-col gap-1.5">
            {product.bestSeller && (
              <span className="bg-charcoal text-cream text-[10px] font-semibold px-2 py-1 rounded-full uppercase tracking-wider">
                {lang === "ar" ? "الأكثر مبيعاً" : "Best Seller"}
              </span>
            )}
            {product.badge === "new" && (
              <span className="bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-1 rounded-full uppercase tracking-wider">
                {lang === "ar" ? "جديد" : "New"}
              </span>
            )}
            {onSale && (
              <span className="bg-rose-600 text-white text-[10px] font-semibold px-2 py-1 rounded-full uppercase tracking-wider">
                {t("sale")}
              </span>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={(e) => { stop(e); toggleWishlist(product.id); toast.success(wished ? (lang === "ar" ? "أُزيل من المفضلة" : "Removed from wishlist") : (lang === "ar" ? "أُضيف للمفضلة" : "Added to wishlist")); }}
            aria-label="Wishlist"
            className="absolute top-3 end-3 h-9 w-9 rounded-full bg-background/90 backdrop-blur flex items-center justify-center hover:bg-background hover:scale-110 active:scale-95 transition"
          >
            <Heart className={`h-4 w-4 transition ${wished ? "fill-rose-500 text-rose-500" : "text-charcoal"}`} />
          </button>

          {/* Quick view (hover) */}
          <button
            onClick={(e) => { stop(e); setQuickView(true); }}
            className="absolute bottom-3 end-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 inline-flex items-center gap-1.5 rounded-full bg-charcoal text-cream px-3 py-1.5 text-[11px] font-medium hover:bg-charcoal/90"
          >
            <Eye className="h-3 w-3" />
            {lang === "ar" ? "عرض سريع" : "Quick View"}
          </button>

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
          {product.rating != null && (
            <div className="mt-1.5"><Rating value={product.rating} count={product.reviewCount} /></div>
          )}
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
            className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground py-2.5 text-xs font-medium hover:bg-primary/90 hover:shadow-md active:scale-95 transition-all"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            {t("add_to_cart")}
          </button>
        </div>
      </Link>
      {quickView && <QuickViewModal product={product} onClose={() => setQuickView(false)} />}
    </>
  );
}
