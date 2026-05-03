import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { SeoHelmet } from '../components/shared/SeoHelmet'

const SECTIONS: { id: string; title: string; body: ReactNode }[] = [
  {
    id: 'accept',
    title: 'Agreement',
    body: (
      <p>
        These Terms of Service (&ldquo;Terms&rdquo;) govern your use of the Starlings Hospitality website and related
        booking and concierge services. By accessing our site or purchasing services, you agree to these Terms.
      </p>
    ),
  },
  {
    id: 'services',
    title: 'Services',
    body: (
      <p>
        We arrange travel-related services including itineraries, accommodation, activities, and coordination with
        partners. Specific inclusions, dates, and prices are confirmed in your booking confirmation or separate
        agreement. Third-party suppliers may apply their own terms.
      </p>
    ),
  },
  {
    id: 'bookings',
    title: 'Bookings, pricing, and payment',
    body: (
      <>
        <p>
          Quotes are subject to availability and may change until payment or deposit is received as stated in your
          offer. You are responsible for accurate information (names, travel dates, passport details). Fees, cancellation
          rules, and refund eligibility follow the terms communicated at booking and any supplier conditions.
        </p>
      </>
    ),
  },
  {
    id: 'accounts',
    title: 'Accounts and conduct',
    body: (
      <p>
        You must provide accurate registration information and keep your login secure. You may not misuse the site,
        interfere with other users, or use our services for unlawful purposes. We may suspend or terminate access for
        violations or risk to our operations or other customers.
      </p>
    ),
  },
  {
    id: 'liability',
    title: 'Limitation of liability',
    body: (
      <p>
        To the fullest extent permitted by applicable law, Starlings Hospitality is not liable for indirect,
        incidental, or consequential losses. Our total liability arising from any booking is limited to the amount you
        paid us for that booking unless mandatory law requires otherwise. Nothing in these Terms excludes liability that
        cannot be excluded by law.
      </p>
    ),
  },
  {
    id: 'law',
    title: 'Governing law',
    body: (
      <p>
        These Terms are governed by the laws of the United Arab Emirates as applied in Dubai, unless mandatory
        consumer protections in your jurisdiction provide otherwise. Courts in Dubai shall have non-exclusive
        jurisdiction unless otherwise required by law.
      </p>
    ),
  },
  {
    id: 'contact',
    title: 'Contact',
    body: (
      <p>
        Questions about these Terms:{' '}
        <a href="mailto:concierge@starlings.ae" className="text-gold font-semibold underline underline-offset-2 hover:text-gold-600">
          concierge@starlings.ae
        </a>
        .
      </p>
    ),
  },
]

export function Terms() {
  return (
    <>
      <SeoHelmet
        title="Terms of Service"
        description="Terms governing use of Starlings Hospitality services and website."
      />

      <section className="relative h-56 md:h-64 overflow-hidden gradient-navy flex items-end">
        <div className="relative container-custom pb-10 w-full">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-gold text-sm font-semibold tracking-widest uppercase mb-2">Legal</p>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white">Terms of Service</h1>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-off-white">
        <div className="container-custom max-w-3xl">
          <p className="text-sm text-slate mb-10">
            Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>

          <div className="space-y-12">
            {SECTIONS.map((section) => (
              <article key={section.id} id={section.id}>
                <h2 className="font-display text-xl md:text-2xl font-bold text-navy mb-4">{section.title}</h2>
                <div className="text-slate leading-relaxed space-y-4">{section.body}</div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
