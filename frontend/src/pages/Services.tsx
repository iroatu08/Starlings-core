import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FileText, Plane, Hotel, Activity, ArrowRight } from 'lucide-react'
import { SeoHelmet } from '../components/shared/SeoHelmet'

type ServiceItem = {
  icon: typeof FileText
  title: string
  description: string
}

const SERVICE_ITEMS: ServiceItem[] = [
  {
    icon: FileText,
    title: 'Visa assistance',
    description:
      'Guidance on requirements, documentation, and timelines for tourist and business visas across our destination countries.',
  },
  {
    icon: Plane,
    title: 'Flight bookings',
    description:
      'Competitive fares on major carriers, flexible routing, and support for group and family travel.',
  },
  {
    icon: Hotel,
    title: 'Hotel reservations',
    description:
      'Hand-picked stays from boutique properties to five-star partners, matched to your budget and style.',
  },
  {
    icon: Activity,
    title: 'Activity packages',
    description:
      'Curated experiences — safaris, city tours, theme parks, and cultural outings — bundled with your trip.',
  },
]

export function Services() {
  return (
    <>
      <SeoHelmet
        title="Services"
        description="Visa assistance, flights, hotels, and activities — full-service travel planning with Starlings Hospitality."
      />

      <section className="relative h-72 md:h-96 overflow-hidden gradient-navy flex items-end">
        <img
          src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&q=80"
          alt="Travel planning and services"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="relative container-custom pb-12 w-full">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-gold text-sm font-semibold tracking-widest uppercase mb-2">What we offer</p>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white">Our services</h1>
            <p className="mt-4 text-white/80 max-w-xl text-lg">
              Everything you need in one place — from paperwork to takeoff and every moment on the ground.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-off-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {SERVICE_ITEMS.map(({ icon: Icon, title, description }, i) => (
              <motion.article
                key={title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-border p-8 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-14 h-14 rounded-full bg-navy/5 border border-navy/10 flex items-center justify-center mb-6">
                  <Icon className="text-gold" size={26} strokeWidth={1.75} />
                </div>
                <h2 className="font-display text-2xl font-bold text-navy mb-3">{title}</h2>
                <p className="text-slate leading-relaxed">{description}</p>
              </motion.article>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <p className="text-slate mb-6 max-w-lg mx-auto">
              Ready to plan your trip? Browse destinations or tell us how we can help.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/destinations" className="btn-primary inline-flex items-center gap-2">
                View destinations
                <ArrowRight size={18} />
              </Link>
              <Link to="/contact" className="btn-outline inline-flex items-center gap-2">
                Contact us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  )
}
