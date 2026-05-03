import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ChevronDown, Star } from 'lucide-react'
import { SeoHelmet } from '../components/shared/SeoHelmet'
import { destinationsApi } from '../api/destinations.api'
import { useDebounce } from '../hooks/useDebounce'
import type { Destination } from '../types/destination.types'
import { formatCurrency } from '../utils/formatCurrency'

const COUNTRIES = ['All', 'France', 'UK', 'Nigeria', 'USA', 'UAE', 'Canada'] as const

const PRICE_OPTIONS = [
  { id: 'all', label: 'Any price', max: Infinity },
  { id: '1m', label: 'Under ₦1M', max: 1_000_000 },
  { id: '2m', label: 'Under ₦2M', max: 2_000_000 },
  { id: '3m', label: 'Under ₦3M', max: 3_000_000 },
] as const

const ACTIVITY_OPTIONS = [
  { id: 'all', label: 'Any inclusions' },
  { id: 'visa', label: 'Visa support' },
  { id: 'flight', label: 'Flights' },
  { id: 'hotel', label: 'Hotels' },
  { id: 'activities', label: 'Activities' },
] as const

const DURATION_OPTIONS = [
  { id: 'all', label: 'All', max: Infinity },
  { id: '5', label: '3-5 Days', max: 5 },
  { id: '7', label: '7+ Days', max: 30 },
] as const

function matchesActivity(dest: Destination, activityId: string): boolean {
  if (activityId === 'all') return true
  const pkgs = dest.packages || []
  return pkgs.some((p) => {
    if (activityId === 'visa') return p.includesVisa
    if (activityId === 'flight') return p.includesFlight
    if (activityId === 'hotel') return p.includesHotel
    if (activityId === 'activities') return p.includesActivities
    return true
  })
}

function matchesDuration(dest: Destination, maxDays: number): boolean {
  if (maxDays === Infinity) return true
  const pkgs = dest.packages || []
  if (pkgs.length === 0) return true
  return pkgs.some((p) => p.durationDays <= maxDays)
}

