import { createFileRoute, Link } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useStore, priceOf } from "@/lib/store";
import { useI18n, formatEGP } from "@/lib/i18n";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { OrderStatus, Product, Availability } from "@/lib/types";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { fetchOrders, friendlyError, setOrderStatus, removeOrder, receiptUrl, type DbOrder } from "@/lib/orders";
import { Pencil, Trash2, Plus, LogOut, Settings as Cog, MessageCircle, Check, X, ClipboardList, Upload, Image as ImageIcon, Receipt } from "lucide-react";
import { toast } from "sonner";
import { ShippingPanel } from "@/components/ShippingPanel";
import { BrandsPanel } from "@/components/BrandsPanel";
import { useBrands } from "@/hooks/useBrands";
import { ChangePasswordPanel } from "@/components/ChangePasswordPanel";
import { uploadProductImage } from "@/lib/product-images";



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
  const { session, isAdmin, loading, signOut } = useAdminAuth();
  const ar = lang === "ar";


  if (loading) {
    return (
      <Layout>
        <div className="mx-auto max-w-md px-4 py-24 text-center text-sm text-muted-foreground">
          {ar ? "جارٍ التحميل..." : "Loading…"}
        </div>
      </Layout>
    );
  }

  if (!session) {
    return (
      <Layout>
        <section className="mx-auto max-w-md px-4 py-20 text-center">
          <h1 className="font-serif text-3xl mb-4">{t("admin_login")}</h1>
          <p className="text-sm text-muted-foreground mb-6">
            {ar
              ? "سجّل الدخول بحساب الإدارة للوصول إلى لوحة التحكم."
              : "Sign in with your admin account to open the dashboard."}
          </p>
          <Link
            to="/auth"
            className="inline-block rounded-full bg-primary text-primary-foreground px-6 py-3 text-sm font-medium hover:bg-primary/90 transition active:scale-[0.99]"
          >
            {t("login")}
          </Link>
        </section>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout>
        <section className="mx-auto max-w-md px-4 py-20 text-center">
          <h1 className="font-serif text-3xl mb-4">{ar ? "غير مصرح" : "Not authorised"}</h1>
          <p className="text-sm text-muted-foreground mb-6">
            {ar
              ? "هذا الحساب ليس لديه صلاحية الإدارة."
              : "This account does not have admin access."}
          </p>
          <button
            onClick={signOut}
            className="rounded-full border border-border px-6 py-3 text-sm hover:bg-secondary"
          >
            {t("logout")}
          </button>
        </section>
      </Layout>
    );
  }


  return <AdminDashboard signOut={signOut} />;
}

type TabKey = "products" | "orders" | "confirmed" | "bundle" | "shipping" | "settings";

