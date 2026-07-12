import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Check,
  ClipboardCheck,
  FileText,
  Hotel,
  Hourglass,
  Plane,
  SendHorizonal,
} from 'lucide-react'
import { SeoHelmet } from '../components/shared/SeoHelmet'

type TabId = 'visa' | 'flights' | 'hotels' | 'activities'

const HERO_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDj4fxhfakt6BQa9E2-s7sq7rJb6LNSb-Cul_WMIjn1eLkwJo1iS04ST7bnv57NuRxnhp2ZYxFjGR4UYsad2MvDymcmx9CPCaQTgMhUTWKYyWEyxlLlY_80jUGLbjUb0YbjMCFr7DffaSHJWsQMBuZUHJe37tsPYiqz5hfYK2cJoH6r5yB0ihGAGzbAjKAclrdbxrvCz4lc_J6ecR6Ynzbr3sAxDBZWJUrLQ3CJW2U88H7YNnD1yjJBk8D6EklFfKYxx9vheYVLSxKV'

const SERVICE_TABS: { id: TabId; label: string; icon: typeof FileText }[] = [
  { id: 'visa', label: 'Curated Experiences', icon: FileText },
  { id: 'flights', label: 'Hotel Reservations', icon: Plane },
  { id: 'hotels', label: 'Flight Bookings', icon: Hotel },
  { id: 'activities', label: 'Visa Assistance', icon: Activity },
]

type ServiceTier = {
  name: 'Standard' | 'Premium' | 'Luxury'
  price: string
  unit: string
  badge?: string
  featured?: boolean
  bullets: string[]
  cta: { label: string; href: string }
}

type ServiceContent = {
  hero: { eyebrow: string; title: string; titleEmphasis: string; description: string }
  detail: { title: string; description: string }
  steps: { title: string; description: string; icon: typeof FileText }[]
  tiers: ServiceTier[]
}

