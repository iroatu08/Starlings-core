import { motion } from 'framer-motion'
import { SeoHelmet } from '../components/shared/SeoHelmet'

export function About() {
  return (
    <>
      <SeoHelmet
        title="About"
        description="Starlings Hospitality — trusted travel agency with global reach and premium curated experiences."
      />

      <section className="relative h-64 md:h-80 overflow-hidden gradient-navy flex items-end">
        <div className="relative container-custom pb-10 w-full">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-gold text-sm font-semibold tracking-widest uppercase mb-2">Our story</p>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white">About us</h1>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-off-white">
        <div className="container-custom max-w-3xl">
          <p className="text-slate text-lg leading-relaxed mb-6">
            Starlings Hospitality helps travelers explore France, the UK, Nigeria, the USA, the UAE, and Canada
            with visa support, flights, hotels, and activities — coordinated by an experienced team.
          </p>
          <p className="text-slate leading-relaxed">
            We focus on clear communication, reliable partners, and trips that match how you like to travel.
          </p>
        </div>
      </section>
    </>
  )
}
