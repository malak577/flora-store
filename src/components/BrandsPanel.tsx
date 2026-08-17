import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Check, X, Tag } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useBrands } from "@/hooks/useBrands";
import { createBrand, deleteBrand, updateBrand } from "@/lib/brands";

const inputCls =
  "w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

export function BrandsPanel() {
  const { lang } = useI18n();
  const ar = lang === "ar";
  const { brands, loading, error, refresh } = useBrands();
  const [open, setOpen] = useState(false);
  const [newEn, setNewEn] = useState("");
  const [newAr, setNewAr] = useState("");
  const [busy, setBusy] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editEn, setEditEn] = useState("");
  const [editAr, setEditAr] = useState("");

  async function add() {
    if (!newEn.trim()) {
      toast.error(ar ? "أدخل اسم الماركة بالإنجليزية" : "Enter the English brand name");
      return;
    }
    setBusy(true);
    try {
      await createBrand(newEn, newAr || newEn);
      setNewEn("");
      setNewAr("");
      await refresh();
      toast.success(ar ? "تمت إضافة الماركة" : "Brand added");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add brand");
    } finally {
      setBusy(false);
    }
  }

  async function save(id: string) {
    setBusy(true);
    try {
      await updateBrand(id, { nameEn: editEn, nameAr: editAr });
      setEditId(null);
      await refresh();
      toast.success(ar ? "تم الحفظ" : "Saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save brand");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm(ar ? "حذف هذه الماركة؟" : "Delete this brand?")) return;
    setBusy(true);
    try {
      await deleteBrand(id);
      await refresh();
      toast.success(ar ? "تم الحذف" : "Brand deleted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete brand");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mb-8 rounded-2xl border border-border bg-card">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 p-5 text-start"
      >
        <span className="flex items-center gap-2 font-serif text-xl">
          <Tag className="h-5 w-5 text-primary" />
          {ar ? "الماركات" : "Brands"}
          <span className="text-xs text-muted-foreground">({brands.length})</span>
        </span>
        <span className="text-sm text-muted-foreground">{open ? (ar ? "إخفاء" : "Hide") : (ar ? "إدارة" : "Manage")}</span>
      </button>

      {open && (
        <div className="border-t border-border p-5 space-y-4">
          <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <input
              value={newEn}
              onChange={(e) => setNewEn(e.target.value)}
              placeholder={ar ? "الاسم بالإنجليزية" : "Name (English)"}
              className={inputCls}
            />
            <input
              value={newAr}
              onChange={(e) => setNewAr(e.target.value)}
              placeholder={ar ? "الاسم بالعربية" : "Name (Arabic)"}
              dir="rtl"
              className={inputCls}
            />
            <button
              onClick={add}
              disabled={busy}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 active:scale-95 transition disabled:opacity-60"
            >
              <Plus className="h-4 w-4" /> {ar ? "إضافة" : "Add"}
            </button>
          </div>

          {loading && <p className="text-sm text-muted-foreground">{ar ? "جارٍ التحميل..." : "Loading…"}</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="grid gap-2 sm:grid-cols-2">
            {brands.map((b) => (
              <div
                key={b.id}
                className="rounded-xl border border-border p-3 flex items-center gap-2"
              >
                {editId === b.id ? (
                  <>
                    <input value={editEn} onChange={(e) => setEditEn(e.target.value)} className={inputCls} />
                    <input value={editAr} onChange={(e) => setEditAr(e.target.value)} dir="rtl" className={inputCls} />
                    <button onClick={() => save(b.id)} disabled={busy} className="p-2 rounded-lg hover:bg-secondary text-primary">
                      <Check className="h-4 w-4" />
                    </button>
                    <button onClick={() => setEditId(null)} className="p-2 rounded-lg hover:bg-secondary">
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{b.nameEn}</p>
                      <p className="text-xs text-muted-foreground truncate" dir="rtl">{b.nameAr}</p>
                    </div>
                    <button
                      onClick={() => {
                        setEditId(b.id);
                        setEditEn(b.nameEn);
                        setEditAr(b.nameAr);
                      }}
                      className="p-2 rounded-lg hover:bg-secondary"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => remove(b.id)} className="p-2 rounded-lg hover:bg-secondary text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
