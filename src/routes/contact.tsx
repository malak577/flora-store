import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { FadeIn } from "@/components/FadeIn";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { MessageCircle, Phone, MapPin } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Flora Store" },
      { name: "description", content: "Get in touch with Flora Store on WhatsApp for orders, support, and product advice." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const { lang } = useI18n();
  const { settings } = useStore();
  const ar = lang === "ar";
  const wa = `https://wa.me/${settings.whatsapp}`;

  return (
    <Layout>
      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
        <FadeIn>
          <p className="text-xs uppercase tracking-[0.3em] text-primary font-medium">{ar ? "تواصل معنا" : "Contact Us"}</p>
          <h1 className="mt-3 font-serif text-4xl sm:text-5xl text-charcoal">{ar ? "نحن هنا لمساعدتك" : "We're here to help"}</h1>
          <p className="mt-4 text-muted-foreground">{ar ? "تواصل معنا مباشرة على واتساب لأي استفسار أو طلب." : "Reach us directly on WhatsApp for any question or order."}</p>
        </FadeIn>

        <div className="mt-10 grid sm:grid-cols-2 gap-4">
          <a href={wa} target="_blank" rel="noreferrer" className="group rounded-2xl border border-border bg-card p-6 hover:shadow-lg hover:-translate-y-1 transition-all">
            <div className="h-11 w-11 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
              <MessageCircle className="h-5 w-5 text-emerald-700" />
            </div>
            <h3 className="font-serif text-lg">WhatsApp</h3>
            <p className="mt-1 text-sm text-primary font-mono">+{settings.whatsapp}</p>
            <p className="mt-2 text-xs text-muted-foreground">{ar ? "الرد خلال دقائق" : "We reply within minutes"}</p>
          </a>
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="h-11 w-11 rounded-full bg-secondary flex items-center justify-center mb-3">
              <Phone className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-serif text-lg">{ar ? "الاتصال" : "Call"}</h3>
            <p className="mt-1 text-sm font-mono">{settings.vodafoneCash}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 sm:col-span-2">
            <div className="h-11 w-11 rounded-full bg-secondary flex items-center justify-center mb-3">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-serif text-lg">{ar ? "خدمة التوصيل" : "Delivery Coverage"}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{ar ? "نوصل لجميع محافظات مصر خلال ٢-٥ أيام عمل." : "We deliver to all governorates in Egypt within 2–5 business days."}</p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
