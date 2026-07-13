import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowRight, Check, MessageCircle, Phone } from 'lucide-react'
import { SeoHelmet } from '../components/shared/SeoHelmet'
import { destinationsApi } from '../api/destinations.api'
import { contactApi } from '../api/contact.api'
import { cartApi } from '../api/cart.api'
import { formatCurrency } from '../utils/formatCurrency'
import type { Destination, Package } from '../types/destination.types'
import { getCountryFlag } from '../utils/countryFlags'
import { getDestinationHeroImage } from '../utils/destination-image.util'
import { toast } from '../hooks/use-toast'
import { useAuthStore } from '../stores/authStore'
import { useCartStore } from '../stores/cartStore'
import { clearPendingBundle, readPendingBundle, savePendingBundle } from '../utils/pending-bundle'
import {
  appendRequiredRowsForDestination,
  mergeRowsWithDestinationRequiredBundles,
  packageIsDestinationRequired,
} from '../utils/destination-bundle-required.util'

type SelectedPackage = { package: Package; destination: Destination }
type ExploreCard = {
  title: string
  image: string
  tag: string
}

const HERO_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDm30t-xuFW4S9hUYwnD8yIh0mBwR5ssRlpkYsIDD4HScaLm9zN3clCPR6yycQAi8M4n6Y_660QvkAHdFGRIca-1sUW-XoKbIQXAfzZBfOt0b-oI8t6GAC4S8Ig21lWVWCegd1ebK1TAef3IZLBQqLdYD9vWqyYwVkwlsa01HS2KgkwExslXCXC9_wwO68yNpDsZ0hsdqqh70Xsp26Dd9X0Zo72l0IlVqWAYhqUKU96Ue9ezKKv2xGRhmTz4UXNiEM5946ENrNIrejj'

const LUXURY_STAYS: { title: string; image: string }[] = [
  {
    title: 'Sky View Penthouse',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDXNluhqNP10QyO_lx25LOMMC_6m7EwxkNxjGrQuNJK5v0UvQFN62e3Y2WvWuurdp9tKsvdZ8x6qBMyXG5u5paFIB4WNdhYFOUQS6UxPRTCDtrejBM9mt9ygHd5P0iAJ2-gZNBXGA2KaWA8zc-byHktbG7QMH-ad-gtCgo8J34unXRm2wdHOok9lmM_SAM7fPW2kSGK1Q77SjqRxFdkJg9THiwHbcfolF8L6peSc0EhdpbvsvZAEVWKUsGbkbn-iiPMA1pdncUQ4V0z',
  },
  {
    title: 'Beach Crown Villa',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD4UuH1Fkbg76-2UdeH4oRwq9M5hnj-z7sk7dWaFd1PCgoVncGhR3n3iqliqfrLO9F4BDWuuQQ224COlReaen5gYhEfwpn7uHkSk9U8IFeuIcvZGaukPM-XrIB5ahcC1YeooKpuhiYPlDmkSUq-jcr0PO_WOIE2OW_FpOyr_Kc19oNdttsYLmVZPLOLUh0Qzz39RD2BWQ6QHFCOlORteSu08asXu5BwVsJKiONsAnoUCXWe7vfwnQ1SA1GixgYWhE9Q302a-nX0qnDJ',
  },
]

