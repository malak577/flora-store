import { useEffect, useState } from "react";
import { Truck, Save } from "lucide-react";
import { toast } from "sonner";
import { useI18n, formatEGP } from "@/lib/i18n";
import { fetchShippingRates, updateShippingRate, type ShippingRate } from "@/lib/shipping";
import { friendlyError } from "@/lib/orders";

export function ShippingPanel() {
  const { lang } = useI18n();
  const ar = lang === "ar";
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetchShippingRates()
      .then((r) => {
        if (!alive) return;
        setRates(r);
        setDrafts(Object.fromEntries(r.map((x) => [x.id, String(x.price)])));
      })
      .catch((e) => alive && toast.error(friendlyError(e, ar)))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [ar]);

  async function save(rate: ShippingRate) {
    const value = Number(drafts[rate.id]);
    if (!Number.isFinite(value) || value < 0) {
      toast.error(ar ? "برجاء إدخال سعر صحيح" : "Please enter a valid price");
      return;
    }
    setSavingId(rate.id);
    try {
      await updateShippingRate(rate.id, value);
      setRates((prev) => prev.map((r) => (r.id === rate.id ? { ...r, price: value } : r)));
      toast.success(ar ? "تم حفظ سعر الشحن" : "Shipping price saved");
    } catch (e) {
      toast.error(friendlyError(e, ar));
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="mb-8 rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-1">
        <Truck className="h-5 w-5 text-primary" />
        <h2 className="font-serif text-xl">{ar ? "إعدادات الشحن" : "Shipping Settings"}</h2>
      </div>
      <p className="text-xs text-muted-foreground mb-5">
        {ar
          ? "حدّد سعر الشحن لكل محافظة. يُطبَّق السعر الجديد على الطلبات الجديدة فقط، والطلبات السابقة تحتفظ بسعرها."
          : "Set the delivery price per governorate. New prices apply to new orders only — existing orders keep the price charged at the time."}
      </p>

      {loading ? (
        <p className="text-sm text-muted-foreground">{ar ? "جارٍ التحميل..." : "Loading…"}</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rates.map((r) => {
            const dirty = String(r.price) !== (drafts[r.id] ?? "");
            return (
              <div
                key={r.id}
                className="rounded-xl border border-border bg-background p-3 flex items-center gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{ar ? r.nameAr : r.nameEn}</div>
                  <div className="text-[11px] text-muted-foreground">{formatEGP(r.price, lang)}</div>
                </div>
                <input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="1"
                  value={drafts[r.id] ?? ""}
                  onChange={(e) => setDrafts((d) => ({ ...d, [r.id]: e.target.value }))}
                  className="w-20 shrink-0 rounded-lg border border-input bg-background px-2.5 py-2 text-sm text-end focus:outline-none focus:ring-2 focus:ring-primary/40"
                  aria-label={ar ? `سعر شحن ${r.nameAr}` : `Shipping price for ${r.nameEn}`}
                />
                <button
                  type="button"
                  onClick={() => void save(r)}
                  disabled={!dirty || savingId === r.id}
                  className="shrink-0 inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground h-9 w-9 hover:bg-primary/90 disabled:opacity-40 transition active:scale-95"
                  aria-label={ar ? "حفظ" : "Save"}
                >
                  <Save className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
