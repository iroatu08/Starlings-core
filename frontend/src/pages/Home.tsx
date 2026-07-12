import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Verified, Shield, Sparkles } from 'lucide-react';
import { newsletterApi } from '../api/newsletter.api';
import { HeroCarousel } from '../components/shared/HeroCarousel';
import { HowItWorks } from '../components/home/HowItWorks';
import { LuxuryDestinationCard } from '../components/home/LuxuryDestinationCard';
import { Testimonials } from '../components/shared/Testimonials';
import { SeoHelmet } from '../components/shared/SeoHelmet';
import { destinationsApi } from '../api/destinations.api';
import type { Destination } from '../types/destination.types';
import { getDestinationHeroImage } from '../utils/destination-image.util';
import { toast } from '../hooks/use-toast';

const USP_CARDS = [
  {
    icon: Verified,
    title: 'Expertly Planned',
    body: 'Every detail is thoughtfully handled — from flights and accommodation to airport transfers and curated experiences — so your journey starts smoothly.',
  },
  {
    icon: Shield,
    title: 'Stress-Free Travel',
    body: 'We take care of the planning, bookings, and logistics before you arrive, so you can simply relax and enjoy the experience.',
  },
  {
    icon: Sparkles,
    title: 'Personalised Experiences',
    body: 'No two travellers are the same. Every itinerary is tailored to your travel style, preferences, and budget — because your experience should feel uniquely yours.',
  },
] as const;

/**
 * Landing page with conversion-focused journey, experiences, and social proof.
 */
