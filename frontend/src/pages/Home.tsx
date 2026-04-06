import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Globe, Shield, Star, ArrowRight, Plane, Hotel, FileText, Activity } from 'lucide-react'
import { HeroCarousel } from '../components/shared/HeroCarousel'
import { DestinationCard } from '../components/shared/DestinationCard'
import { SeoHelmet } from '../components/shared/SeoHelmet'
import { destinationsApi } from '../api/destinations.api'
import type { Destination } from '../types/destination.types'

const ACTIVITIES = [
  { icon: '🪂', title: 'Skydiving', desc: 'Dubai & USA' },
  { icon: '🌊', title: 'Water Parks', desc: 'UAE & France' },
  { icon: '🦁', title: 'Safaris', desc: 'Nigeria & Kenya' },
  { icon: '🏛️', title: 'Cultural Tours', desc: 'All Destinations' },
  { icon: '🍷', title: 'Wine Tasting', desc: 'France & Canada' },
  { icon: '🏄', title: 'Surfing', desc: 'UK & Nigeria' },
]

const USP_CARDS = [
  {
    icon: Shield,
    title: 'Trusted & Certified',
    desc: 'Licensed travel agency with 10+ years of experience serving thousands of satisfied clients worldwide.',
  },
  {
    icon: Globe,
    title: 'Global Reach',
    desc: 'We cover 6 major destination countries with exclusive hotel, airline, and activity partnerships.',
  },
  {
    icon: Star,
    title: 'Premium Experience',
    desc: 'Every package is curated for luxury and value — visa assistance, flights, hotels, and activities in one place.',
  },
]

const SERVICES = [
  { icon: FileText, label: 'Visa Assistance', href: '/services' },
  { icon: Plane, label: 'Flight Bookings', href: '/services' },
  { icon: Hotel, label: 'Hotel Reservations', href: '/services' },
  { icon: Activity, label: 'Activity Packages', href: '/services' },
]

export function Home() {
  const { data: destinationsData } = useQuery({
    queryKey: ['destinations', { featured: true }],
    queryFn: () => destinationsApi.getAll({ featured: true }),
    select: (res) => res.data.data,
  })

  const destinations: Destination[] = destinationsData || []

  return (
    <>
      <SeoHelmet
        title="Home"
        description="Starlings Hospitality — Where your travel dreams become reality. Premium travel packages to France, UK, Nigeria, USA, UAE, and Canada."
      />

      {/* Hero */}
      <HeroCarousel />

      {/* Services Strip */}
      <section className="bg-navy py-8" aria-label="Our services">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {SERVICES.map(({ icon: Icon, label, href }) => (
              <Link key={label} to={href} className="flex flex-col items-center gap-2 text-white/70 hover:text-gold transition-colors group">
                <div className="w-12 h-12 rounded-full border border-white/20 group-hover:border-gold flex items-center justify-center transition-colors">
                  <Icon size={20} />
                </div>
                <span className="text-xs font-medium text-center">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="section-padding bg-off-white" aria-label="Featured destinations">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-gold text-sm font-semibold tracking-[0.2em] uppercase mb-3">Explore The World</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-navy">
              Featured Destinations
            </h2>
            <p className="mt-4 text-slate max-w-xl mx-auto">
              From the glittering skylines of Dubai to the romantic streets of Paris — choose your next adventure.
            </p>
          </motion.div>

          {destinations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {destinations.slice(0, 6).map((dest, i) => (
                <DestinationCard key={dest.id} destination={dest} index={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {['France', 'UK', 'Nigeria', 'USA', 'UAE', 'Canada'].map((country, i) => (
                <div key={country} className="bg-white rounded-2xl overflow-hidden shadow-md h-72 shimmer-bg" />
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link to="/destinations" className="btn-navy">
              View All Destinations <ArrowRight size={16} className="inline ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Activity Strip */}
      <section className="py-16 gradient-navy overflow-hidden" aria-label="Activities">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-gold text-sm font-semibold tracking-[0.2em] uppercase mb-3">Adventures Await</p>
            <h2 className="font-display text-4xl font-bold text-white">
              Unforgettable Activities
            </h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {ACTIVITIES.map((act, i) => (
              <motion.div
                key={act.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center gap-3 p-4 rounded-2xl glass text-center hover:bg-gold/20 transition-all duration-300 cursor-pointer"
              >
                <span className="text-4xl">{act.icon}</span>
                <div>
                  <p className="text-white font-semibold text-sm">{act.title}</p>
                  <p className="text-white/50 text-xs">{act.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Starlings */}
      <section className="section-padding bg-off-white" aria-label="Why choose Starlings">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-gold text-sm font-semibold tracking-[0.2em] uppercase mb-3">Our Promise</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-navy">Why Choose Starlings?</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {USP_CARDS.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-white rounded-2xl p-8 shadow-md card-hover text-center"
              >
                <div className="w-16 h-16 rounded-2xl gradient-navy flex items-center justify-center mx-auto mb-6">
                  <Icon size={28} className="text-gold" />
                </div>
                <h3 className="font-display text-xl font-bold text-navy mb-3">{title}</h3>
                <p className="text-slate text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-navy" aria-label="Newsletter signup">
        <div className="container-custom text-center max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              Get Travel Deals in Your Inbox
            </h2>
            <p className="text-white/60 mb-8">Subscribe to receive exclusive offers, destination guides, and early access to new packages.</p>
            <form
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-gold"
                id="newsletter-email"
              />
              <button type="submit" className="btn-primary whitespace-nowrap">Subscribe</button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-off-white" aria-label="Get started">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <p className="text-gold font-semibold tracking-widest uppercase text-sm mb-4">Start Your Journey</p>
            <h2 className="font-display text-4xl md:text-6xl font-bold text-navy mb-6">
              Ready to Explore the World?
            </h2>
            <p className="text-slate text-lg max-w-xl mx-auto mb-10">
              Let Starlings Hospitality craft your perfect travel experience — from visa to hotel, we handle everything.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/get-started" className="btn-primary text-lg px-10 py-4">
                Build My Package
              </Link>
              <Link to="/contact" className="btn-outline text-lg px-10 py-4">
                Talk to an Expert
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
