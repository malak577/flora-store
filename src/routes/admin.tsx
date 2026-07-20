import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useStore, priceOf } from "@/lib/store";
import { useI18n, formatEGP } from "@/lib/i18n";
import { useMemo, useState } from "react";
import type { Order, OrderStatus, Product, Availability } from "@/lib/types";
import { Pencil, Trash2, Plus, LogOut, Settings as Cog, MessageCircle, Check, X, ClipboardList, Upload, Image as ImageIcon } from "lucide-react";
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
              Admin password: <code className="font-mono font-semibold text-foreground">admin123</code> — you can change it in Settings.
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

        <OrdersPanel />

        <FeedbackPanel />





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
          <Row label={t("usage_en")}>
            <textarea value={p.usage?.en ?? ""} onChange={(e) => setP({ ...p, usage: { en: e.target.value, ar: p.usage?.ar ?? "" } })} className={inputCls} rows={3} />
          </Row>
          <Row label={t("usage_ar")}>
            <textarea value={p.usage?.ar ?? ""} onChange={(e) => setP({ ...p, usage: { en: p.usage?.en ?? "", ar: e.target.value } })} className={inputCls} rows={3} dir="rtl" />
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

function OrdersPanel() {
  const { t, lang } = useI18n();
  const { orders, updateOrderStatus, deleteOrder } = useStore();

  const statusLabel = (s: OrderStatus) =>
    s === "pending" ? t("status_pending") : s === "confirmed" ? t("status_confirmed") : t("status_cancelled");

  return (
    <div className="mb-8 rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-2 mb-5">
        <ClipboardList className="h-5 w-5 text-primary" />
        <h2 className="font-serif text-xl">{t("orders")}</h2>
        <span className="ml-auto text-xs text-muted-foreground">{orders.length}</span>
      </div>

      {orders.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">{t("no_orders")}</p>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <OrderCard
              key={o.id}
              order={o}
              lang={lang}
              statusLabel={statusLabel(o.status)}
              onConfirm={() => {
                updateOrderStatus(o.id, "confirmed");
                toast.success(t("status_confirmed"));
              }}
              onCancel={() => {
                updateOrderStatus(o.id, "cancelled");
                toast.success(t("status_cancelled"));
              }}
              onDelete={() => {
                if (confirm(t("delete_order"))) deleteOrder(o.id);
              }}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
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
  order: Order;
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
            <span className="font-mono text-xs text-muted-foreground">#{order.id.slice(0, 8)}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${statusStyle(order.status)}`}>
              {statusLabel}
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">{date}</div>
        </div>
        <div className="text-end">
          <div className="text-xs text-muted-foreground">{t("total")}</div>
          <div className="font-semibold text-primary">{formatEGP(order.subtotal, lang)}</div>
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