const SERVICE_CONTENT: Record<TabId, ServiceContent> = {
  visa: {
    hero: {
      eyebrow: 'Concierge Excellence',
      title: 'Elevated Experiences',
      titleEmphasis: 'Beyond Borders',
      description:
        'Discover a suite of premium hospitality services designed for the modern curator. From complex visa logistics to curated activity packages, our digital concierge ensures your journey is as seamless as it is spectacular.',
    },
    detail: {
      title: 'Visa Support Made Simple',
      description:
        'From visa support and flight bookings to hotel reservations and curated experiences, our concierge team handles the details so every journey feels effortless.',
    },
    steps: [
      {
        title: '1. Document Review',
        description:
          'Our experts conduct a meticulous audit of your application materials to ensure 100% compliance.',
        icon: ClipboardCheck,
      },
      {
        title: '2. Submission Portal',
        description:
          'Expedited processing through our direct diplomatic and government liaison channels.',
        icon: SendHorizonal,
      },
      {
        title: '3. Real-time Tracking',
        description: 'Receive automated updates and concierge notifications as your status progresses.',
        icon: Hourglass,
      },
      {
        title: '4. Secure Delivery',
        description: 'Digital and physical delivery of approved visas directly to your preferred location.',
        icon: BadgeCheck,
      },
    ],
    tiers: [
      {
        name: 'Standard',
        price: '$299',
        unit: '/visa',
        bullets: ['Digital consultation', 'Basic review', '7-10 day turnaround'],
        cta: { label: 'Inquire Now', href: '/contact' },
      },
      {
        name: 'Premium',
        price: '$549',
        unit: '/visa',
        badge: 'Most Popular',
        featured: true,
        bullets: ['Priority processing', 'Document pickup', '3-5 day turnaround', 'SMS status alerts'],
        cta: { label: 'Select Premium', href: '/get-started' },
      },
      {
        name: 'Luxury',
        price: '$1,299',
        unit: '/visa',
        bullets: ['Private butler service', '24hr Express lane', 'Golden Visa support', 'Global concierge'],
        cta: { label: 'Inquire Now', href: '/contact' },
      },
    ],
  },
  flights: {
    hero: {
      eyebrow: 'Cabin Curation',
      title: 'Flights Crafted',
      titleEmphasis: 'To Your Rhythm',
      description:
        'Access flexible routing across major carriers with premium support for changes, upgrades, and multi-city journeys — handled with calm, precise attention.',
    },
    detail: {
      title: 'Premium Flight Sourcing',
      description:
        'From strategic layovers to last-seat availability, we handle fare rules, holds, and ticketing while optimizing for comfort, timing, and value.',
    },
    steps: [
      { title: '1. Route Discovery', description: 'We map options across alliances and preferred carriers.', icon: Plane },
      { title: '2. Fare Hold', description: 'Compare rules before purchase with short-term holds.', icon: FileText },
      { title: '3. Ticket Issuance', description: 'Secure e-tickets delivered instantly with receipts.', icon: ClipboardCheck },
      { title: '4. Changes & Reissues', description: 'Rebookings and upgrades managed by your concierge.', icon: BadgeCheck },
    ],
    tiers: [
      {
        name: 'Standard',
        price: '$49',
        unit: '/booking',
        bullets: ['Economy sourcing', 'Fare rules summary', 'Email delivery'],
        cta: { label: 'Inquire Now', href: '/contact' },
      },
      {
        name: 'Premium',
        price: '$149',
        unit: '/booking',
        badge: 'Most Popular',
        featured: true,
        bullets: ['Priority rebooking', 'Upgrade monitoring', 'Dedicated agent'],
        cta: { label: 'Select Premium', href: '/get-started' },
      },
      {
        name: 'Luxury',
        price: '$399',
        unit: '/booking',
        bullets: ['First/Business sourcing', 'Airport meet & greet', '24/7 travel desk'],
        cta: { label: 'Inquire Now', href: '/contact' },
      },
    ],
  },
  hotels: {
    hero: {
      eyebrow: 'Stay Craftsmanship',
      title: 'Reservations',
      titleEmphasis: 'Refined',
      description:
        'Boutique gems to five-star partners — matched to your budget, neighbourhood preference, and loyalty programmes, with upgrades where possible.',
    },
    detail: {
      title: 'Curated Stays',
      description:
        'We shortlist properties with clear cancellation terms, room comparisons, and map context — then secure the booking and support check-in through checkout.',
    },
    steps: [
      { title: '1. Brief & Preferences', description: 'Style, amenities, neighbourhood, and budget alignment.', icon: FileText },
      { title: '2. Shortlist', description: 'Options with photos, policies, and upgrade notes.', icon: ClipboardCheck },
      { title: '3. Confirmation', description: 'Voucher delivery and pre-arrival coordination.', icon: BadgeCheck },
      { title: '4. Stay Support', description: 'Assistance for check-in issues or changes.', icon: Hourglass },
    ],
    tiers: [
      {
        name: 'Standard',
        price: '$79',
        unit: '/stay',
        bullets: ['Shortlist + booking', 'Policy review', 'Voucher delivery'],
        cta: { label: 'Inquire Now', href: '/contact' },
      },
      {
        name: 'Premium',
        price: '$199',
        unit: '/stay',
        badge: 'Most Popular',
        featured: true,
        bullets: ['VIP notes & upgrades', 'Late check-out requests', 'Priority support'],
        cta: { label: 'Select Premium', href: '/get-started' },
      },
      {
        name: 'Luxury',
        price: '$499',
        unit: '/stay',
        bullets: ['Suite sourcing', 'Airport transfers', '24/7 concierge'],
        cta: { label: 'Inquire Now', href: '/contact' },
      },
    ],
  },
  activities: {
    hero: {
      eyebrow: 'Experience Design',
      title: 'Moments',
      titleEmphasis: 'Assembled',
      description:
        'Safaris, city tours, theme parks, culinary experiences, and private guides — planned into a smooth itinerary with operator coordination.',
    },
    detail: {
      title: 'Curated Experiences',
      description:
        'We design your itinerary around dates, secure slots, issue e-vouchers, and coordinate on-the-ground operators so you can stay present.',
    },
    steps: [
      { title: '1. Itinerary Design', description: 'Plan around your dates and interests.', icon: Activity },
      { title: '2. Confirmed Slots', description: 'Reservations, tickets, and e-vouchers.', icon: ClipboardCheck },
      { title: '3. Local Coordination', description: 'Operators, pickups, and timing handled.', icon: SendHorizonal },
      { title: '4. On-trip Adjustments', description: 'Changes supported by concierge line.', icon: BadgeCheck },
    ],
    tiers: [
      {
        name: 'Standard',
        price: '$129',
        unit: '/day',
        bullets: ['Two experiences', 'Ticketing', 'Operator coordination'],
        cta: { label: 'Inquire Now', href: '/contact' },
      },
      {
        name: 'Premium',
        price: '$299',
        unit: '/day',
        badge: 'Most Popular',
        featured: true,
        bullets: ['Private guide options', 'Priority slots', 'Concierge check-ins'],
        cta: { label: 'Select Premium', href: '/get-started' },
      },
      {
        name: 'Luxury',
        price: '$699',
        unit: '/day',
        bullets: ['VIP access', 'Private transfers', 'Bespoke itinerary'],
        cta: { label: 'Inquire Now', href: '/contact' },
      },
    ],
  },
}

