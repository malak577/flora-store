import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";

/** Lets the signed-in admin change their own account password. */
export function ChangePasswordPanel() {
  const { lang } = useI18n();
  const ar = lang === "ar";
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    if (pw.length < 8) {
      toast.error(ar ? "كلمة المرور يجب ألا تقل عن ٨ أحرف." : "Password must be at least 8 characters.");
      return;
    }
    if (pw !== confirm) {
      toast.error(ar ? "كلمتا المرور غير متطابقتين." : "Passwords do not match.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setPw("");
    setConfirm("");
    toast.success(ar ? "تم تحديث كلمة المرور بنجاح." : "Password updated successfully.");
  }

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-border bg-background/60 p-5 space-y-3">
      <h3 className="inline-flex items-center gap-2 font-serif text-lg">
        <KeyRound className="h-4 w-4 text-primary" />
        {ar ? "تغيير كلمة المرور" : "Change password"}
      </h3>
      <label className="block">
        <span className="text-sm font-medium">{ar ? "كلمة المرور الجديدة" : "New password"}</span>
        <input
          type="password"
          autoComplete="new-password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium">{ar ? "تأكيد كلمة المرور" : "Confirm password"}</span>
        <input
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm"
        />
      </label>
      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-primary text-primary-foreground px-5 py-2.5 text-sm font-medium hover:bg-primary/90 transition disabled:opacity-60 active:scale-[0.99]"
      >
        {saving ? (ar ? "جارٍ الحفظ..." : "Saving…") : ar ? "تحديث كلمة المرور" : "Update password"}
      </button>
    </form>
  );
}
