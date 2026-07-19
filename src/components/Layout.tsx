import { Link } from "@tanstack/react-router";
import { ShoppingBag, Menu, X, Globe, Heart } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";

export function Layout({ children }: { children: ReactNode }) {
  const { t, lang, setLang } = useI18n();
  const { cart, hydrated, wishlist } = useStore();
  const [open, setOpen] = useState(false);
  const cartCount = hydrated ? cart.reduce((s, i) => s + i.quantity, 0) : 0;
  const wishCount = hydrated ? wishlist.length : 0;
  const ar = lang === "ar";

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition">
            <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-serif text-lg shadow-sm">F</div>
            <span className="font-serif text-xl tracking-tight text-charcoal">{t("brand_name")}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm">
            <Link to="/" className="hover:text-primary transition">{t("nav_home")}</Link>
            <Link to="/products" className="hover:text-primary transition">{t("nav_shop")}</Link>
            <Link to="/about" className="hover:text-primary transition">{ar ? "من نحن" : "About"}</Link>
            <Link to="/contact" className="hover:text-primary transition">{ar ? "تواصل" : "Contact"}</Link>
          </nav>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setLang(lang === "en" ? "ar" : "en")}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary active:scale-95 transition"
              aria-label="Toggle language"
            >
              <Globe className="h-3.5 w-3.5" />
              {lang === "en" ? "العربية" : "English"}
            </button>
            <Link
              to="/wishlist"
              className="relative hidden sm:inline-flex items-center justify-center h-10 w-10 rounded-full hover:bg-secondary transition"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishCount > 0 && (
                <span className="absolute -top-1 -end-1 h-5 min-w-5 px-1 rounded-full bg-rose-500 text-white text-[10px] font-semibold flex items-center justify-center">
                  {wishCount}
                </span>
              )}
            </Link>
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
              <Link to="/wishlist" onClick={() => setOpen(false)}>{ar ? "المفضلة" : "Wishlist"}</Link>
              <Link to="/about" onClick={() => setOpen(false)}>{ar ? "من نحن" : "About"}</Link>
              <Link to="/contact" onClick={() => setOpen(false)}>{ar ? "تواصل" : "Contact"}</Link>
              <Link to="/admin" onClick={() => setOpen(false)}>{t("nav_admin")}</Link>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-20 border-t border-border bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-serif">F</div>
              <span className="font-serif text-xl">{t("brand_name")}</span>
            </div>
            <p className="mt-3 text-sm text-muted-foreground max-w-xs">{t("footer_tagline")}</p>
          </div>
          <FooterCol title={ar ? "المتجر" : "Shop"} links={[
            { to: "/products", label: t("nav_shop") },
            { to: "/wishlist", label: ar ? "المفضلة" : "Wishlist" },
            { to: "/cart", label: t("nav_cart") },
          ]} />
          <FooterCol title={ar ? "الشركة" : "Company"} links={[
            { to: "/about", label: ar ? "من نحن" : "About Us" },
            { to: "/contact", label: ar ? "تواصل معنا" : "Contact Us" },
          ]} />
          <FooterCol title={ar ? "القانوني" : "Legal"} links={[
            { to: "/shipping", label: ar ? "الشحن والإرجاع" : "Shipping & Returns" },
            { to: "/privacy", label: ar ? "الخصوصية" : "Privacy Policy" },
            { to: "/terms", label: ar ? "الشروط والأحكام" : "Terms & Conditions" },
          ]} />
        </div>
        <div className="border-t border-border">
          <p className="mx-auto max-w-7xl px-4 sm:px-6 py-5 text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()} {t("brand_name")}. {ar ? "جميع الحقوق محفوظة." : "All rights reserved."}
          </p>
        </div>
      </footer>
    </div>
  );
}

function FooterCol({ title, links }: { title: string; links: { to: string; label: string }[] }) {
  return (
    <div>
      <h4 className="font-serif text-sm uppercase tracking-widest text-charcoal">{title}</h4>
      <ul className="mt-3 space-y-2 text-sm">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="text-muted-foreground hover:text-primary transition">{l.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
