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
  return (
    <Layout>
      <article className="mx-auto max-w-3xl px-4 sm:px-6 py-16 prose prose-neutral">
        <p className="text-xs uppercase tracking-[0.3em] text-primary font-medium">{ar ? "الشحن والإرجاع" : "Shipping & Returns"}</p>
        <h1 className="mt-3 font-serif text-4xl text-charcoal">{ar ? "توصيل موثوق لجميع المحافظات" : "Reliable delivery, everywhere in Egypt"}</h1>
        <div className="mt-8 space-y-6 text-[15px] text-charcoal/85 leading-relaxed">
          <section>
            <h2 className="font-serif text-xl">{ar ? "مدة التوصيل" : "Delivery time"}</h2>
            <p>{ar ? "شحن فوري: يصل خلال ٢-٥ أيام عمل داخل مصر. طلب مسبق: يصل خلال ١٥-٢٠ يوم." : "Instant shipping: 2–5 business days within Egypt. Pre-orders: 15–20 days."}</p>
          </section>
          <section>
            <h2 className="font-serif text-xl">{ar ? "رسوم الشحن" : "Shipping fees"}</h2>
            <p>{ar ? "الرسوم تحسب حسب المحافظة ويتم توضيحها عند تأكيد الطلب على واتساب." : "Fees are calculated by governorate and confirmed on WhatsApp when your order is placed."}</p>
          </section>
          <section>
            <h2 className="font-serif text-xl">{ar ? "الدفع" : "Payment"}</h2>
            <p>{ar ? "يتطلب دفع ٥٠٪ مقدم عبر فودافون كاش لتأكيد الطلب، والباقي عند الاستلام." : "A 50% deposit via Vodafone Cash is required to confirm your order. The rest is paid on delivery."}</p>
          </section>
          <section>
            <h2 className="font-serif text-xl">{ar ? "الإرجاع والاستبدال" : "Returns & exchanges"}</h2>
            <p>{ar ? "يمكن استبدال أي منتج خلال ٧ أيام من الاستلام إذا كان مغلقاً وغير مستخدم. للحصول على المساعدة، تواصل معنا على واتساب." : "Unopened, unused items can be exchanged within 7 days of delivery. Contact us on WhatsApp for assistance."}</p>
          </section>
        </div>
      </article>
    </Layout>
  );
}
