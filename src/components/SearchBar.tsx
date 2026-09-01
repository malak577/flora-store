import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";

export function SearchBar({ className = "", onNavigate }: { className?: string; onNavigate?: () => void }) {
  const { lang } = useI18n();
  const { products } = useStore();
  const navigate = useNavigate();
  const ar = lang === "ar";
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const term = q.trim().toLowerCase();
  const matches = term
    ? products
        .filter((p) =>
          [p.nameEn, p.nameAr, p.brand].some((v) => (v || "").toLowerCase().includes(term)),
        )
        .slice(0, 6)
    : [];

  function submit(e?: { preventDefault?: () => void }) {
    e?.preventDefault?.();
    if (!term) return;
    setOpen(false);
    onNavigate?.();
    navigate({ to: "/products", search: { q: q.trim() } });
  }

  return (
    <div ref={boxRef} className={`relative ${className}`}>
      <form onSubmit={submit} className="relative">
        <Search className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          type="search"
          placeholder={ar ? "ابحثي عن منتج..." : "Search products..."}
          aria-label={ar ? "بحث" : "Search"}
          className="w-full rounded-full border border-border bg-card ps-9 pe-9 py-2 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/15 transition"
        />
        {q && (
          <button
            type="button"
            onClick={() => {
              setQ("");
              setOpen(false);
            }}
            className="absolute end-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full flex items-center justify-center hover:bg-secondary"
            aria-label={ar ? "مسح" : "Clear"}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </form>

      {open && term.length > 0 && (
        <div className="absolute z-50 mt-2 w-full rounded-2xl border border-border bg-background shadow-xl overflow-hidden">
          {matches.length === 0 ? (
            <p className="px-4 py-4 text-sm text-muted-foreground">
              {ar ? "لا توجد نتائج" : "No products found"}
            </p>
          ) : (
            <ul className="max-h-80 overflow-auto">
              {matches.map((p) => (
                <li key={p.id}>
                  <Link
                    to="/products/$id"
                    params={{ id: p.id }}
                    onClick={() => {
                      setOpen(false);
                      setQ("");
                      onNavigate?.();
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-secondary transition"
                  >
                    {p.image && (
                      <img src={p.image} alt="" loading="lazy" className="h-10 w-10 rounded-lg object-cover shrink-0" />
                    )}
                    <span className="min-w-0">
                      <span className="block truncate text-sm">{ar && p.nameAr ? p.nameAr : p.nameEn}</span>
                      <span className="block truncate text-xs text-muted-foreground">{p.brand}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {term && (
            <button
              onClick={() => submit()}
              className="w-full border-t border-border px-4 py-2.5 text-sm text-primary hover:bg-secondary transition text-start"
            >
              {ar ? `عرض كل النتائج عن "${q.trim()}"` : `See all results for "${q.trim()}"`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
