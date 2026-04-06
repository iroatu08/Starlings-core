import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, Users, Plane, Hotel } from 'lucide-react'
import type { Destination } from '../../types/destination.types'
import { formatCurrency } from '../../utils/formatCurrency'

interface DestinationCardProps {
  destination: Destination
  index?: number
}

export function DestinationCard({ destination, index = 0 }: DestinationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link
        to={`/destinations/${destination.id}`}
        className="group block bg-white rounded-2xl overflow-hidden shadow-md card-hover"
      >
        {/* Image */}
        <div className="relative h-52 sm:h-60 overflow-hidden">
          <img
            src={destination.heroImageUrl || 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&q=80'}
            alt={destination.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/20 to-transparent" />

          {/* Country badge */}
          <span className="absolute top-3 left-3 bg-gold text-white text-xs font-semibold px-3 py-1 rounded-full">
            {destination.country}
          </span>

          {/* Featured badge */}
          {destination.isFeatured && (
            <span className="absolute top-3 right-3 bg-white/90 text-navy text-xs font-semibold px-2 py-1 rounded-full">
              ⭐ Featured
            </span>
          )}

          {/* Price overlay */}
          <div className="absolute bottom-3 left-3">
            <p className="text-white/70 text-xs">From</p>
            <p className="text-gold font-bold text-lg leading-none">
              {formatCurrency(destination.priceFromNgn, 'NGN')}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-display text-lg font-bold text-navy group-hover:text-gold transition-colors duration-200 mb-1">
            {destination.name}
          </h3>
          <p className="text-slate text-sm leading-relaxed line-clamp-2 mb-4">
            {destination.description}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-slate">
            <span className="flex items-center gap-1">
              <Plane size={12} className="text-gold" />
              {destination.packages?.length || 0} packages
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} className="text-gold" />
              7-14 days
            </span>
          </div>

          {/* CTA */}
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm font-semibold text-navy">
              ${destination.priceFromUsd.toLocaleString()} USD
            </span>
            <span className="text-gold text-sm font-semibold group-hover:translate-x-1 inline-block transition-transform duration-200">
              Explore →
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
