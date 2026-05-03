import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { SeoHelmet } from '../components/shared/SeoHelmet'

const SECTIONS: { id: string; title: string; body: ReactNode }[] = [
  {
    id: 'intro',
    title: 'Introduction',
    body: (
      <>
        <p>
          Starlings Hospitality (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) operates this website and
          related travel and hospitality services. This Privacy Policy explains how we collect, use, store, and protect
          your personal information when you use our site, create an account, make an enquiry, or book a trip.
        </p>
        <p>
          By using our services, you agree to the practices described here. If you do not agree, please do not use the
          site or contact us for alternatives.
        </p>
      </>
    ),
  },
  {
    id: 'collect',
    title: 'Information we collect',
    body: (
      <ul className="list-disc pl-5 space-y-2">
        <li>
          <strong>Contact and identity data:</strong> name, email address, phone number, and similar details you
          provide on forms, at registration, or when you message us.
        </li>
        <li>
          <strong>Booking and travel data:</strong> destination preferences, travel dates, party size, passport or
          visa-related information when required for the service, and payment references (we use trusted payment
          providers; we do not store full card numbers on our servers).
        </li>
        <li>
          <strong>Account data:</strong> login credentials (stored securely), preferences, and history of bookings or
          enquiries tied to your account.
        </li>
        <li>
          <strong>Technical data:</strong> IP address, browser type, device information, and cookies or similar
          technologies as described below.
        </li>
      </ul>
    ),
  },
  {
    id: 'use',
    title: 'How we use your information',
    body: (
      <ul className="list-disc pl-5 space-y-2">
        <li>To respond to enquiries, prepare quotes, and fulfil bookings and itineraries.</li>
        <li>To process payments and send confirmations, updates, and service-related notices.</li>
        <li>To improve our website, services, and customer support.</li>
        <li>To comply with legal obligations and protect our users and business from fraud or misuse.</li>
        <li>Where allowed by law, to send marketing communications — you can opt out at any time.</li>
      </ul>
    ),
  },
  {
    id: 'sharing',
    title: 'Sharing and processors',
    body: (
      <>
        <p>
          We do not sell your personal information. We may share data with service providers who assist us — for
          example cloud hosting, email delivery, payment processing, analytics, or travel partners required to deliver
          your trip. These parties are contractually required to use data only for the purposes we specify and in line
          with applicable law.
        </p>
        <p>
          We may disclose information if required by law, court order, or to protect rights, safety, or security.
        </p>
      </>
    ),
  },
  {
    id: 'retention',
    title: 'Retention',
    body: (
      <p>
        We keep personal data only as long as needed for the purposes above, including legal, accounting, or dispute
        resolution requirements. When retention is no longer necessary, we delete or anonymise data in line with our
        internal policies.
      </p>
    ),
  },
  {
    id: 'rights',
    title: 'Your choices and rights',
    body: (
      <>
        <p>
          Depending on where you live, you may have rights to access, correct, delete, or restrict processing of your
          personal data, or to object to certain processing. To exercise these rights, contact us using the details
          below. You may also unsubscribe from marketing emails via the link in those messages.
        </p>
      </>
    ),
  },
  {
    id: 'cookies',
    title: 'Cookies',
    body: (
      <p>
        We use cookies and similar technologies to operate the site, remember preferences, measure traffic, and
        improve performance. You can control cookies through your browser settings; disabling some cookies may affect how
        the site works.
      </p>
    ),
  },
  {
    id: 'children',
    title: 'Children',
    body: (
      <p>
        Our services are not directed at children under 16, and we do not knowingly collect their personal information.
        If you believe we have done so, please contact us and we will take appropriate steps.
      </p>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to this policy',
    body: (
      <p>
        We may update this Privacy Policy from time to time. The &ldquo;Last updated&rdquo; date below will change when we
        do. Continued use of our services after changes constitutes acceptance of the updated policy where permitted by
        law.
      </p>
    ),
  },
  {
    id: 'contact',
    title: 'Contact us',
    body: (
      <p>
        Questions about privacy or this policy:{' '}
        <a href="mailto:concierge@starlings.ae" className="text-gold font-semibold underline underline-offset-2 hover:text-gold-600">
          concierge@starlings.ae
        </a>
        , or write to us at our business address shown on the Contact page.
      </p>
    ),
  },
]

export function Privacy() {
  return (
    <>
      <SeoHelmet
        title="Privacy Policy"
        description="How Starlings Hospitality collects, uses, and protects your personal information."
      />

      <section className="relative h-56 md:h-64 overflow-hidden gradient-navy flex items-end">
        <div className="relative container-custom pb-10 w-full">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-gold text-sm font-semibold tracking-widest uppercase mb-2">Legal</p>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white">Privacy Policy</h1>
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
