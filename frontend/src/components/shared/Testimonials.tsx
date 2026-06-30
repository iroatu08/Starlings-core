import { Star } from 'lucide-react';
import { BRAND_TESTIMONIALS, getAverageBrandRating } from '../../data/brand-testimonials';

type TestimonialsProps = {
  className?: string;
};

/**
 * Homepage social-proof section featuring client testimonials and aggregate rating.
 */
export function Testimonials({ className = '' }: TestimonialsProps) {
  const averageRating = getAverageBrandRating(BRAND_TESTIMONIALS);

  return (
    <section
      className={`bg-[#041534] px-6 py-24 text-white md:px-12 md:py-32 ${className}`}
      aria-label="Client testimonials"
    >
      <div className="mx-auto max-w-screen-2xl">
        <div className="mb-16 flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <span className="font-sans text-sm font-medium uppercase tracking-widest text-[#fdce5d]">
              Trusted by Travelers
            </span>
            <h2 className="mt-4 font-display text-4xl md:text-5xl">
              What our guests <span className="italic text-[#fdce5d]">say</span>
            </h2>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-sm">
            <div className="flex text-[#fdce5d]" aria-hidden>
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} size={18} className="fill-current" />
              ))}
            </div>
            <div>
              <p className="font-display text-2xl">{averageRating.toFixed(1)}</p>
              <p className="font-sans text-xs uppercase tracking-widest text-white/60">
                Guest satisfaction
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {BRAND_TESTIMONIALS.map((testimonial) => (
            <blockquote
              key={testimonial.id}
              className="flex h-full flex-col justify-between rounded-xl border border-white/10 bg-white/5 p-10 backdrop-blur-sm"
            >
              <div>
                <div className="mb-6 flex text-[#fdce5d]" aria-label={`${testimonial.rating} out of 5 stars`}>
                  {Array.from({ length: testimonial.rating }).map((_, index) => (
                    <Star key={index} size={16} className="fill-current" />
                  ))}
                </div>
                <p className="font-display text-xl italic leading-relaxed text-white/95">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
              </div>
              <footer className="mt-8 border-t border-white/10 pt-6">
                <cite className="not-italic">
                  <span className="block font-sans text-sm font-semibold uppercase tracking-widest text-[#fdce5d]">
                    {testimonial.location}
                  </span>
                </cite>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