function AdminDashboard({ signOut }: { signOut: () => void | Promise<void> }) {
  const { t, lang } = useI18n();
  const ar = lang === "ar";
  const [tab, setTab] = useState<TabKey>("products");

  const tabs: { key: TabKey; label: string }[] = [
    { key: "products", label: ar ? "المنتجات" : "Products" },
    { key: "orders", label: ar ? "الأوردرات" : "Orders" },
    { key: "confirmed", label: ar ? "الأوردرات المتأكدة" : "Confirmed orders" },
    { key: "bundle", label: ar ? "تجميع المنتجات" : "Product picking" },
    { key: "shipping", label: ar ? "الشحن" : "Shipping" },
    { key: "settings", label: t("settings") },
  ];

  return (
    <Layout>
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 mb-6 sm:flex sm:flex-wrap sm:justify-between">
          <h1 className="truncate font-serif text-2xl sm:text-4xl">{t("nav_admin")}</h1>
          <div className="flex shrink-0 gap-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:bg-secondary"
            >
              {ar ? "العودة للمتجر" : "Back to store"}
            </Link>
            <button
              onClick={() => void signOut()}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:bg-secondary"
            >
              <LogOut className="h-4 w-4" /> {t("logout")}
            </button>
          </div>
        </header>

        <nav className="mb-8 -mx-4 sm:mx-0 overflow-x-auto border-b border-border">
          <div className="flex min-w-max gap-1 px-4 sm:px-0">
            {tabs.map((x) => (
              <button
                key={x.key}
                onClick={() => setTab(x.key)}
                className={`whitespace-nowrap px-4 py-3 text-sm transition-colors border-b-2 -mb-px ${
                  tab === x.key
                    ? "border-primary text-foreground font-medium"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {x.label}
              </button>
            ))}
          </div>
        </nav>

        {tab === "products" && <ProductsPanel />}
        {tab === "orders" && <OrdersPanel />}
        {tab === "confirmed" && <OrdersPanel fixedStatus="confirmed" />}
        {tab === "bundle" && (
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
            {ar ? "صفحة تجميع المنتجات قيد التنفيذ." : "Product picking page coming next."}
          </div>
        )}
        {tab === "shipping" && (
          <>
            <ShippingPanel />
            <BrandsPanel />
          </>
        )}
        {tab === "settings" && <SettingsPanel />}
      </section>
    </Layout>
  );
}

function SettingsPanel() {
  const { t, lang } = useI18n();
  const { settings, updateSettings } = useStore();
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
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
        <ChangePasswordPanel />
        <WhatsAppPreview />
      </div>
      <FeedbackPanel />
    </div>
  );
}

function ProductsPanel() {
  const { t, lang } = useI18n();
  const ar = lang === "ar";
  const { products, addProduct, updateProduct, deleteProduct } = useStore();
  const { brands } = useBrands();
  const [editing, setEditing] = useState<Product | null>(null);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [brandId, setBrandId] = useState("all");
  const [stock, setStock] = useState<"all" | "in" | "out">("all");

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of products) {
      const key = (p.category?.en || p.category?.ar || "").trim();
      if (key) map.set(key, ar ? p.category?.ar || key : p.category?.en || key);
    }
    return [...map.entries()];
  }, [products, ar]);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return products.filter((p) => {
      if (
        term &&
        ![p.name.en, p.name.ar, p.brand, p.id].some((v) => (v ?? "").toLowerCase().includes(term))
      )
        return false;
      if (cat !== "all" && (p.category?.en || p.category?.ar || "").trim() !== cat) return false;
      if (brandId !== "all" && (p.brandId ?? "") !== brandId) return false;
      if (stock === "in" && !(p.stock == null || p.stock > 0)) return false;
      if (stock === "out" && !(p.stock != null && p.stock <= 0)) return false;
      return true;
    });
  }, [products, q, cat, brandId, stock]);

  const selCls =
    "mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40";

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 space-y-4">
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {ar ? "بحث بالاسم أو الماركة" : "Search by name or brand"}
          </span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={ar ? "ابحثي..." : "Search…"}
            className={selCls}
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {ar ? "القسم" : "Category"}
            </span>
            <select value={cat} onChange={(e) => setCat(e.target.value)} className={selCls}>
              <option value="all">{ar ? "الكل" : "All"}</option>
              {categories.map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {ar ? "الماركة" : "Brand"}
            </span>
            <select value={brandId} onChange={(e) => setBrandId(e.target.value)} className={selCls}>
              <option value="all">{ar ? "الكل" : "All"}</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {ar ? b.nameAr || b.nameEn : b.nameEn}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {ar ? "المخزون" : "Stock"}
            </span>
            <select value={stock} onChange={(e) => setStock(e.target.value as any)} className={selCls}>
              <option value="all">{ar ? "الكل" : "All"}</option>
              <option value="in">{ar ? "متوفر" : "In stock"}</option>
              <option value="out">{ar ? "غير متوفر" : "Out of stock"}</option>
            </select>
          </label>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">
            {list.length} {ar ? "منتج" : "products"}
          </span>
          <button
            onClick={() => setEditing({ ...EMPTY, id: crypto.randomUUID() })}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> {ar ? "منتج جديد" : "New product"}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50">
            <tr>
              <th className="p-3 text-start">{ar ? "المنتج" : "Product"}</th>
              <th className="p-3 text-start">{ar ? "الماركة" : "Brand"}</th>
              <th className="p-3 text-start">{ar ? "القسم" : "Category"}</th>
              <th className="p-3 text-start">{ar ? "المقاس" : "Size"}</th>
              <th className="p-3 text-start">{ar ? "السعر" : "Price"}</th>
              <th className="p-3 text-start">{ar ? "المخزون" : "Stock"}</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr
                key={p.id}
                className="border-t border-border cursor-pointer hover:bg-secondary/30"
                onClick={() => setEditing(p)}
              >
                <td className="p-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <img
                      src={p.image}
                      alt=""
                      loading="lazy"
                      className="h-12 w-12 shrink-0 rounded-lg bg-secondary/40 object-cover"
                    />
                    <span className="min-w-0 truncate">{p.name[lang] || p.name.en || p.name.ar}</span>
                  </div>
                </td>
                <td className="p-3 text-muted-foreground">{p.brand || "—"}</td>
                <td className="p-3 text-muted-foreground">
                  {(ar ? p.category?.ar || p.category?.en : p.category?.en || p.category?.ar) || "—"}
                </td>
                <td className="p-3 text-muted-foreground">{p.size || "—"}</td>
                <td className="p-3">
                  {p.salePrice ? (
                    <span>
                      <b className="text-primary">{formatEGP(p.salePrice, lang)}</b>{" "}
                      <span className="line-through text-muted-foreground">{formatEGP(p.price, lang)}</span>
                    </span>
                  ) : (
                    formatEGP(p.price, lang)
                  )}
                </td>
                <td className="p-3">{p.stock == null ? "—" : p.stock}</td>
                <td className="p-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => setEditing(p)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-secondary"
                      aria-label={t("edit")}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(ar ? "حذف هذا المنتج؟" : "Delete this product?"))
                          deleteProduct(p.id).catch((e) =>
                            toast.error(e instanceof Error ? e.message : "Could not delete"),
                          );
                      }}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-destructive hover:bg-destructive/10"
                      aria-label={t("delete")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-sm text-muted-foreground">
                  {ar ? "لا توجد منتجات مطابقة." : "No matching products."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <EditorModal
          product={editing}
          onCancel={() => setEditing(null)}
          onSave={async (p) => {
            const exists = products.find((x) => x.id === p.id);
            try {
              if (exists) await updateProduct(p);
              else await addProduct(p);
              toast.success(ar ? "تم الحفظ" : "Saved");
              setEditing(null);
            } catch (e) {
              toast.error(e instanceof Error ? e.message : ar ? "تعذر الحفظ" : "Could not save");
            }
          }}
        />
      )}
    </div>
  );
}


function EditorModal({
  product,
  onSave,
  onCancel,
}: {
  product: Product;
  onSave: (p: Product) => void | Promise<void>;
  onCancel: () => void;
}) {
  const { t, lang } = useI18n();
  const ar = lang === "ar";
  const [p, setP] = useState<Product>(product);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [benEn, setBenEn] = useState(product.benefits.en.join("\n"));
  const [benAr, setBenAr] = useState(product.benefits.ar.join("\n"));
  const { brands } = useBrands();

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card rounded-2xl max-w-2xl w-full my-8 p-6 shadow-2xl">
        <h2 className="font-serif text-2xl mb-4">
          {products_has(product) ? t("edit") : t("add_product")}
        </h2>
        <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          <Row label={t("brand_field")}>
            <select
              value={p.brandId ?? ""}
              onChange={(e) => {
                const b = brands.find((x) => x.id === e.target.value);
                setP({ ...p, brandId: b?.id, brand: b?.nameEn ?? "" });
              }}
              className={inputCls}
            >
              <option value="">—</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nameEn}
                  {b.nameAr && b.nameAr !== b.nameEn ? ` — ${b.nameAr}` : ""}
                </option>
              ))}
            </select>
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
            <div className="space-y-2">
              <input value={p.image} onChange={(e) => setP({ ...p, image: e.target.value })} className={inputCls} />
              <div className="flex items-center gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-border bg-secondary/40 px-3 py-1.5 text-xs font-medium hover:bg-secondary transition-colors">
                  <Upload className="h-3.5 w-3.5" />
                  {uploadingImg ? (ar ? "جارٍ الرفع..." : "Uploading…") : ar ? "رفع صورة" : "Upload image"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingImg}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      e.target.value = "";
                      if (!file) return;
                      setUploadingImg(true);
                      try {
                        const url = await uploadProductImage(file, p.id);
                        setP((prev) => ({ ...prev, image: url }));
                        toast.success(ar ? "تم رفع الصورة" : "Image uploaded");
                      } catch (err: any) {
                        toast.error(err?.message ?? (ar ? "تعذر رفع الصورة" : "Upload failed"));
                      } finally {
                        setUploadingImg(false);
                      }
                    }}
                  />
                </label>
                {p.image ? (
                  <img src={p.image} alt="" className="h-12 w-12 rounded-lg object-cover bg-secondary/40" />
                ) : null}
              </div>
            </div>
          </Row>

          <div className="grid sm:grid-cols-2 gap-3">
            <Row label={ar ? "القسم (EN)" : "Category (EN)"}>
              <input
                value={p.category?.en ?? ""}
                onChange={(e) => setP({ ...p, category: { en: e.target.value, ar: p.category?.ar ?? "" } })}
                className={inputCls}
              />
            </Row>
            <Row label={ar ? "القسم (AR)" : "Category (AR)"}>
              <input
                value={p.category?.ar ?? ""}
                onChange={(e) => setP({ ...p, category: { en: p.category?.en ?? "", ar: e.target.value } })}
                className={inputCls}
                dir="rtl"
              />
            </Row>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <Row label={ar ? "المخزون" : "Stock"}>
              <input
                type="number"
                value={p.stock ?? ""}
                onChange={(e) => setP({ ...p, stock: e.target.value === "" ? undefined : Number(e.target.value) })}
                className={inputCls}
              />
            </Row>
            <Row label={ar ? "المقاس / الحجم" : "Size / Volume"}>
              <input value={p.size ?? ""} onChange={(e) => setP({ ...p, size: e.target.value })} className={inputCls} />
            </Row>
          </div>

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
          <Row label={t("usage_en")}>
            <textarea value={p.usage?.en ?? ""} onChange={(e) => setP({ ...p, usage: { en: e.target.value, ar: p.usage?.ar ?? "" } })} className={inputCls} rows={3} />
          </Row>
          <Row label={t("usage_ar")}>
            <textarea value={p.usage?.ar ?? ""} onChange={(e) => setP({ ...p, usage: { en: p.usage?.en ?? "", ar: e.target.value } })} className={inputCls} rows={3} dir="rtl" />
          </Row>
          <Row label={t("ingredients_en")}>
            <textarea value={p.ingredients?.en ?? ""} onChange={(e) => setP({ ...p, ingredients: { en: e.target.value, ar: p.ingredients?.ar ?? "" } })} className={inputCls} rows={3} />
          </Row>
          <Row label={t("ingredients_ar")}>
            <textarea value={p.ingredients?.ar ?? ""} onChange={(e) => setP({ ...p, ingredients: { en: p.ingredients?.en ?? "", ar: e.target.value } })} className={inputCls} rows={3} dir="rtl" />
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

function WhatsAppPreview() {
  const { t, lang } = useI18n();
  const { cart, products, settings } = useStore();

  const sampleItems = useMemo(() => {
    const cartResolved = cart
      .map((i) => ({ item: i, product: products.find((p) => p.id === i.productId) }))
      .filter((x) => x.product) as { item: { productId: string; quantity: number }; product: Product }[];
    if (cartResolved.length > 0) return { items: cartResolved, isSample: false };
    const demo = products.slice(0, 2);
    return {
      items: demo.map((product) => ({ item: { productId: product.id, quantity: 1 }, product })),
      isSample: true,
    };
  }, [cart, products]);

  const sampleCustomer = sampleItems.isSample
    ? { name: lang === "ar" ? "أحمد محمد" : "Ahmed Mohamed", phone: "01012345678", address: lang === "ar" ? "١٢ شارع النيل" : "12 Nile St", city: lang === "ar" ? "القاهرة" : "Cairo" }
    : { name: lang === "ar" ? "اسم العميل" : "Customer name", phone: lang === "ar" ? "هاتف العميل" : "Customer phone", address: lang === "ar" ? "عنوان العميل" : "Customer address", city: lang === "ar" ? "المدينة" : "City" };

  const subtotal = sampleItems.items.reduce((s, { item, product }) => s + priceOf(product) * item.quantity, 0);
  const deposit = subtotal / 2;

  const L = lang;
  const header = L === "ar" ? `طلب جديد من فلورا ستور\n---\n` : `New Order — Flora Store\n---\n`;
  const cust = L === "ar"
    ? `الاسم: ${sampleCustomer.name}\nالهاتف: ${sampleCustomer.phone}\nالعنوان: ${sampleCustomer.address}, ${sampleCustomer.city}\n\nالمنتجات:\n`
    : `Name: ${sampleCustomer.name}\nPhone: ${sampleCustomer.phone}\nAddress: ${sampleCustomer.address}, ${sampleCustomer.city}\n\nItems:\n`;
  const lines = sampleItems.items
    .map(({ item, product }) => `• ${product.name[L]} × ${item.quantity} — ${formatEGP(priceOf(product) * item.quantity, L)}`)
    .join("\n");
  const totals = L === "ar"
    ? `\n\nالإجمالي: ${formatEGP(subtotal, L)}\nالمقدم المطلوب (٥٠٪): ${formatEGP(deposit, L)}\n\nيرجى تحويل ${formatEGP(deposit, L)} على فودافون كاش: ${settings.vodafoneCash}\nومن ثم إرفاق صورة إيصال التحويل هنا.`
    : `\n\nTotal: ${formatEGP(subtotal, L)}\n50% Deposit Required: ${formatEGP(deposit, L)}\n\nPlease transfer ${formatEGP(deposit, L)} via Vodafone Cash to: ${settings.vodafoneCash}\nThen attach the payment screenshot here.`;

  const message = header + cust + lines + totals;
  const waUrl = `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(message)}`;

  return (
    <div className="mt-4 rounded-2xl border border-primary/30 bg-primary/5 p-4">
      <div className="flex items-center gap-2 mb-2">
        <MessageCircle className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">{t("wa_preview")}</span>
      </div>
      <p className="text-xs text-muted-foreground mb-3">{t("wa_preview_hint")}</p>
      <pre className="whitespace-pre-wrap rounded-xl bg-background border border-border p-3 text-xs leading-relaxed font-sans max-h-80 overflow-y-auto" dir={lang === "ar" ? "rtl" : "ltr"}>
{message}
      </pre>
      <a
        href={waUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-600 text-white px-4 py-2 text-xs font-medium hover:bg-emerald-700"
      >
        <MessageCircle className="h-3.5 w-3.5" />
        Test send to WhatsApp
      </a>
    </div>
  );
}

function statusStyle(status: OrderStatus) {
  switch (status) {
    case "pending":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "confirmed":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "cancelled":
      return "bg-rose-100 text-rose-800 border-rose-200";
  }
}

const PAGE_SIZE = 20;

function OrdersPanel() {
  const { t, lang } = useI18n();
  const ar = lang === "ar";
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchOrders({ page, pageSize: PAGE_SIZE, status });
      setOrders(res.orders);
      setTotal(res.total);
    } catch (err) {
      setError(friendlyError(err, ar));
    } finally {
      setLoading(false);
    }
  }, [page, status, ar]);

  useEffect(() => {
    void load();
  }, [load]);

  const statusLabel = (s: OrderStatus) =>
    s === "pending" ? t("status_pending") : s === "confirmed" ? t("status_confirmed") : t("status_cancelled");

  const changeStatus = async (id: string, next: OrderStatus) => {
    const prev = orders;
    setOrders((list) => list.map((o) => (o.id === id ? { ...o, status: next } : o)));
    try {
      await setOrderStatus(id, next);
      toast.success(statusLabel(next));
    } catch (err) {
      setOrders(prev);
      toast.error(friendlyError(err, ar));
    }
  };

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const filters: { key: OrderStatus | "all"; label: string }[] = [
    { key: "all", label: ar ? "الكل" : "All" },
    { key: "pending", label: t("status_pending") },
    { key: "confirmed", label: t("status_confirmed") },
    { key: "cancelled", label: t("status_cancelled") },
  ];

  return (
    <div className="mb-8 rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <ClipboardList className="h-5 w-5 text-primary" />
        <h2 className="font-serif text-xl">{t("orders")}</h2>
        <span className="ml-auto text-xs text-muted-foreground">{total}</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => {
              setPage(0);
              setStatus(f.key);
            }}
            className={`rounded-full border px-3 py-1.5 text-xs transition ${
              status === f.key ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-secondary"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3 py-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-secondary/50 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="py-8 text-center">
          <p className="text-sm text-muted-foreground">{error}</p>
          <button
            type="button"
            onClick={() => void load()}
            className="mt-3 rounded-full border border-border px-4 py-1.5 text-xs hover:bg-secondary"
          >
            {ar ? "إعادة المحاولة" : "Retry"}
          </button>
        </div>
      ) : orders.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">{t("no_orders")}</p>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <OrderCard
              key={o.id}
              order={o}
              lang={lang}
              statusLabel={statusLabel(o.status)}
              onConfirm={() => void changeStatus(o.id, "confirmed")}
              onCancel={() => void changeStatus(o.id, "cancelled")}
              onDelete={() => {
                if (!confirm(t("delete_order"))) return;
                void removeOrder(o.id, o.receiptPath)
                  .then(() => {
                    setOrders((list) => list.filter((x) => x.id !== o.id));
                    setTotal((n) => Math.max(0, n - 1));
                  })
                  .catch((err) => toast.error(friendlyError(err, ar)));
              }}
              t={t}
            />
          ))}
        </div>
      )}

      {!loading && !error && total > PAGE_SIZE && (
        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="rounded-full border border-border px-4 py-1.5 text-xs disabled:opacity-40 hover:bg-secondary"
          >
            {ar ? "السابق" : "Previous"}
          </button>
          <span className="text-xs text-muted-foreground">
            {page + 1} / {pageCount}
          </span>
          <button
            type="button"
            disabled={page + 1 >= pageCount}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-full border border-border px-4 py-1.5 text-xs disabled:opacity-40 hover:bg-secondary"
          >
            {ar ? "التالي" : "Next"}
          </button>
        </div>
      )}
    </div>
  );
}


