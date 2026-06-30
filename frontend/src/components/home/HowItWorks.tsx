import { Link } from 'react-router-dom';
import { Compass, CalendarCheck, Sparkles } from 'lucide-react';

const JOURNEY_STEPS = [
  {
    icon: Compass,
    step: '01',
    title: 'Choose your experience',
    body: 'Browse curated experiences across Nigeria, Ghana, and the UK — each built around lifestyle, culture, and connection.',
    href: '/destinations',
    cta: 'Explore experiences',
  },
  {
    icon: CalendarCheck,
    step: '02',
    title: 'Customize your package',
    body: 'Pick your destination bundle, adjust optional add-ons, and reserve with transparent pricing before you commit.',
    href: '/get-started',
    cta: 'Start planning',
  },
  {
    icon: Sparkles,
    step: '03',
    title: 'Show up and enjoy',
    body: 'Your concierge handles transfers, timing, and details — you focus on the experience, not the logistics.',
    href: '/get-started',
    cta: 'Book your trip',
  },
] as const;

/**
 * Guided conversion journey explaining the path from interest to booking.
 */
export function HowItWorks() {
  return (
    <section className="bg-white px-6 py-24 md:px-12 md:py-32" aria-label="How it works">
      <div className="mx-auto max-w-screen-2xl">
        <div className="mb-16 max-w-2xl">
          <span className="font-sans text-sm font-medium uppercase tracking-widest text-[#785a00]">
            Your journey
          </span>
          <h2 className="mt-4 font-display text-4xl text-[#1b1c1a] md:text-5xl">
            From curiosity to <span className="italic text-[#785a00]">confirmed</span>
          </h2>
          <p className="mt-6 font-sans text-lg leading-relaxed text-[#45464e]">
            A clear path designed to remove friction — so you can move from browsing to booking with confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {JOURNEY_STEPS.map((item) => (
            <article
              key={item.step}
              className="flex flex-col rounded-xl border border-[#c5c6cf]/20 bg-[#fbf9f5] p-10"
            >
              <div className="mb-8 flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#d9e2ff]">
                  <item.icon className="h-7 w-7 text-[#041534]" strokeWidth={1.25} />
                </div>
                <span className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-[#785a00]">
                  Step {item.step}
                </span>
              </div>
              <h3 className="mb-4 font-display text-2xl italic text-[#041534]">{item.title}</h3>
              <p className="mb-8 flex-1 font-sans leading-relaxed text-[#45464e]">{item.body}</p>
              <Link
                to={item.href}
                className="inline-flex font-sans text-sm font-semibold uppercase tracking-widest text-[#041534] underline decoration-2 underline-offset-8 decoration-[#785a00] transition-all hover:decoration-[#041534]"
              >
                {item.cta}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
