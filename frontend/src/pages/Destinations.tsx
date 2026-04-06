import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Search, Filter } from 'lucide-react'
import { SeoHelmet } from '../components/shared/SeoHelmet'
import { DestinationCard } from '../components/shared/DestinationCard'
import { destinationsApi } from '../api/destinations.api'
import { useDebounce } from '../hooks/useDebounce'
import type { Destination } from '../types/destination.types'

const COUNTRIES = ['All', 'France', 'UK', 'Nigeria', 'USA', 'UAE', 'Canada']

export function Destinations() {
  const [selectedCountry, setSelectedCountry] = useState('All')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)

  const { data, isLoading } = useQuery({
    queryKey: ['destinations', selectedCountry],
    queryFn: () => destinationsApi.getAll(
      selectedCountry !== 'All' ? { country: selectedCountry } : undefined
    ),
    select: (res) => res.data.data,
  })

  const filtered = (data || []).filter(d =>
    d.name.toLowerCase().includes(debouncedSearch.toLowerCase())
  )

  return (
    <>
      <SeoHelmet
        title="Destinations"
        description="Explore our curated travel destinations across France, UK, Nigeria, USA, UAE, and Canada. Find your perfect package today."
      />

      {/* Hero */}
      <section className="relative h-72 md:h-96 overflow-hidden gradient-navy flex items-end">
        <img
          src="https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1920&q=80"
          alt="World destinations"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="relative container-custom pb-12 w-full">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-gold text-sm font-semibold tracking-widest uppercase mb-2">Explore</p>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white">
              Our Destinations
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="bg-white border-b border-border sticky top-16 md:top-20 z-30">
        <div className="container-custom py-4 flex flex-col sm:flex-row gap-4 items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
            <input
              type="search"
              placeholder="Search destinations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9 py-2 text-sm"
              id="destination-search"
            />
          </div>

          {/* Country Filters */}
          <div className="flex gap-2 flex-wrap">
            {COUNTRIES.map((country) => (
              <button
                key={country}
                onClick={() => setSelectedCountry(country)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCountry === country
                    ? 'bg-gold text-white'
                    : 'bg-off-white text-navy hover:bg-gold/10'
                }`}
              >
                {country}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="section-padding bg-off-white">
        <div className="container-custom">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-72 rounded-2xl shimmer-bg" />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <>
              <p className="text-slate text-sm mb-6">{filtered.length} destinations found</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((dest, i) => (
                  <DestinationCard key={dest.id} destination={dest} index={i} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">🌍</p>
              <h3 className="font-display text-2xl font-bold text-navy mb-2">No destinations found</h3>
              <p className="text-slate">Try a different filter or search term.</p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
