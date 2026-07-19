import { X, ShoppingBag, Check } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/lib/types";
import { useI18n, formatEGP } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { Rating } from "./Rating";
import { Link } from "@tanstack/react-router";

export function QuickViewModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const { t, lang } = useI18n();
  const { addToCart } = useStore();
  const onSale = product.salePrice != null && product.salePrice < product.price;

  return (
    <div
      className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid md:grid-cols-2">
          <div className="aspect-square bg-secondary/40">
            <img src={product.image} alt={product.name[lang]} className="h-full w-full object-cover" />
          </div>
          <div className="p-6 relative flex flex-col">
            <button
              onClick={onClose}
              className="absolute top-3 end-3 h-9 w-9 rounded-full hover:bg-secondary inline-flex items-center justify-center"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
            <p className="text-xs uppercase tracking-[0.25em] text-primary font-medium">{product.brand}</p>
            <h3 className="mt-2 font-serif text-2xl text-charcoal">{product.name[lang]}</h3>
            {product.rating != null && (
              <div className="mt-2"><Rating value={product.rating} count={product.reviewCount} /></div>
            )}
            <div className="mt-4 flex items-baseline gap-2">
              {onSale ? (
                <>
                  <span className="text-2xl font-semibold text-primary">{formatEGP(product.salePrice!, lang)}</span>
                  <span className="text-sm text-muted-foreground line-through">{formatEGP(product.price, lang)}</span>
                </>
              ) : (
                <span className="text-2xl font-semibold">{formatEGP(product.price, lang)}</span>
              )}
            </div>
            <p className="mt-4 text-sm text-muted-foreground line-clamp-3">{product.description[lang]}</p>
            {product.benefits[lang].length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {product.benefits[lang].slice(0, 3).map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs">
                    <Check className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-auto pt-6 flex flex-wrap gap-2">
              <button
                onClick={() => {
                  addToCart(product.id);
                  toast.success(`${product.name[lang]} ✓`);
                  onClose();
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-3 text-sm font-medium hover:bg-primary/90 active:scale-95 transition"
              >
                <ShoppingBag className="h-4 w-4" />
                {t("add_to_cart")}
              </button>
              <Link
                to="/products/$id"
                params={{ id: product.id }}
                onClick={onClose}
                className="inline-flex items-center rounded-full border border-border px-5 py-3 text-sm font-medium hover:bg-secondary transition"
              >
                {lang === "ar" ? "التفاصيل" : "Details"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
