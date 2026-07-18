import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useStore, priceOf } from "@/lib/store";
import { useI18n, formatEGP } from "@/lib/i18n";
import { useMemo, useState } from "react";
import type { Product, Availability } from "@/lib/types";
import { Pencil, Trash2, Plus, LogOut, Settings as Cog, MessageCircle } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  component: Admin,
});

const EMPTY: Product = {
  id: "",
  brand: "",
  name: { en: "", ar: "" },
  description: { en: "", ar: "" },
  benefits: { en: [], ar: [] },
  price: 0,
  image: "",
  availability: "instant",
};

function Admin() {
  const { t, lang } = useI18n();
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    isAdmin,
    loginAdmin,
    logoutAdmin,
    settings,
    updateSettings,
  } = useStore();
  const [pw, setPw] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  if (!isAdmin) {
    return (
      <Layout>
        <section className="mx-auto max-w-md px-4 py-20">
          <h1 className="font-serif text-3xl mb-6 text-center">{t("admin_login")}</h1>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!loginAdmin(pw)) toast.error(t("wrong_password"));
            }}
            className="space-y-4 rounded-2xl border border-border bg-card p-6"
          >
            <label className="block">
              <span className="text-sm font-medium">{t("admin_password")}</span>
              <input
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                autoFocus
              />
            </label>
            <button className="w-full rounded-full bg-primary text-primary-foreground py-3 text-sm font-medium hover:bg-primary/90">
              {t("login")}
            </button>
            <p className="text-xs text-muted-foreground text-center">
              Default: <code className="font-mono">flora2026</code> (change it in Settings)
            </p>
          </form>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <h1 className="font-serif text-3xl sm:text-4xl">{t("nav_admin")}</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowSettings((v) => !v)}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:bg-secondary"
            >
              <Cog className="h-4 w-4" /> {t("settings")}
            </button>
            <button
              onClick={() => setEditing({ ...EMPTY, id: crypto.randomUUID() })}
              className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" /> {t("add_product")}
            </button>
            <button
              onClick={logoutAdmin}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:bg-secondary"
            >
              <LogOut className="h-4 w-4" /> {t("logout")}
            </button>
          </div>
        </div>

        {showSettings && (
          <div className="mb-8 rounded-2xl border border-border bg-card p-6 space-y-4">
            <h2 className="font-serif text-xl">{t("settings")}</h2>
            <label className="block">
              <span className="text-sm font-medium">{t("wa_number")}</span>
              <input
                value={settings.whatsapp}
                onChange={(e) => updateSettings({ whatsapp: e.target.value })}
                placeholder="201234567890"
                className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">{t("vf_number")}</span>
              <input
                value={settings.vodafoneCash}
                onChange={(e) => updateSettings({ vodafoneCash: e.target.value })}
                placeholder="01234567890"
                className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">{t("admin_password")}</span>
              <input
                value={settings.adminPassword}
                onChange={(e) => updateSettings({ adminPassword: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm"
              />
            </label>
            <WhatsAppPreview />
          </div>
        )}

        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-start">
              <tr>
                <th className="p-3 text-start">Image</th>
                <th className="p-3 text-start">Brand</th>
                <th className="p-3 text-start">Name</th>
                <th className="p-3 text-start">Price</th>
                <th className="p-3 text-start">Availability</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="p-3">
                    <img src={p.image} alt="" className="h-12 w-12 rounded-lg object-cover bg-secondary/40" />
                  </td>
                  <td className="p-3 text-muted-foreground">{p.brand}</td>
                  <td className="p-3">{p.name[lang]}</td>
                  <td className="p-3">
                    {p.salePrice ? (
                      <span>
                        <b className="text-primary">{p.salePrice}</b>{" "}
                        <span className="line-through text-muted-foreground">{p.price}</span> EGP
                      </span>
                    ) : (
                      <span>{p.price} EGP</span>
                    )}
                  </td>
                  <td className="p-3 text-xs">
                    {p.availability === "instant" ? t("instant_ship") : t("preorder")}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={() => setEditing(p)}
                        className="h-8 w-8 rounded-full hover:bg-secondary inline-flex items-center justify-center"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Delete this product?")) deleteProduct(p.id);
                        }}
                        className="h-8 w-8 rounded-full hover:bg-destructive/10 text-destructive inline-flex items-center justify-center"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {editing && (
          <EditorModal
            product={editing}
            onCancel={() => setEditing(null)}
            onSave={(p) => {
              const exists = products.find((x) => x.id === p.id);
              if (exists) updateProduct(p);
              else addProduct(p);
              toast.success("Saved");
              setEditing(null);
            }}
          />
        )}
      </section>
    </Layout>
  );
}

