import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { SeoHelmet } from '../components/shared/SeoHelmet'

export function GetStarted() {
  return (
    <>
      <SeoHelmet
        title="Get started"
        description="Start planning your trip with Starlings Hospitality — destinations, packages, and expert support."
      />

      <section className="relative h-64 md:h-80 overflow-hidden gradient-navy flex items-end">
        <div className="relative container-custom pb-10 w-full">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-gold text-sm font-semibold tracking-widest uppercase mb-2">Plan your trip</p>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white">Get started</h1>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-off-white">
        <div className="container-custom max-w-2xl text-center">
          <p className="text-slate text-lg mb-8">
            Browse destinations, add packages to your cart, and complete checkout when you are signed in.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/destinations" className="btn-primary">Browse destinations</Link>
            <Link to="/contact" className="btn-outline">Talk to us</Link>
          </div>
        </div>
      </section>
    </>
  )
}
