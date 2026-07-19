import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/Layout";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms & Conditions — Flora Store" }, { name: "description", content: "Terms and conditions governing purchases at Flora Store." }] }),
  component: Terms,
});

function Terms() {
  const { lang } = useI18n();
  const ar = lang === "ar";
  return (
    <Layout>
      <article className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
        <p className="text-xs uppercase tracking-[0.3em] text-primary font-medium">{ar ? "الشروط" : "Terms"}</p>
        <h1 className="mt-3 font-serif text-4xl text-charcoal">{ar ? "الشروط والأحكام" : "Terms & Conditions"}</h1>
        <div className="mt-8 space-y-5 text-[15px] text-charcoal/85 leading-relaxed">
          <p>{ar ? "باستخدامك لمتجر فلورا، فأنت توافق على هذه الشروط." : "By using Flora Store, you agree to these terms."}</p>
          <p>{ar ? "جميع المنتجات المعروضة أصلية ١٠٠٪ ومصادرها من موزعين معتمدين." : "All products are 100% authentic and sourced from authorized distributors."}</p>
          <p>{ar ? "يتطلب تأكيد الطلب دفع ٥٠٪ مقدم عبر فودافون كاش. الطلبات غير المؤكدة يتم إلغاؤها تلقائياً." : "Order confirmation requires a 50% Vodafone Cash deposit. Unconfirmed orders are cancelled automatically."}</p>
          <p>{ar ? "الأسعار بالجنيه المصري وقابلة للتغيير دون إشعار مسبق." : "Prices are in Egyptian Pounds (EGP) and may change without prior notice."}</p>
          <p>{ar ? "نحتفظ بالحق في رفض أي طلب في حالات الاشتباه بالاحتيال." : "We reserve the right to refuse any order in cases of suspected fraud."}</p>
        </div>
      </article>
    </Layout>
  );
}
