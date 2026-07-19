import { useI18n } from "@/lib/i18n";
import { Rating } from "./Rating";
import { FadeIn } from "./FadeIn";

export function Testimonials() {
  const { lang } = useI18n();
  const items = [
    {
      name: { en: "Nour Hassan", ar: "نور حسن" },
      city: { en: "Cairo", ar: "القاهرة" },
      text: {
        en: "Genuine products and unbelievably fast delivery. My skin has never looked better.",
        ar: "منتجات أصلية وتوصيل سريع جداً. بشرتي أصبحت أفضل بكثير.",
      },
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop",
      rating: 5,
    },
    {
      name: { en: "Youssef Adel", ar: "يوسف عادل" },
      city: { en: "Alexandria", ar: "الإسكندرية" },
      text: {
        en: "Bought CeraVe & The Ordinary — 100% authentic. Support answered on WhatsApp within minutes.",
        ar: "اشتريت سيرافي وذا أورديناري — أصلية ١٠٠٪. الدعم رد على واتساب في دقايق.",
      },
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop",
      rating: 5,
    },
    {
      name: { en: "Malak Ibrahim", ar: "ملك إبراهيم" },
      city: { en: "Giza", ar: "الجيزة" },
      text: {
        en: "The best skincare store in Egypt. Elegant packaging and honest prices.",
        ar: "أفضل متجر عناية بالبشرة في مصر. تغليف أنيق وأسعار صادقة.",
      },
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop",
      rating: 4.5,
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
      <FadeIn>
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-primary font-medium">
            {lang === "ar" ? "آراء عميلاتنا" : "Loved by Customers"}
          </p>
          <h2 className="mt-3 font-serif text-3xl sm:text-4xl text-charcoal">
            {lang === "ar" ? "قصص حقيقية، نتائج حقيقية" : "Real Stories, Real Results"}
          </h2>
        </div>
      </FadeIn>
      <div className="grid md:grid-cols-3 gap-5">
        {items.map((it, i) => (
          <FadeIn key={i} delay={i * 100}>
            <figure className="h-full rounded-2xl border border-border bg-card p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <Rating value={it.rating} showCount={false} />
              <blockquote className="mt-4 text-sm leading-relaxed text-charcoal/85">
                "{it.text[lang]}"
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <img src={it.avatar} alt="" className="h-11 w-11 rounded-full object-cover" loading="lazy" />
                <div>
                  <p className="text-sm font-medium">{it.name[lang]}</p>
                  <p className="text-xs text-muted-foreground">{it.city[lang]}</p>
                </div>
              </figcaption>
            </figure>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