export function Home() {
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const newsletterMutation = useMutation({
    mutationFn: (email: string) => newsletterApi.subscribe(email).then((r) => r.data.data.message),
    onSuccess: (msg) => {
      toast({ title: 'Subscribed', description: msg, variant: 'success' });
      setNewsletterEmail('');
    },
    onError: () => {
      toast({
        title: 'Newsletter',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const { data: destinationsData } = useQuery({
    queryKey: ['destinations', { featured: true }],
    queryFn: () => destinationsApi.getAll({ featured: true }),
    select: (res) => res.data.data,
  });

  const { data: allDestinationsData } = useQuery({
    queryKey: ['destinations', 'home-experiences'],
    queryFn: () => destinationsApi.getAll(),
    select: (res) => res.data.data,
  });

  const destinations: Destination[] = destinationsData || [];
  const experienceStrip: Destination[] = (allDestinationsData || []).slice(0, 6);

  return (
    <>
      <SeoHelmet
        title="Starlings Hospitality | Curated travel experiences"
        description="Curated hospitality experiences across Nigeria, Ghana, and the UK. Concierge-led journeys from planning to checkout."
      />

      <HeroCarousel />

      <HowItWorks />

      <section className="bg-[#fbf9f5] px-6 py-24 md:px-12 md:py-32" aria-label="Featured experiences">
        <div className="mx-auto max-w-screen-2xl">
          <div className="mb-16 flex flex-col items-end justify-between gap-6 md:flex-row">
            <div className="max-w-2xl">
              <span className="font-sans text-sm font-medium uppercase tracking-widest text-[#785a00]">
                Curated Experiences
              </span>
              <h2 className="mt-4 font-display text-4xl text-[#1b1c1a] md:text-6xl">
                Live the destination
              </h2>
              <p className="mt-6 font-sans text-lg leading-relaxed text-[#45464e]">
                Thoughtfully curated experiences across Abeokuta, Lagos, Accra, Belfast, Brighton, London, 
                and beyond — designed to help you connect with the people, culture, and character of every city.
              </p>
            </div>
            <Link
              to="/destinations"
              className="font-sans font-medium text-[#041534] underline decoration-2 underline-offset-8 decoration-[#785a00] transition-all hover:decoration-[#041534]"
            >
              Explore All Experiences
            </Link>
          </div>

          {destinations.length > 0 ? (
            <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3">
              {destinations.slice(0, 6).map((dest, i) => (
                <LuxuryDestinationCard
                  key={dest.id}
                  destination={dest}
                  className={i === 1 ? 'md:mt-12 lg:mt-24' : ''}
                />
              ))}
            </div>
          ) : (
            <p className="text-center font-sans text-[#45464e]">Loading experiences…</p>
          )}
        </div>
      </section>

      <section className="overflow-hidden bg-[#041534] py-24 text-white" aria-label="Experience gallery strip">
        <div className="mb-12 flex flex-col items-start justify-between gap-6 px-6 md:flex-row md:items-end md:px-12">
          <h2 className="font-display text-4xl italic">Limitless Experiences</h2>
          <Link
            to="/destinations"
            className="font-sans text-sm font-semibold uppercase tracking-widest text-[#fdce5d] underline decoration-2 underline-offset-8 transition-colors hover:text-white"
          >
            View all
          </Link>
        </div>
        <div className="no-scrollbar flex gap-8 overflow-x-auto px-6 pb-8 md:px-12">
          {experienceStrip.length > 0 ? (
            experienceStrip.map((experience) => {
              const imageUrl = getDestinationHeroImage(experience);
              return (
                <Link
                  key={experience.id}
                  to={`/destinations/${experience.id}`}
                  className="group relative h-96 w-80 shrink-0 overflow-hidden rounded-xl"
                >
                  <div className="relative h-full w-full">
                    <img
                      src={imageUrl}
                      alt={experience.name}
                      width={320}
                      height={384}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute inset-0 flex flex-col items-start justify-end bg-black/40 p-8">
                    <span className="mb-2 font-sans text-xs font-bold uppercase tracking-widest text-[#fdce5d]">
                      {experience.country}
                    </span>
                    <p className="font-display text-2xl italic">{experience.name}</p>
                  </div>
                </Link>
              );
            })
          ) : (
            <p className="px-6 font-sans text-white/70">Experiences loading…</p>
          )}
        </div>
      </section>

      <Testimonials />

      <section className="bg-[#fbf9f5] px-6 py-24 md:px-12 md:py-32" aria-label="Why Starlings">
        <div className="mx-auto grid max-w-screen-2xl grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-24">
          <div>
            <span className="font-sans text-sm font-medium uppercase tracking-widest text-[#785a00]">
              Our advantage
            </span>
            <h2 className="mt-6 font-display text-5xl leading-tight text-[#1b1c1a] md:text-7xl">
              Travel should feel effortless <span className="italic text-[#785a00]">Starlings</span>
            </h2>
            <p className="mt-8 max-w-lg font-sans text-lg leading-relaxed text-[#45464e]">
            From the moment you start planning until you’re safely back home, we thoughtfully
coordinate your flights, stays, transfers, and experiences into one seamless
journey—so you spend less time worrying and more time enjoying every moment
            </p>
            <Link
              to="/get-started"
              className="mt-10 inline-block rounded-lg bg-[#041534] px-8 py-4 font-sans text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-[#785a00]"
            >
              Start your experience
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-8">
            {USP_CARDS.map((card, i) => (
              <div
                key={card.title}
                className={`flex gap-8 rounded-xl border border-[#c5c6cf]/20 bg-white p-10 shadow-sm ${
                  i === 1 ? 'lg:ml-12' : ''
                }`}
              >
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#d9e2ff]">
                  <card.icon className="h-8 w-8 text-[#041534]" strokeWidth={1.25} />
                </div>
                <div>
                  <h4 className="mb-3 font-display text-2xl italic text-[#1b1c1a]">{card.title}</h4>
                  <p className="font-sans leading-relaxed text-[#45464e]">{card.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-[#041534] px-6 py-20 md:px-12" aria-label="Newsletter">
        <div className="mx-auto flex max-w-screen-2xl flex-col items-center justify-between gap-12 md:flex-row">
          <div className="max-w-md text-center md:text-left">
            <h3 className="font-display text-3xl italic text-white">Stay in the loop</h3>
            <p className="mt-2 font-sans text-white/60">
              Be the first to discover new destinations, travel inspiration, helpful tips, and 
              updated from Starlings.
            </p>
          </div>
          <form
            className="flex w-full flex-col gap-4 md:w-auto md:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              const v = newsletterEmail.trim();
              if (v) newsletterMutation.mutate(v);
            }}
          >
            <input
              type="email"
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Your Email Address"
              className="w-full border-0 border-b border-white/20 bg-white/5 px-6 py-4 font-light text-white placeholder:text-white/40 focus:border-[#785a00] focus:outline-none md:w-96"
              id="home-newsletter-email"
            />
            <button
              type="submit"
              disabled={newsletterMutation.isPending}
              className="whitespace-nowrap bg-[#785a00] px-8 py-4 font-sans font-bold tracking-widest text-white transition-all hover:bg-[#fdce5d] hover:text-[#745700] disabled:opacity-60"
            >
              {newsletterMutation.isPending ? '…' : 'SUBSCRIBE'}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