export function GetStarted() {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { isAuthenticated } = useAuthStore()
  const { setItems } = useCartStore()
  const preId = searchParams.get('destination')
  const [activeDestinationId, setActiveDestinationId] = useState<string>(preId ?? '')
  const [selected, setSelected] = useState<SelectedPackage[]>([])
  const [expert, setExpert] = useState({ name: '', email: '', budget: '', message: '' })
  const [expertSent, setExpertSent] = useState(false)
  const [pendingRestored, setPendingRestored] = useState(false)

  const { data: destinations = [] } = useQuery({
    queryKey: ['destinations', 'all-get-started'],
    queryFn: () => destinationsApi.getAll().then((r) => r.data.data),
  })

  const expertMutation = useMutation({
    mutationFn: () =>
      contactApi.submit({
        name: expert.name,
        email: expert.email,
        subject: 'Talk to the Experts — Get Started',
        message: expert.message,
        budget: expert.budget || undefined,
      }),
    onSuccess: () => {
      setExpertSent(true)
      setExpert({ name: '', email: '', budget: '', message: '' })
    },
  })

  const allPackages = useMemo(() => {
    const rows: SelectedPackage[] = []
    for (const d of destinations) {
      for (const p of d.packages || []) {
        rows.push({ package: p, destination: d })
      }
    }
    return rows
  }, [destinations])

  const curatedCards = useMemo<ExploreCard[]>(() => {
    return destinations.slice(0, 3).map((d) => ({
      title: d.name,
      image: getDestinationHeroImage(d),
      tag: d.country,
    }))
  }, [destinations])

  const filteredPackages = useMemo(() => {
    if (!activeDestinationId) return allPackages
    return allPackages.filter((row) => row.destination.id === activeDestinationId)
  }, [activeDestinationId, allPackages])

  const sortedFilteredPackages = useMemo(() => {
    const list = [...filteredPackages]
    list.sort((aRow, bRow) => {
      const aReq = packageIsDestinationRequired(aRow.package) ? 0 : 1
      const bReq = packageIsDestinationRequired(bRow.package) ? 0 : 1
      if (aReq !== bReq) return aReq - bReq
      return aRow.package.title.localeCompare(bRow.package.title)
    })
    return list
  }, [filteredPackages])

  const activeDestination = useMemo(() => {
    return destinations.find((d) => d.id === activeDestinationId) ?? null
  }, [activeDestinationId, destinations])

  const totals = useMemo(() => {
    const ngn = selected.reduce((s, x) => s + Number(x.package.priceNgn), 0)
    const usd = selected.reduce((s, x) => s + Number(x.package.priceUsd), 0)
    return { ngn, usd }
  }, [selected])

  const togglePackage = (row: SelectedPackage) => {
    if (packageIsDestinationRequired(row.package)) return
    const id = row.package.id
    setSelected((prev) => {
      const exists = prev.some((p) => p.package.id === id)
      if (exists) return prev.filter((p) => p.package.id !== id)
      const added = [...prev, row]
      return appendRequiredRowsForDestination(added, row.destination)
    })
  }

  /** When the active destination or its packages load, include required (`isRemovable: false`) bundle lines. */
  useEffect(() => {
    if (!activeDestination) return
    setSelected((prev) => appendRequiredRowsForDestination(prev, activeDestination))
  }, [activeDestination])

  const reserveCuratedBundle = async (rowsToReserve: SelectedPackage[]): Promise<void> => {
    const packageIds = rowsToReserve.map((row) => row.package.id)
    if (packageIds.length === 0) {
      toast({
        title: 'No package selected',
        description: 'Select at least one package to reserve your curated bundle.',
      })
      return
    }

    if (!isAuthenticated) {
      savePendingBundle({
        packageIds,
        sourcePath: '/get-started',
        destinationId: activeDestinationId || undefined,
        continueToCheckout: true,
      })
      toast({
        title: 'Login required',
        description: 'Sign in to continue your curated bundle reservation.',
      })
      navigate('/login', { state: { from: { pathname: '/get-started' }, intent: 'reserve-curated-bundle' } })
      return
    }

    try {
      const cartResponse = await cartApi.getCart()
      const existingIds = new Set(cartResponse.data.data.items.map((item) => item.packageId))
      const uniquePackageIds = Array.from(new Set(packageIds)).filter((id) => !existingIds.has(id))

      await Promise.all(uniquePackageIds.map((id) => cartApi.addItem({ packageId: id, quantity: 1 })))
      const updated = await cartApi.getCart()
      setItems(updated.data.data.items)
      await queryClient.invalidateQueries({ queryKey: ['cart'] })

      toast({
        variant: 'success',
        title: 'Bundle reserved',
        description: 'Your selected packages are now in your cart.',
      })
      navigate('/checkout')
    } catch {
      toast({
        variant: 'destructive',
        title: 'Reserve failed',
        description: 'We could not reserve your bundle right now. Please try again.',
      })
    }
  }

  useEffect(() => {
    if (pendingRestored || allPackages.length === 0) return
    const pending = readPendingBundle()
    if (!pending) {
      setPendingRestored(true)
      return
    }

    const restoredRows = allPackages.filter((row) => pending.packageIds.includes(row.package.id))
    const restoredWithRequired = mergeRowsWithDestinationRequiredBundles(restoredRows)
    if (restoredWithRequired.length > 0) {
      setSelected(restoredWithRequired)
      if (pending.destinationId) {
        setActiveDestinationId(pending.destinationId)
      }
      toast({
        title: 'Bundle restored',
        description: `${restoredWithRequired.length} package(s) in your curated bundle (including required items).`,
      })
    }
    clearPendingBundle()
    setPendingRestored(true)
  }, [allPackages, pendingRestored])

  useEffect(() => {
    if (!pendingRestored || !isAuthenticated) return
    const state = location.state as { resumeBundle?: boolean } | null
    if (!state?.resumeBundle || selected.length === 0) return
    void reserveCuratedBundle(selected)
  }, [isAuthenticated, location.state, pendingRestored, selected])

  return (
    <>
      <SeoHelmet
        title="Get started"
        description="Build your package and preview destinations with Starlings Hospitality."
      />

      <main className="bg-[#fbf9f5] pb-24 pt-32">
        <section className="mx-auto mb-20 grid max-w-screen-2xl grid-cols-12 items-center gap-8 px-6 md:px-12">
          <div className="col-span-12 lg:col-span-6">
            <p className="mb-5 font-sans text-xs font-bold uppercase tracking-[0.2em] text-[#785a00]">
              Start Your Journey
            </p>
            <h1 className="mb-6 font-display text-5xl leading-tight tracking-tight text-[#041534] lg:text-7xl">
              Your Experience, <br />
              Curated for You
            </h1>
            <p className="max-w-lg font-sans text-lg leading-relaxed text-[#45464e]">
              Build a trip that's tailored to you. Choose your destination, add the services you need, and see
              transparent pricing as you create your perfect experience.
            </p>
          </div>
          <div className="relative col-span-12 lg:col-span-6">
            <div className="aspect-[4/5] overflow-hidden rounded-xl bg-[#f5f3ef] shadow-2xl">
              <img
                src={activeDestination ? getDestinationHeroImage(activeDestination) : HERO_IMAGE}
                alt={activeDestination?.name ?? 'Curated travel experience'}
                width={800}
                height={1000}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-8 left-6 rounded-sm bg-[#785a00] px-6 py-3 text-white shadow-lg">
              <p className="font-sans text-2xl font-semibold leading-none">{selected.length || 1}x</p>
              <p className="mt-1 font-sans text-[10px] uppercase tracking-[0.18em]">Curated Packages</p>
            </div>
          </div>
        </section>

        <section className="mx-auto mb-20 max-w-screen-2xl px-6 md:px-12">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="font-display text-4xl text-[#041534]">Choose Your Destination</h2>
              <p className="mt-2 font-sans text-sm text-[#45464e]">
              Select a destination to view available packages, inclusions, and pricing.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {curatedCards.map((card) => {
              const matchingDestination = destinations.find((d) => d.name === card.title)
              const isActive = matchingDestination?.id === activeDestinationId
              return (
                <button
                  key={card.title}
                  type="button"
                  onClick={() => matchingDestination && setActiveDestinationId(matchingDestination.id)}
                  className={`group overflow-hidden rounded-xl border bg-white text-left transition-all ${
                    isActive ? 'border-[#785a00] shadow-md' : 'border-[#c5c6cf]/40 hover:border-[#785a00]/40'
                  }`}
                >
                  <div className="relative h-44">
                    <img src={card.image} alt={card.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-[0.16em] text-[#041534]">
                      {card.tag}
                    </span>
                  </div>
                  <div className="p-4">
                    <p className="mb-1 text-xl leading-none">{matchingDestination ? getCountryFlag(matchingDestination.country) : '🌍'}</p>
                    <p className="font-display text-xl text-[#041534]">{card.title}</p>
                    <p className="mt-1 font-sans text-xs uppercase tracking-[0.16em] text-[#6b7280]">
                      Curated preview
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        <section className="mx-auto max-w-screen-2xl border-y border-[#c5c6cf]/25 bg-[#fbf9f5] px-6 py-16 md:px-12">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <h3 className="font-display text-4xl text-[#041534]">Build Your Signature Stay</h3>
              {activeDestination ? (
                <p className="font-sans text-sm text-[#45464e]">
                  Showing packages for {activeDestination.name}. You can switch destination above anytime. Required
                  packages (configured with &ldquo;removable off&rdquo; in admin) stay in your bundle and cannot be unchecked.
                </p>
              ) : (
                <p className="font-sans text-sm text-[#45464e]">
                  all destinations. Pick a curated city above to focus the list — or toggle any optional add-on; required packages for that destination are added automatically and marked Required.
                </p>
              )}
              <div className="space-y-3">
                {sortedFilteredPackages.map(({ package: pkg, destination: dest }) => {
                const on = selected.some((s) => s.package.id === pkg.id)
                const isRequired = packageIsDestinationRequired(pkg)
                return (
                  <label
                    key={pkg.id}
                    className={`flex gap-3 rounded-xl border p-4 transition-colors ${
                      isRequired ? 'cursor-default' : 'cursor-pointer'
                    } ${
                      on ? 'border-[#785a00] bg-[#785a00]/5' : 'border-[#c5c6cf]/30 bg-white hover:border-[#785a00]/40'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={on}
                      disabled={isRequired}
                      onChange={() => togglePackage({ package: pkg, destination: dest })}
                      className="mt-1 h-4 w-4 rounded-sm border-[#c5c6cf] accent-[#041534] disabled:cursor-not-allowed disabled:opacity-60"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-sans text-sm font-semibold text-[#041534]">{pkg.title}</p>
                        {isRequired && (
                          <span className="rounded-full bg-[#041534] px-2 py-0.5 font-sans text-[10px] font-bold uppercase tracking-wider text-[#fdce5d]">
                            Required
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#6b7280]">{dest.name}</p>
                      <p className="mt-1 text-xs text-[#6b7280]">
                        Visa {pkg.includesVisa ? '✓' : '—'} · Flight {pkg.includesFlight ? '✓' : '—'} · Hotel{' '}
                        {pkg.includesHotel ? '✓' : '—'} · Activities {pkg.includesActivities ? '✓' : '—'}
                      </p>
                    </div>
                    <div className="ml-auto text-right text-sm">
                      <p className="font-bold text-[#785a00]">{formatCurrency(pkg.priceNgn, 'NGN')}</p>
                      <p className="text-[#6b7280]">${Number(pkg.priceUsd).toLocaleString()} USD</p>
                    </div>
                  </label>
                )
              })}
              </div>
            </div>
            <aside className="sticky top-28 h-fit rounded-xl bg-[#041534] p-6 text-white shadow-2xl">
              <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-[#fdce5d]">
                Estimated Total (NGN)
              </p>
              <div className="mb-5 border-b border-white/10 pb-5">
                <p className="font-sans text-xs uppercase tracking-[0.16em] text-white/60"></p>
                <p className="mt-1 font-display text-3xl">{formatCurrency(totals.ngn, 'NGN')}</p>
              </div>
              <div className="mb-6">
                <p className="font-sans text-xs uppercase tracking-[0.16em] text-white/60">USD Equivalent</p>
                <p className="mt-1 font-display text-xl">${totals.usd.toLocaleString()} USD</p>
              </div>
              <p className="mb-5 font-sans text-sm text-white/70">{selected.length} package(s) selected</p>
              <button
                type="button"
                disabled={selected.length === 0}
                onClick={() => {
                  void reserveCuratedBundle(selected)
                }}
                className="block w-full rounded-sm bg-[#785a00] py-3 text-center font-sans text-sm font-bold uppercase tracking-[0.14em] text-white transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {selected.length > 0 ? `Reserve ${selected.length} Package${selected.length > 1 ? 's' : ''}` : 'Proceed to Booking'}
              </button>
            </aside>
          </div>
        </section>

        <section className="mx-auto mt-14 max-w-screen-2xl px-6 md:mt-20 md:px-12">
          <div className="grid overflow-hidden rounded-2xl bg-[#041534] shadow-2xl md:grid-cols-2">
            <div className="p-8 md:p-12">
              <h2 className="font-display text-5xl leading-tight text-white">
                Can&apos;t decide? <br />
                We'll curate it for you.
              </h2>
              <p className="mt-5 max-w-md font-sans text-sm leading-relaxed text-white/80">
                Tell us what you're looking for, and we'll curate an itinerary around your schedule, preferences,
                and budget, thoughtfully planned from start to finish.
              </p>
              <div className="mt-8 flex gap-2">
                <a href="+234 812 322 8812"
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 font-sans text-sm text-white">
                  <Phone size={16} />
                  Call a Travel Expert
                </a>
                <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 font-sans text-sm text-white">
                  <MessageCircle size={16} />
                  Chat with Our Concierge
                </p>
              </div>
            </div>
            <div className="bg-[#f5f3ef] p-8 md:p-12">
              {expertSent && (
                <p className="mb-4 rounded-sm bg-green-100 px-3 py-2 font-sans text-sm text-green-700" role="status">
                  Thanks - your request was sent.
                </p>
              )}
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault()
                  expertMutation.mutate()
                }}
              >
                <div className="grid grid-cols-2 gap-3">
                  <input
                    id="expert-name"
                    required
                    placeholder="Your name"
                    className="w-full rounded-sm border border-[#c5c6cf]/50 bg-white px-3 py-2 text-sm outline-none focus:border-[#785a00]"
                    value={expert.name}
                    onChange={(e) => setExpert((s) => ({ ...s, name: e.target.value }))}
                  />
                  <input
                    id="expert-email"
                    type="email"
                    required
                    placeholder="Email address"
                    className="w-full rounded-sm border border-[#c5c6cf]/50 bg-white px-3 py-2 text-sm outline-none focus:border-[#785a00]"
                    value={expert.email}
                    onChange={(e) => setExpert((s) => ({ ...s, email: e.target.value }))}
                  />
                </div>
                <input
                  id="expert-budget"
                  placeholder="Estimated budget (optional)"
                  className="w-full rounded-sm border border-[#c5c6cf]/50 bg-white px-3 py-2 text-sm outline-none focus:border-[#785a00]"
                  value={expert.budget}
                  onChange={(e) => setExpert((s) => ({ ...s, budget: e.target.value }))}
                />
                <textarea
                  id="expert-msg"
                  required
                  rows={5}
                  placeholder="Tell us your travel goals and preferred style..."
                  className="w-full resize-none rounded-sm border border-[#c5c6cf]/50 bg-white px-3 py-2 text-sm outline-none focus:border-[#785a00]"
                  value={expert.message}
                  onChange={(e) => setExpert((s) => ({ ...s, message: e.target.value }))}
                />
                <button
                  type="submit"
                  disabled={expertMutation.isPending}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-[#041534] py-3 font-sans text-sm font-bold uppercase tracking-[0.14em] text-white transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {expertMutation.isPending ? 'Sending…' : 'Send request'}
                  <ArrowRight size={16} />
                </button>
              </form>
              <p className="mt-3 text-center font-sans text-xs text-[#6b7280]">Private request form</p>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-12 max-w-screen-2xl px-6 md:px-12">
          <h3 className="mb-6 font-display text-3xl text-[#041534]">Luxury Stays</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {LUXURY_STAYS.map((stay) => (
              <div key={stay.title} className="group relative h-52 overflow-hidden rounded-xl">
                <img src={stay.image} alt={stay.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#041534]/70 to-transparent" />
                <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white">
                  <Check size={16} className="text-[#fdce5d]" />
                  <p className="font-sans text-sm">{stay.title}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}
