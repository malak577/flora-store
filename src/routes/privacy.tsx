import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy — Flora Store" }, { name: "description", content: "How Flora Store collects, uses, and protects your personal information." }] }),
  component: Privacy,
});

function Privacy() {
  const { lang } = useI18n();
  const ar = lang === "ar";
  return (
    <Layout>
      <article className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
        <p className="text-xs uppercase tracking-[0.3em] text-primary font-medium">{ar ? "الخصوصية" : "Privacy"}</p>
        <h1 className="mt-3 font-serif text-4xl text-charcoal">{ar ? "سياسة الخصوصية" : "Privacy Policy"}</h1>
        <div className="mt-8 space-y-5 text-[15px] text-charcoal/85 leading-relaxed">
          <p>{ar ? "نحن نحترم خصوصيتك ونجمع فقط البيانات اللازمة لمعالجة طلبك: الاسم، رقم الهاتف، والعنوان." : "We respect your privacy and collect only the information required to fulfill your order: name, phone number, and address."}</p>
          <p>{ar ? "لا نشارك بياناتك مع أي طرف ثالث بخلاف شركة الشحن المسؤولة عن توصيل طلبك." : "Your data is never shared with third parties other than the courier delivering your order."}</p>
          <p>{ar ? "نستخدم واتساب للتواصل معك بشأن الطلبات والدعم فقط." : "We use WhatsApp solely to communicate with you about orders and support."}</p>
          <p>{ar ? "بياناتك محفوظة بشكل آمن ولك الحق في طلب حذفها في أي وقت." : "Your data is securely stored, and you may request its deletion at any time."}</p>
        </div>
      </article>
    </Layout>
  );
}