export function Destinations() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedCountry, setSelectedCountry] = useState<string>('All')
  const [search, setSearch] = useState('')
  const [priceId, setPriceId] = useState<(typeof PRICE_OPTIONS)[number]['id']>('all')
  const [activityId, setActivityId] = useState<(typeof ACTIVITY_OPTIONS)[number]['id']>('all')
  const [durationId, setDurationId] = useState<(typeof DURATION_OPTIONS)[number]['id']>('all')
  const [visibleCount, setVisibleCount] = useState(3)
  const debouncedSearch = useDebounce(search, 300)

  useEffect(() => {
    const c = searchParams.get('country')
    if (c && COUNTRIES.includes(c as (typeof COUNTRIES)[number])) {
      setSelectedCountry(c)
    }
  }, [searchParams])

  useEffect(() => {
    setVisibleCount(3)
  }, [selectedCountry, priceId, activityId, durationId, debouncedSearch])

  const setCountry = (country: string) => {
    setSelectedCountry(country)
    const next = new URLSearchParams(searchParams)
    if (country === 'All') next.delete('country')
    else next.set('country', country)
    setSearchParams(next, { replace: true })
  }

  const { data, isLoading } = useQuery({
    queryKey: ['destinations', selectedCountry],
    queryFn: () =>
      destinationsApi
        .getAll(selectedCountry !== 'All' ? { country: selectedCountry } : undefined)
        .then((r) => r.data.data),
  })

  const priceMax = PRICE_OPTIONS.find((p) => p.id === priceId)?.max ?? Infinity
  const durationMax = DURATION_OPTIONS.find((d) => d.id === durationId)?.max ?? Infinity

  const filtered = useMemo(() => {
    let list: Destination[] = data || []
    list = list.filter((d) => d.name.toLowerCase().includes(debouncedSearch.toLowerCase()))
    if (priceMax !== Infinity) {
      list = list.filter((d) => Number(d.priceFromNgn) <= priceMax)
    }
    list = list.filter((d) => matchesActivity(d, activityId))
    list = list.filter((d) => matchesDuration(d, durationMax))
    return list
  }, [data, debouncedSearch, priceMax, activityId, durationMax])

  const visibleDestinations = filtered.slice(0, visibleCount)
  const canLoadMore = filtered.length > visibleDestinations.length

  return (
    <>
      <SeoHelmet
        title="Destinations"
        description="Explore our curated travel destinations across France, UK, Nigeria, USA, UAE, and Canada. Find your perfect package today."
      />

      <main className="bg-[#fbf9f5] pb-24 pt-32">
        <header className="mx-auto mb-20 grid max-w-screen-2xl items-end gap-12 px-6 md:grid-cols-2 md:px-12">
          <div>
            <span className="mb-4 block font-sans text-sm uppercase tracking-[0.1em] text-[#785a00]">
              Curated Experiences
            </span>
            <h1 className="font-display text-[clamp(3rem,8vw,5rem)] leading-[1.1] tracking-[-0.02em] text-[#041534]">
              Unveil the <br />
              Extraordinary.
            </h1>
            <p className="mt-8 max-w-md text-lg leading-relaxed text-[#45464e]">
              Discover handpicked sanctuaries across the globe, where architectural marvels meet the soul of the
              landscape.
            </p>
          </div>
          <div className="relative hidden aspect-[4/3] overflow-hidden rounded-xl md:block">
            <img
              className="h-full w-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCA_OLXftCfFeVISieo6tBqVY21tsSWejMwtYL9cTNrqXVish87yi8KXfA55RLSFdjMUV0yTYdPWSMevfrip9p6HPksa-Stftgvpj2-JuxRhBi8iNpTglAhPiNZzbsYgQc8ofincsjiiwDPCcDiuiRrQln2IESQ5RGzcDENzAbj1s8vxPBI-jCU-llx_CYbtNEOzJg4yw5ikk2upJO54j5SwCjRlJa3FZKxfuEyVkcYZDcszS9ROOd18MmSnChR2oxq3nfGy4Q5H4Dg"
              alt="Luxury infinity pool at dusk"
            />
            <div className="absolute inset-0 bg-[#041534]/10" />
          </div>
        </header>

        <section className="mx-auto mb-16 max-w-screen-2xl px-6 md:px-12">
          <div className="rounded-xl bg-white p-6 shadow-[0_8px_40px_-10px_rgba(27,28,26,0.04)] md:p-8">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:items-end">
              <div className="min-w-[180px]">
                <label className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-[#75777f]">Destination Country</label>
                <div className="relative">
                  <select
                    value={selectedCountry}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full appearance-none border-b border-[#c5c6cf]/30 bg-transparent px-0 py-2 font-display text-lg text-[#041534] outline-none focus:border-[#785a00] focus:ring-0"
                  >
                    {COUNTRIES.map((country) => (
                      <option key={country} value={country}>
                        {country === 'All' ? 'All Countries' : country}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-1 top-1/2 size-4 -translate-y-1/2 text-[#75777f]" />
                </div>
              </div>

              <div className="min-w-[180px]">
                <label className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-[#75777f]">Price Range</label>
                <div className="relative">
                  <select
                    value={priceId}
                    onChange={(e) => setPriceId(e.target.value as (typeof PRICE_OPTIONS)[number]['id'])}
                    className="w-full appearance-none border-b border-[#c5c6cf]/30 bg-transparent px-0 py-2 font-display text-lg text-[#041534] outline-none focus:border-[#785a00] focus:ring-0"
                  >
                    {PRICE_OPTIONS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label === 'Any price' ? 'Any Budget' : p.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-1 top-1/2 size-4 -translate-y-1/2 text-[#75777f]" />
                </div>
              </div>

              <div className="min-w-[180px]">
                <label className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-[#75777f]">Activity Type</label>
                <div className="relative">
                  <select
                    value={activityId}
                    onChange={(e) => setActivityId(e.target.value as (typeof ACTIVITY_OPTIONS)[number]['id'])}
                    className="w-full appearance-none border-b border-[#c5c6cf]/30 bg-transparent px-0 py-2 font-display text-lg text-[#041534] outline-none focus:border-[#785a00] focus:ring-0"
                  >
                    {ACTIVITY_OPTIONS.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.label === 'Any inclusions' ? 'All Activities' : a.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-1 top-1/2 size-4 -translate-y-1/2 text-[#75777f]" />
                </div>
              </div>

              <div className="min-w-[180px]">
                <label className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-[#75777f]">Duration</label>
                <div className="flex flex-wrap gap-2">
                  {DURATION_OPTIONS.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDurationId(d.id)}
                      className={`rounded-full px-4 py-1.5 text-xs transition-colors ${
                        durationId === d.id
                          ? 'bg-[#041534] text-white'
                          : 'bg-[#eae8e4] text-[#45464e] hover:bg-[#e4e2de]'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <button className="w-full rounded-lg bg-[#785a00] px-8 py-3 font-sans text-sm uppercase tracking-[0.18em] text-white transition-all hover:brightness-95">
                  Search
                </button>
              </div>
            </div>
            <input
              type="search"
              placeholder="Search destination name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mt-6 w-full rounded-md border border-[#c5c6cf]/40 bg-[#fbf9f5] px-4 py-2 text-sm outline-none focus:border-[#785a00]"
            />
          </div>
        </section>

        <section className="mx-auto max-w-screen-2xl px-6 md:px-12">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-x-12 gap-y-24 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-[460px] rounded-xl shimmer-bg" />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-x-12 gap-y-24 md:grid-cols-2 lg:grid-cols-3">
                {visibleDestinations.map((dest, i) => (
                  <article key={dest.id} className={`group ${i % 3 === 1 ? 'md:mt-10' : ''}`}>
                    <div className="relative mb-6 aspect-[4/5] overflow-hidden">
                      <img
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        src={dest.heroImageUrl || 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=900&q=80'}
                        alt={dest.name}
                      />
                      <div className="absolute left-6 top-6">
                        <span className="bg-white/90 px-4 py-2 text-[10px] uppercase tracking-widest backdrop-blur">
                          {dest.country}
                        </span>
                      </div>
                    </div>
                    <div className="mb-4 flex items-start justify-between">
                      <h3 className="font-display text-2xl text-[#041534]">{dest.name}</h3>
                      <div className="flex items-center text-[#785a00]">
                        <Star size={14} className="fill-current" />
                        <span className="ml-1 font-display text-sm">{dest.isFeatured ? '5.0' : '4.8'}</span>
                      </div>
                    </div>
                    <p className="mb-6 line-clamp-3 text-sm leading-relaxed text-[#45464e]">{dest.description}</p>
                    <div className="mb-8">
                      <div className="mb-1 text-xs text-[#75777f]">Starting from</div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl text-[#041534]">{formatCurrency(dest.priceFromNgn, 'NGN')}</span>
                        <span className="text-sm italic text-[#45464e]">
                          (${Number(dest.priceFromUsd).toLocaleString()} USD)
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <Link
                        to={`/destinations/${dest.id}`}
                        className="flex-1 border-b-2 border-[#041534]/10 py-4 text-center text-sm text-[#041534] transition-all hover:border-[#785a00]"
                      >
                        View Details
                      </Link>
                      <Link
                        to={`/get-started?destination=${encodeURIComponent(dest.id)}`}
                        className="flex-1 rounded-lg bg-[#041534] py-4 text-center text-xs uppercase tracking-widest text-white transition-all hover:bg-[#1b2a4a]"
                      >
                        Quick Book
                      </Link>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-24 text-center">
                <button
                  type="button"
                  disabled={!canLoadMore}
                  onClick={() => setVisibleCount((c) => c + 3)}
                  className="border-b border-[#041534]/30 pb-2 font-display text-xl text-[#041534] transition-all hover:border-[#785a00] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Load More Destinations
                </button>
                <div className="mt-4 text-xs uppercase tracking-widest text-[#75777f]">
                  Displaying {visibleDestinations.length} of {filtered.length} Curated Packages
                </div>
              </div>
            </>
          ) : (
            <div className="py-20 text-center">
              <h3 className="mb-2 font-display text-2xl text-[#041534]">No destinations found</h3>
              <p className="text-[#45464e]">Try adjusting your filters.</p>
            </div>
          )}
        </section>
      </main>
    </>
  )
}
