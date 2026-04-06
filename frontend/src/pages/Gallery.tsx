import { motion } from 'framer-motion'
import { SeoHelmet } from '../components/shared/SeoHelmet'

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
  'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80',
  'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&q=80',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80',
  'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&q=80',
]

export function Gallery() {
  return (
    <>
      <SeoHelmet
        title="Gallery"
        description="Travel inspiration from destinations we love — Starlings Hospitality gallery."
      />

      <section className="relative h-64 md:h-80 overflow-hidden gradient-navy flex items-end">
        <div className="relative container-custom pb-10 w-full">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-gold text-sm font-semibold tracking-widest uppercase mb-2">Inspiration</p>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white">Gallery</h1>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-off-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PLACEHOLDER_IMAGES.map((src, i) => (
              <motion.div
                key={src}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="aspect-[4/3] rounded-2xl overflow-hidden border border-border shadow-sm"
              >
                <img src={src} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
