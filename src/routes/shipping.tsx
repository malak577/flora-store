import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/shipping")({
  head: () => ({ meta: [{ title: "Shipping & Returns — Flora Store" }, { name: "description", content: "Shipping timelines, delivery fees, and returns policy for Flora Store." }] }),
  component: Shipping,
});

function Shipping() {
  const { lang } = useI18n();
  const ar = lang === "ar";

  const termsAr = [
    "يرجى مراجعة الأوردر فور استلامه، وفي حالة وجود أي خطأ أو مشكلة يجب التواصل معنا خلال 24 ساعة من الاستلام، وبعدها لا يمكن استقبال أو معالجة أي شكوى متعلقة بالأوردر.",
    "الاسترجاع أو الاستبدال متاح فقط في حالة وجود خطأ بالأوردر.",
    "الديبوزت غير قابل للاسترداد في حالة عدم استلام الأوردر.",
    "لا يمكن إلغاء الأوردر بعد تحويل الديبوزت.",
    "غير مسموح باستلام جزء من الأوردر.",
    "غير مسموح بفتح الشحنة عند الاستلام.",
    "في حالة وجود أي مشكلة بالتوصيل يرجى التواصل معنا أو مع خدمة عملاء بوسطة للشحن.",
  ];

  const termsEn = [
    "Please review your order immediately upon receipt. If there is any error or issue, contact us within 24 hours of receipt; after that, no complaints related to the order can be received or processed.",
    "Returns or exchanges are only available if there is an error with the order.",
    "The deposit is non-refundable if the order is not received.",
    "The order cannot be cancelled after the deposit has been transferred.",
    "Partial receipt of the order is not allowed.",
    "Opening the shipment upon delivery is not allowed.",
    "If there is any delivery issue, please contact us or Bosta shipping customer service.",
  ];

  const terms = ar ? termsAr : termsEn;

  return (
    <Layout>
      <article className="mx-auto max-w-3xl px-4 sm:px-6 py-12 sm:py-16">
        <p className="text-xs uppercase tracking-[0.3em] text-primary font-medium text-center">
          {ar ? "الشحن والإرجاع" : "Shipping & Return Policy"}
        </p>
        <h1 className="mt-3 text-center font-display text-3xl sm:text-4xl text-charcoal">
          {ar ? "الشحن والإرجاع" : "Shipping & Return Policy"}
        </h1>

        <div className="mt-8 sm:mt-10 rounded-2xl border border-cream-200 bg-cream-50/60 p-5 sm:p-8">
          <p className="mb-4 flex items-start gap-2 font-medium text-amber-700">
            <span className="text-lg">⚠️</span>
            <span>{ar ? "يرجى قراءة الشروط جيدًا:" : "Please read the terms carefully:"}</span>
          </p>
          <ul className="space-y-4">
            {terms.map((term, idx) => (
              <li key={idx} className="flex items-start gap-3 text-[15px] leading-relaxed text-charcoal/90">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>{term}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 rounded-2xl border border-cream-200 bg-cream-50/60 p-5 sm:p-8">
          <p className="mb-4 flex items-center gap-2 font-medium text-charcoal">
            <span className="text-lg">🚚</span>
            <span>{ar ? "مدة التوصيل:" : "Delivery time:"}</span>
          </p>
          <ul className="space-y-3">
            <li className="flex items-start gap-3 text-[15px] leading-relaxed text-charcoal/90">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>{ar ? "الأوردر الفوري: خلال أسبوع." : "Instant order: within one week."}</span>
            </li>
            <li className="flex items-start gap-3 text-[15px] leading-relaxed text-charcoal/90">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>{ar ? "الأوردر المخصوص: من 15 إلى 20 يومًا (وقد تصل قبل ذلك)." : "Pre-order: 15 to 20 days (may arrive earlier)."}</span>
            </li>
          </ul>
        </div>

        <p className="mt-8 text-center text-lg font-medium text-charcoal/90">
          <span className="mr-2">💖</span>
          {ar ? "شكرًا لثقتكم بـ فلورا استور" : "Thank you for trusting Flora Store"}
        </p>
      </article>
    </Layout>
  );
}