export function Services() {
  const [tab, setTab] = useState<TabId>('visa')
  const content = useMemo(() => SERVICE_CONTENT[tab], [tab])

  return (
    <>
      <SeoHelmet
        title="Services"
        description="Visa assistance, flights, hotels, and activities — full-service travel planning with Starlings Hospitality."
      />

      <main className="bg-[#fbf9f5] pb-24 pt-32">
        <section className="mx-auto mb-20 grid max-w-screen-2xl grid-cols-12 items-center gap-8 px-6 md:px-12 lg:mb-24">
          <div className="col-span-12 lg:col-span-6">
            <h4 className="mb-6 font-sans text-sm font-bold uppercase tracking-[0.1em] text-[#785a00]">
              {content.hero.eyebrow}
            </h4>
            <h1 className="mb-8 font-display text-5xl leading-tight tracking-tight text-[#041534] lg:text-7xl">
              {content.hero.title}
              <br />
              <span className="font-normal italic text-[#041534]/80">{content.hero.titleEmphasis}</span>
            </h1>
            <p className="max-w-lg font-sans text-lg leading-relaxed text-[#45464e]">
              {content.hero.description}
            </p>
          </div>

          <div className="relative col-span-12 lg:col-span-6">
            <div className="aspect-[4/5] w-full overflow-hidden rounded-xl bg-[#f5f3ef] shadow-2xl">
              <img
                alt="Luxury hotel lobby"
                src={HERO_IMAGE}
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="editorial-shadow absolute -bottom-12 -left-12 hidden max-w-xs rounded-xl bg-white p-8 lg:block">
              <BadgeCheck size={32} className="mb-4 text-[#785a00]" strokeWidth={1.5} />
              <p className="font-sans text-sm font-medium leading-relaxed text-[#1b1c1a]">
                Trusted by over 500+ global enterprises for executive travel and high-net-worth individual logistics.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-screen-2xl px-6 md:px-12" aria-label="Service tabs">
          <div className="mb-14 flex flex-wrap justify-center gap-3 border-b border-[#c5c6cf]/30 pb-8">
            {SERVICE_TABS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`rounded-full px-6 py-2.5 font-sans text-sm font-medium transition-colors ${
                  tab === id
                    ? 'bg-[#041534] text-white'
                    : 'bg-[#eae8e4] text-[#45464e] hover:bg-[#e4e2de]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-12 items-start gap-10 lg:gap-16">
            <div className="col-span-12 lg:col-span-5">
              <h2 className="mb-6 font-display text-4xl text-[#041534]">{content.detail.title}</h2>
              <p className="mb-12 font-sans leading-loose text-[#45464e]">{content.detail.description}</p>

              <div className="space-y-10">
                {content.steps.map((step) => {
                  const Icon = step.icon
                  return (
                    <div key={step.title} className="flex items-start gap-6">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#eae8e4]">
                        <Icon size={20} className="text-[#041534]" strokeWidth={1.5} />
                      </div>
                      <div>
                        <h3 className="mb-1 font-display text-xl text-[#041534]">{step.title}</h3>
                        <p className="font-sans text-sm text-[#45464e]">{step.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="col-span-12 grid grid-cols-1 gap-6 md:grid-cols-3 lg:col-span-7">
              {content.tiers.map((tier) => (
                <div
                  key={tier.name}
                  className={`relative flex h-full flex-col overflow-hidden rounded-xl p-8 ${
                    tier.featured
                      ? 'bg-[#041534] text-white shadow-2xl md:scale-105'
                      : 'bg-white text-[#1b1c1a] border border-[#c5c6cf]/30'
                  } ${tier.featured ? '' : 'shadow-[0_8px_40px_-12px_rgba(27,28,26,0.04)]'}`}
                >
                  {tier.badge && tier.featured && (
                    <div className="absolute right-4 top-4 rounded-full bg-[#785a00] px-3 py-1 text-[10px] font-bold uppercase tracking-tight text-white">
                      {tier.badge}
                    </div>
                  )}

                  <div className="mb-8">
                    <h4
                      className={`mb-2 font-sans text-xs font-bold uppercase tracking-[0.22em] ${
                        tier.featured ? 'text-[#8392b7]' : 'text-[#45464e]'
                      }`}
                    >
                      {tier.name}
                    </h4>
                    <div className="flex items-baseline gap-1">
                      <span className={`font-display text-3xl ${tier.featured ? 'text-white' : 'text-[#041534]'}`}>
                        {tier.price}
                      </span>
                      <span className={`text-sm ${tier.featured ? 'text-[#8392b7]' : 'text-[#45464e]'}`}>
                        {tier.unit}
                      </span>
                    </div>
                  </div>

                  <ul className="mb-12 flex-grow space-y-4">
                    {tier.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className={`flex items-center gap-3 font-sans text-sm ${
                          tier.featured ? 'text-white' : 'text-[#1b1c1a]'
                        }`}
                      >
                        <Check
                          size={18}
                          strokeWidth={2}
                          className={tier.featured ? 'text-[#fdce5d]' : 'text-[#785a00]'}
                        />
                        {bullet}
                      </li>
                    ))}
                  </ul>

                  {tier.featured ? (
                    <Link
                      to={tier.cta.href}
                      className="w-full rounded-sm bg-[#785a00] py-4 text-center font-sans text-sm font-bold text-white transition-all hover:brightness-110"
                    >
                      {tier.cta.label}
                    </Link>
                  ) : (
                    <Link
                      to={tier.cta.href}
                      className="w-full border-b-2 border-transparent py-4 text-center font-sans text-sm font-medium text-[#041534] transition-all hover:border-[#785a00]"
                    >
                      {tier.cta.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto mt-28 max-w-screen-2xl px-6 md:px-12 lg:mt-32" aria-label="Service visuals">
          <div className="grid grid-cols-12 gap-6">
            <div className="group relative col-span-12 h-[520px] overflow-hidden rounded-xl shadow-lg md:col-span-7 md:h-[600px]">
              <img
                alt="Fine dining table"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDXNluhqNP10QyO_lx25LOMMC_6m7EwxkNxjGrQuNJK5v0UvQFN62e3Y2WvWuurdp9tKsvdZ8x6qBMyXG5u5paFIB4WNdhYFOUQS6UxPRTCDtrejBM9mt9ygHd5P0iAJ2-gZNBXGA2KaWA8zc-byHktbG7QMH-ad-gtCgo8J34unXRm2wdHOok9lmM_SAM7fPW2kSGK1Q77SjqRxFdkJg9THiwHbcfolF8L6peSc0EhdpbvsvZAEVWKUsGbkbn-iiPMA1pdncUQ4V0z"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#041534]/60 to-transparent" />
              <div className="absolute bottom-10 left-10 text-white">
                <h3 className="mb-2 font-display text-3xl">Curated Dining</h3>
                <p className="font-sans text-sm uppercase tracking-[0.22em] opacity-80">
                  Part of our Luxury Packages
                </p>
              </div>
            </div>

            <div className="col-span-12 grid grid-rows-2 gap-6 md:col-span-5">
              <div className="group relative h-[288px] overflow-hidden rounded-xl shadow-lg">
                <img
                  alt="Luxury pool view"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4UuH1Fkbg76-2UdeH4oRwq9M5hnj-z7sk7dWaFd1PCgoVncGhR3n3iqliqfrLO9F4BDWuuQQ224COlReaen5gYhEfwpn7uHkSk9U8IFeuIcvZGaukPM-XrIB5ahcC1YeooKpuhiYPlDmkSUq-jcr0PO_WOIE2OW_FpOyr_Kc19oNdttsYLmVZPLOLUh0Qzz39RD2BWQ6QHFCOlORteSu08asXu5BwVsJKiONsAnoUCXWe7vfwnQ1SA1GixgYWhE9Q302a-nX0qnDJ"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-[#041534]/20" />
              </div>
              <div className="group relative h-[288px] overflow-hidden rounded-xl shadow-lg">
                <img
                  alt="First class flight"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuApSwVxeiYzjwN0uNp9hAK0-iIHZoRDhRDUdEZT3-Ehxw_b3CH7UNlHZAwna8HZD-vROiYiqkIq1hpg6uIQNhMc3UuouccsleKnYk6haatwjcZDpozgjxnce7olH19dRP-Pr-K-K0nQ3lsmhBvLAQ8AUpVNLQdpaqDGcFWpIXnWweLYyP6tjx7MRY8RFVJry_xXYnBeJc8Cck8LU5R41Sug-HMdMgBD-wojzZmZg6cSzfks6_ffxKmT_3EYDgnrRuggtdS9RUAcfSct"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-[#041534]/20" />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-28 max-w-screen-2xl px-6 md:px-12 lg:mt-32" aria-label="Services CTA">
          <div className="relative overflow-hidden rounded-3xl bg-[#f5f3ef] px-8 py-14 text-center shadow-[0_8px_40px_-12px_rgba(27,28,26,0.04)] md:px-16 md:py-20">
            <div className="absolute left-0 top-0 h-32 w-32 rounded-br-full bg-[#785a00]/5" aria-hidden />
            <div className="relative z-10">
              <h2 className="mb-8 font-display text-4xl tracking-tight text-[#041534] md:text-5xl">
                Ready to curate your next <br />
                extraordinary escape?
              </h2>
              <p className="mx-auto mb-12 max-w-xl font-sans text-lg text-[#45464e]">
                Connect with our dedicated concierge team today for a personalized consultation on your travel and
                hospitality needs.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row sm:gap-6">
                <Link
                  to="/get-started"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#041534] px-8 py-4 font-sans text-base font-bold text-white transition-all hover:shadow-xl"
                >
                  Start Your Application
                  <ArrowRight size={18} />
                </Link>
                <Link
                  to="/services"
                  className="inline-flex items-center justify-center rounded-lg border border-[#c5c6cf]/40 bg-white px-8 py-4 font-sans text-base font-bold text-[#041534] transition-colors hover:bg-[#eae8e4]"
                >
                  View All Services
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
