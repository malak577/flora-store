import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { FadeIn } from "@/components/FadeIn";
import { useI18n } from "@/lib/i18n";
import { Sparkles, ShieldCheck, Heart } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Flora Store" },
      { name: "description", content: "Flora Store — Egypt's trusted destination for authentic skincare from top global brands." },
    ],
  }),
  component: About,
});

function About() {
  const { lang } = useI18n();
  const ar = lang === "ar";
  return (
    <Layout>
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-16">
        <FadeIn>
          <p className="text-xs uppercase tracking-[0.3em] text-primary font-medium">{ar ? "من نحن" : "About Us"}</p>
          <h1 className="mt-3 font-serif text-4xl sm:text-5xl text-charcoal">
            {ar ? "عناية أصلية. جمال حقيقي." : "Authentic care. Real beauty."}
          </h1>
          <p className="mt-6 text-base sm:text-lg text-muted-foreground leading-relaxed">
            {ar
              ? "فلورا ستور هو وجهتك الموثوقة في مصر للحصول على منتجات العناية بالبشرة الأصلية من أشهر الماركات العالمية. نحن نؤمن أن الجمال يبدأ من بشرة صحية، ولذلك نختار كل منتج بعناية فائقة."
              : "Flora Store is Egypt's trusted destination for authentic skincare from the world's most loved brands. We believe beauty starts with healthy skin — every product we carry is hand-picked and 100% genuine."}
          </p>
        </FadeIn>
        <div className="mt-12 grid sm:grid-cols-3 gap-4">
          {[
            { icon: ShieldCheck, t: ar ? "أصلية ١٠٠٪" : "100% Authentic", d: ar ? "مصادر مباشرة من الموزعين المعتمدين" : "Sourced directly from authorized distributors" },
            { icon: Heart, t: ar ? "خدمة شخصية" : "Personal Service", d: ar ? "دعم عبر واتساب في أي وقت" : "WhatsApp support anytime you need us" },
            { icon: Sparkles, t: ar ? "منتقاة بعناية" : "Curated Selection", d: ar ? "أفضل الماركات فقط" : "Only the brands we truly trust" },
          ].map((v, i) => (
            <FadeIn key={i} delay={i * 100}>
              <div className="rounded-2xl border border-border bg-card p-6 h-full hover:shadow-md hover:-translate-y-1 transition-all">
                <div className="h-11 w-11 rounded-full bg-secondary flex items-center justify-center mb-3">
                  <v.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-serif text-lg">{v.t}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{v.d}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>
    </Layout>
  );
}
