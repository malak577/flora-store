import { useRef } from "react";
import { ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { useStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { FadeIn } from "./FadeIn";

export function FeedbackGallery() {
  const { t, lang } = useI18n();
  const { feedbackImages } = useStore();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const ar = lang === "ar";

  const scroll = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const step = Math.min(el.clientWidth * 0.85, 480);
    el.scrollBy({ left: (ar ? -dir : dir) * step, behavior: "smooth" });
  };

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
      <FadeIn>
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-primary font-medium">
            {t("client_feedback")}
          </p>
          <h2 className="mt-3 font-serif text-3xl sm:text-4xl text-charcoal">
            {t("client_feedback_sub")}
          </h2>
        </div>
      </FadeIn>

      {feedbackImages.length === 0 ? (
        <FadeIn>
          <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center text-sm text-muted-foreground flex flex-col items-center gap-3">
            <MessageCircle className="h-8 w-8 text-primary/60" />
            {t("no_feedback_yet")}
          </div>
        </FadeIn>
      ) : (
        <div className="relative">
          <button
            onClick={() => scroll(-1)}
            aria-label="Previous"
            className="hidden md:flex absolute start-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/95 border border-border shadow-md items-center justify-center hover:bg-primary hover:text-primary-foreground transition"
          >
            <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
          </button>
          <button
            onClick={() => scroll(1)}
            aria-label="Next"
            className="hidden md:flex absolute end-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/95 border border-border shadow-md items-center justify-center hover:bg-primary hover:text-primary-foreground transition"
          >
            <ChevronRight className="h-5 w-5 rtl:rotate-180" />
          </button>

          <div
            ref={scrollerRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-3 -mx-4 px-4 sm:mx-0 sm:px-0"
            style={{ scrollbarWidth: "thin" }}
          >
            {feedbackImages.map((src, i) => (
              <figure
                key={i}
                className="snap-start shrink-0 w-[260px] sm:w-[300px] rounded-2xl overflow-hidden border border-border bg-card shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <img
                  src={src}
                  alt={`Client review ${i + 1}`}
                  className="w-full h-auto max-h-[520px] object-contain bg-secondary/40"
                  loading="lazy"
                />
              </figure>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
