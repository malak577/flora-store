import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useI18n } from "@/lib/i18n";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Lock } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Admin Sign In | Flora Store" },
      {
        name: "description",
        content: "Secure sign-in for Flora Store administrators to manage products and customer orders.",
      },
      { property: "og:title", content: "Admin Sign In | Flora Store" },
      { property: "og:description", content: "Secure sign-in for Flora Store administrators." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { lang } = useI18n();
  const ar = lang === "ar";
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin" });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        if (!data.session) {
          toast.success(ar ? "تحقق من بريدك لتأكيد الحساب." : "Check your email to confirm your account.");
          return;
        }
        navigate({ to: "/admin" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/admin" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Layout>
      <section className="mx-auto max-w-md px-4 py-20">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Lock className="h-5 w-5 text-primary" />
          <h1 className="font-serif text-3xl text-center">
            {ar ? "دخول الإدارة" : "Admin Sign In"}
          </h1>
        </div>
        <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-border bg-card p-6">
          <label className="block">
            <span className="text-sm font-medium">{ar ? "البريد الإلكتروني" : "Email"}</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">{ar ? "كلمة المرور" : "Password"}</span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </label>
          <button
            disabled={busy}
            className="w-full rounded-full bg-primary text-primary-foreground py-3 text-sm font-medium hover:bg-primary/90 disabled:opacity-60 transition active:scale-[0.99]"
          >
            {busy
              ? ar
                ? "جارٍ..."
                : "Please wait…"
              : mode === "signin"
                ? ar
                  ? "تسجيل الدخول"
                  : "Sign in"
                : ar
                  ? "إنشاء حساب"
                  : "Create account"}
          </button>
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="w-full text-xs text-muted-foreground hover:text-foreground"
          >
            {mode === "signin"
              ? ar
                ? "ليس لديك حساب؟ إنشاء حساب"
                : "No account? Create one"
              : ar
                ? "لديك حساب؟ تسجيل الدخول"
                : "Already have an account? Sign in"}
          </button>
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            {ar
              ? "أول حساب يتم إنشاؤه يصبح حساب الإدارة تلقائياً."
              : "The first account created automatically becomes the store admin."}
          </p>
        </form>
      </section>
    </Layout>
  );
}
