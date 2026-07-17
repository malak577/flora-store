import { Link } from "@tanstack/react-router";
import { ShoppingBag, Menu, X, Globe } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";

export function Layout({ children }: { children: ReactNode }) {
  const { t, lang, setLang } = useI18n();
  const { cart, hydrated } = useStore();
  const [open, setOpen] = useState(false);
  const cartCount = hydrated ? cart.reduce((s, i) => s + i.quantity, 0) : 0;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-serif text-lg">F</div>
            <span className="font-serif text-xl tracking-tight text-charcoal">{t("brand_name")}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm">
            <Link to="/" className="hover:text-primary transition">{t("nav_home")}</Link>
            <Link to="/products" className="hover:text-primary transition">{t("nav_shop")}</Link>
            <Link to="/admin" className="hover:text-primary transition">{t("nav_admin")}</Link>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang(lang === "en" ? "ar" : "en")}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary transition"
              aria-label="Toggle language"
            >
              <Globe className="h-3.5 w-3.5" />
              {lang === "en" ? "العربية" : "English"}
            </button>
            <Link
              to="/cart"
              className="relative inline-flex items-center justify-center h-10 w-10 rounded-full hover:bg-secondary transition"
              aria-label={t("nav_cart")}
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -end-1 h-5 min-w-5 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-secondary"
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {open && (
          <div className="md:hidden border-t border-border bg-background">
            <nav className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-3 text-sm">
              <Link to="/" onClick={() => setOpen(false)}>{t("nav_home")}</Link>
              <Link to="/products" onClick={() => setOpen(false)}>{t("nav_shop")}</Link>
              <Link to="/admin" onClick={() => setOpen(false)}>{t("nav_admin")}</Link>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-16 border-t border-border bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-serif">F</div>
            <span className="font-serif text-lg">{t("brand_name")}</span>
          </div>
          <p className="text-sm text-muted-foreground">{t("footer_tagline")}</p>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
