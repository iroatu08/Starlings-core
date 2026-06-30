import { Link } from 'react-router-dom'
import { ArrowRight, Heart } from 'lucide-react'
import { useState } from 'react'
import type { Destination } from '../../types/destination.types'
import { formatCurrency } from '../../utils/formatCurrency'
import { getDestinationHeroImage } from '../../utils/destination-image.util'

type LuxuryDestinationCardProps = {
  destination: Destination
  className?: string
}

export function LuxuryDestinationCard({ destination, className = '' }: LuxuryDestinationCardProps) {
  const [saved, setSaved] = useState(false)
  const img = getDestinationHeroImage(destination)

  return (
    <div
      className={`group relative overflow-hidden rounded-xl bg-white transition-shadow duration-500 hover:shadow-lg ${className}`}
    >
      <div className="aspect-[4/5] overflow-hidden">
        <img
          src={img}
          alt={destination.name}
          width={800}
          height={1000}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      <div className="p-8">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-[#785a00]">
            {destination.country}
          </span>
          <button
            type="button"
            onClick={() => setSaved(!saved)}
            className="text-[#785a00] transition-opacity hover:opacity-80"
            aria-label={saved ? 'Remove from saved' : 'Save destination'}
          >
            <Heart className={`h-5 w-5 ${saved ? 'fill-current' : ''}`} strokeWidth={1.5} />
          </button>
        </div>
        <h3 className="mb-4 font-display text-3xl italic text-[#1b1c1a]">{destination.name}</h3>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-sans text-sm tracking-tight text-[#45464e]">Starting from</p>
            <p className="font-display text-xl font-bold text-[#1b1c1a]">
              {formatCurrency(destination.priceFromNgn, 'NGN')} / ${Number(destination.priceFromUsd).toLocaleString()}
            </p>
          </div>
          <Link
            to={`/destinations/${destination.id}`}
            className="flex shrink-0 items-center justify-center rounded-lg bg-[#041534] p-4 text-white transition-colors group-hover:bg-[#785a00]"
            aria-label={`View ${destination.name}`}
          >
            <ArrowRight className="h-5 w-5" strokeWidth={2} />
          </Link>
        </div>
      </div>
    </div>
  )
}
