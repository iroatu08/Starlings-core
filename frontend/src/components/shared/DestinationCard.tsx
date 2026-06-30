import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, Plane } from 'lucide-react'
import type { Destination } from '../../types/destination.types'
import { formatCurrency } from '../../utils/formatCurrency'
import { getCountryFlag } from '../../utils/countryFlags'
import { getDestinationHeroImage } from '../../utils/destination-image.util'

interface DestinationCardProps {
  destination: Destination
  index?: number
}

export function DestinationCard({ destination, index = 0 }: DestinationCardProps) {
  const flag = getCountryFlag(destination.country)
  const imageUrl = getDestinationHeroImage(destination)
  const quickBookTo = `/get-started?destination=${encodeURIComponent(destination.id)}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group bg-white rounded-2xl overflow-hidden shadow-md card-hover flex flex-col"
    >
      <Link
        to={`/destinations/${destination.id}`}
        className="block flex-1"
      >
        <div className="relative h-52 sm:h-60 overflow-hidden">
          <img
            src={imageUrl}
            alt={destination.name}
            width={800}
            height={480}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/20 to-transparent" />

          <span className="absolute top-3 left-3 bg-navy/85 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
            <span className="text-base leading-none" aria-hidden>{flag}</span>
            {destination.country}
          </span>

          {destination.isFeatured && (
            <span className="absolute top-3 right-3 bg-white/90 text-navy text-xs font-semibold px-2 py-1 rounded-full">
              Featured
            </span>
          )}

          <div className="absolute bottom-3 left-3 right-3">
            <p className="text-white/70 text-xs">From</p>
            <p className="text-gold font-bold text-lg leading-tight">
              {formatCurrency(destination.priceFromNgn, 'NGN')}
            </p>
            <p className="text-white/90 text-xs mt-0.5">
              ${Number(destination.priceFromUsd).toLocaleString()} USD
            </p>
          </div>
        </div>

        <div className="p-5">
          <h3 className="font-display text-lg font-bold text-navy group-hover:text-gold transition-colors duration-200 mb-1">
            {destination.name}
          </h3>
          <p className="text-slate text-sm leading-relaxed line-clamp-2 mb-4">
            {destination.description}
          </p>

          <div className="flex items-center gap-4 text-xs text-slate">
            <span className="flex items-center gap-1">
              <Plane size={12} className="text-gold" />
              {destination.packages?.length || 0} packages
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} className="text-gold" />
              7–14 days
            </span>
          </div>
        </div>
      </Link>

      <div className="px-5 pb-5 flex gap-2 mt-auto">
        <Link
          to={`/destinations/${destination.id}`}
          className="flex-1 text-center text-sm font-semibold py-2.5 rounded-lg border-2 border-gold text-gold hover:bg-gold hover:text-white transition-colors"
        >
          Explore
        </Link>
        <Link
          to={quickBookTo}
          className="flex-1 text-center text-sm font-semibold py-2.5 rounded-lg bg-gold text-white hover:bg-gold-600 transition-colors"
        >
          Quick book
        </Link>
      </div>
    </motion.div>
  )
}
