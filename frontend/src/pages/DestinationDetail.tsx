import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, MapPin, Clock, Users, DollarSign } from 'lucide-react'
import { SeoHelmet } from '../components/shared/SeoHelmet'
import { PackageCard } from '../components/shared/PackageCard'
import { Lightbox } from '../components/shared/Lightbox'
import { destinationsApi } from '../api/destinations.api'
import { formatCurrency } from '../utils/formatCurrency'

export function DestinationDetail() {
  const { id } = useParams<{ id: string }>()
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const { data: destination, isLoading, error } = useQuery({
    queryKey: ['destination', id],
    queryFn: () => destinationsApi.getById(id!).then(r => r.data.data),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-off-white">
        <div className="h-[60vh] shimmer-bg" />
        <div className="container-custom py-12 space-y-6">
          <div className="h-10 w-64 rounded shimmer-bg" />
          <div className="h-4 w-full rounded shimmer-bg" />
          <div className="h-4 w-3/4 rounded shimmer-bg" />
        </div>
      </div>
    )
  }

  if (error || !destination) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-navy mb-4">Destination not found</h1>
          <Link to="/destinations" className="btn-primary">Browse All Destinations</Link>
        </div>
      </div>
    )
  }

  const galleryImages = destination.galleryImages || []

  return (
    <>
      <SeoHelmet title={destination.name} description={destination.description} image={destination.heroImageUrl} />

      {/* Hero */}
      <div className="relative h-[65vh] min-h-[400px] overflow-hidden">
        <img
          src={destination.heroImageUrl || 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1920&q=80'}
          alt={destination.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 bg-navy/40" />

        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <div className="container-custom">
            <Link to="/destinations" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-4 transition-colors">
              <ArrowLeft size={16} /> Back to Destinations
            </Link>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
              <span className="inline-block bg-gold text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">
                {destination.country}
              </span>
              <h1 className="font-display text-4xl md:text-6xl font-bold text-white">{destination.name}</h1>
              <div className="flex flex-wrap gap-6 mt-4 text-white/80 text-sm">
                <span className="flex items-center gap-1">
                  <DollarSign size={14} className="text-gold" />
                  From {formatCurrency(destination.priceFromNgn, 'NGN')}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} className="text-gold" />
                  7–14 day packages
                </span>
                <span className="flex items-center gap-1">
                  <Users size={14} className="text-gold" />
                  {destination.packages?.length || 0} packages available
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content */}
      <section className="section-padding bg-off-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Description */}
            <div className="lg:col-span-2">
              <h2 className="font-display text-2xl font-bold text-navy mb-4">Overview</h2>
              <p className="text-slate leading-loose">{destination.description}</p>

              {/* Gallery */}
              {galleryImages.length > 0 && (
                <div className="mt-10">
                  <h2 className="font-display text-2xl font-bold text-navy mb-4">Gallery</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {galleryImages.slice(0, 6).map((img, i) => (
                      <button
                        key={img.id}
                        onClick={() => setLightboxIndex(i)}
                        className="aspect-square rounded-xl overflow-hidden hover:scale-105 transition-transform duration-300"
                      >
                        <img src={img.url} alt={img.altText || destination.name} className="w-full h-full object-cover" loading="lazy" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-md sticky top-28">
                <h3 className="font-display text-lg font-bold text-navy mb-4">Quick Info</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate">Country</span>
                    <span className="font-semibold text-navy">{destination.country}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate">Packages</span>
                    <span className="font-semibold text-navy">{destination.packages?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate">Price (NGN)</span>
                    <span className="font-semibold text-gold">{formatCurrency(destination.priceFromNgn, 'NGN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate">Price (USD)</span>
                    <span className="font-semibold text-navy">${destination.priceFromUsd.toLocaleString()}</span>
                  </div>
                </div>
                <Link to="/get-started" className="btn-primary w-full text-center block mt-6">
                  Build My Package
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Packages */}
      {destination.packages && destination.packages.length > 0 && (
        <section className="section-padding bg-white">
          <div className="container-custom">
            <h2 className="font-display text-3xl font-bold text-navy mb-8">Available Packages</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {destination.packages.map((pkg, i) => (
                <PackageCard key={pkg.id} pkg={{ ...pkg, destination }} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            images={galleryImages}
            initialIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