function ReceiptLink({ path, lang }: { path: string | null; lang: "en" | "ar" }) {
  const [url, setUrl] = useState<string | null>(null);
  const ar = lang === "ar";

  useEffect(() => {
    if (!path) return;
    void receiptUrl(path).then(setUrl);
  }, [path]);

  if (!path) {
    return (
      <p className="mt-4 text-xs text-muted-foreground">
        {ar ? "لم يتم إرفاق إيصال تحويل." : "No payment receipt attached."}
      </p>
    );
  }

  return (
    <a
      href={url ?? undefined}
      target="_blank"
      rel="noreferrer"
      className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs hover:bg-secondary"
    >
      <Receipt className="h-3.5 w-3.5" />
      {ar ? "عرض إيصال التحويل" : "View payment receipt"}
    </a>
  );
}


function OrderCard({
  order,
  lang,
  statusLabel,
  onConfirm,
  onCancel,
  onDelete,
  t,
}: {
  order: DbOrder;
  lang: "en" | "ar";
  statusLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  onDelete: () => void;
  t: (k: any) => string;
}) {
  const date = new Date(order.createdAt).toLocaleString(lang === "ar" ? "ar-EG" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs text-muted-foreground">#{order.orderNumber ?? order.id.slice(0, 8)}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${statusStyle(order.status)}`}>
              {statusLabel}
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">{date}</div>
        </div>
        <div className="text-end">
          <div className="text-xs text-muted-foreground">{t("total")}</div>
          <div className="font-semibold text-primary">
            {formatEGP(order.total || order.subtotal, lang)}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {lang === "ar" ? "الشحن" : "Shipping"}: {formatEGP(order.shippingFee, lang)}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {t("deposit_50")}: {formatEGP(order.deposit, lang)}
          </div>
        </div>

      </div>

      <div className="grid sm:grid-cols-2 gap-4 mt-4 text-sm">
        <div>
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
            {t("customer")}
          </div>
          <div>{order.customer.name}</div>
          <div className="text-muted-foreground">{order.customer.phone}</div>
          <div className="text-muted-foreground">{order.customer.altPhone}</div>
          <div className="text-muted-foreground">
            {order.customer.governorate} — {order.customer.address}
          </div>
        </div>
        <div>
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
            {t("view_products")}
          </div>
          <ul className="space-y-1">
            {order.items.map((it) => (
              <li key={it.productId} className="flex justify-between gap-2">
                <span className="line-clamp-1">
                  {(lang === "ar" ? it.nameAr : it.nameEn) || it.nameEn} × {it.quantity}
                </span>
                <span className="text-muted-foreground shrink-0">
                  {formatEGP(it.unitPrice * it.quantity, lang)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <ReceiptLink path={order.receiptPath} lang={lang} />



      <div className="flex flex-wrap gap-2 mt-4">
        <button
          onClick={onConfirm}
          disabled={order.status === "confirmed"}
          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 text-white px-4 py-2 text-xs font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check className="h-3.5 w-3.5" /> {t("confirm_order_btn")}
        </button>
        <button
          onClick={onCancel}
          disabled={order.status === "cancelled"}
          className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 text-white px-4 py-2 text-xs font-medium hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X className="h-3.5 w-3.5" /> {t("cancel_order_btn")}
        </button>
        <button
          onClick={onDelete}
          className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-2 text-xs hover:bg-secondary text-muted-foreground"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function FeedbackPanel() {
  const { t, lang } = useI18n();
  const { feedbackImages, addFeedbackImage, removeFeedbackImage } = useStore();
  const ar = lang === "ar";

  const onFiles = async (files: FileList | null) => {
    if (!files) return;
    const list = Array.from(files);
    let added = 0;
    for (const f of list) {
      if (!f.type.startsWith("image/")) continue;
      if (f.size > 3 * 1024 * 1024) {
        toast.error(ar ? `${f.name}: أكبر من 3MB` : `${f.name}: larger than 3MB`);
        continue;
      }
      try {
        const dataUrl: string = await new Promise((res, rej) => {
          const r = new FileReader();
          r.onload = () => res(String(r.result));
          r.onerror = () => rej(r.error);
          r.readAsDataURL(f);
        });
        addFeedbackImage(dataUrl);
        added++;
      } catch {
        toast.error(ar ? "فشل قراءة الملف" : "Failed to read file");
      }
    }
    if (added > 0) toast.success(ar ? `تم رفع ${added}` : `Uploaded ${added}`);
  };

  return (
    <div className="mb-8 rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-2 mb-2">
        <ImageIcon className="h-5 w-5 text-primary" />
        <h2 className="font-serif text-xl">{t("feedback_manager")}</h2>
        <span className="ml-auto text-xs text-muted-foreground">{feedbackImages.length}</span>
      </div>
      <p className="text-xs text-muted-foreground mb-4">{t("upload_hint")}</p>

      <label className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-secondary/30 py-6 px-4 text-sm text-muted-foreground cursor-pointer hover:bg-secondary/60 hover:border-primary/40 transition">
        <Upload className="h-4 w-4" />
        {t("upload_feedback")}
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            onFiles(e.target.files);
            e.currentTarget.value = "";
          }}
        />
      </label>

      {feedbackImages.length > 0 && (
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {feedbackImages.map((src, i) => (
            <div key={i} className="relative group rounded-xl overflow-hidden border border-border bg-secondary/30">
              <img src={src} alt="" loading="lazy" decoding="async" className="w-full h-40 object-cover" />
              <button
                onClick={() => {
                  if (confirm(ar ? "حذف الصورة؟" : "Delete image?")) removeFeedbackImage(src);
                }}
                className="absolute top-2 end-2 h-8 w-8 rounded-full bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition inline-flex items-center justify-center hover:bg-rose-700"
                aria-label="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