function EditorModal({
  product,
  onSave,
  onCancel,
}: {
  product: Product;
  onSave: (p: Product) => void;
  onCancel: () => void;
}) {
  const { t } = useI18n();
  const [p, setP] = useState<Product>(product);
  const [benEn, setBenEn] = useState(product.benefits.en.join("\n"));
  const [benAr, setBenAr] = useState(product.benefits.ar.join("\n"));

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card rounded-2xl max-w-2xl w-full my-8 p-6 shadow-2xl">
        <h2 className="font-serif text-2xl mb-4">
          {products_has(product) ? t("edit") : t("add_product")}
        </h2>
        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          <Row label={t("brand_field")}>
            <input value={p.brand} onChange={(e) => setP({ ...p, brand: e.target.value })} className={inputCls} />
          </Row>
          <div className="grid sm:grid-cols-2 gap-3">
            <Row label={t("name_en")}>
              <input value={p.name.en} onChange={(e) => setP({ ...p, name: { ...p.name, en: e.target.value } })} className={inputCls} />
            </Row>
            <Row label={t("name_ar")}>
              <input value={p.name.ar} onChange={(e) => setP({ ...p, name: { ...p.name, ar: e.target.value } })} className={inputCls} dir="rtl" />
            </Row>
          </div>
          <Row label={t("image_url")}>
            <input value={p.image} onChange={(e) => setP({ ...p, image: e.target.value })} className={inputCls} />
          </Row>
          <div className="grid sm:grid-cols-2 gap-3">
            <Row label={t("price")}>
              <input type="number" value={p.price} onChange={(e) => setP({ ...p, price: Number(e.target.value) })} className={inputCls} />
            </Row>
            <Row label={t("sale_price")}>
              <input
                type="number"
                value={p.salePrice ?? ""}
                onChange={(e) => setP({ ...p, salePrice: e.target.value ? Number(e.target.value) : undefined })}
                className={inputCls}
              />
            </Row>
          </div>
          <Row label={t("availability")}>
            <select
              value={p.availability}
              onChange={(e) => setP({ ...p, availability: e.target.value as Availability })}
              className={inputCls}
            >
              <option value="instant">{t("instant_ship")}</option>
              <option value="preorder">{t("preorder")}</option>
            </select>
          </Row>
          <Row label={t("desc_en")}>
            <textarea value={p.description.en} onChange={(e) => setP({ ...p, description: { ...p.description, en: e.target.value } })} className={inputCls} rows={3} />
          </Row>
          <Row label={t("desc_ar")}>
            <textarea value={p.description.ar} onChange={(e) => setP({ ...p, description: { ...p.description, ar: e.target.value } })} className={inputCls} rows={3} dir="rtl" />
          </Row>
          <Row label={t("benefits_en")}>
            <textarea value={benEn} onChange={(e) => setBenEn(e.target.value)} className={inputCls} rows={4} />
          </Row>
          <Row label={t("benefits_ar")}>
            <textarea value={benAr} onChange={(e) => setBenAr(e.target.value)} className={inputCls} rows={4} dir="rtl" />
          </Row>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-full border border-border px-5 py-2 text-sm hover:bg-secondary">
            {t("cancel")}
          </button>
          <button
            onClick={() =>
              onSave({
                ...p,
                benefits: {
                  en: benEn.split("\n").map((s) => s.trim()).filter(Boolean),
                  ar: benAr.split("\n").map((s) => s.trim()).filter(Boolean),
                },
              })
            }
            className="rounded-full bg-primary text-primary-foreground px-5 py-2 text-sm hover:bg-primary/90"
          >
            {t("save")}
          </button>
        </div>
      </div>
    </div>
  );
}

function products_has(p: Product) {
  // heuristic: an empty brand/name means brand-new; a filled one means editing
  return Boolean(p.brand || p.name.en || p.name.ar);
}

const inputCls =
  "mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
      {children}
    </label>
  );
}
