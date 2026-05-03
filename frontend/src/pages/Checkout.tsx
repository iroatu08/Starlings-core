import { Fragment, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Building2,
  ChevronDown,
  CreditCard,
  Lock,
  ShieldCheck,
  Wallet,
} from 'lucide-react'
import { SeoHelmet } from '../components/shared/SeoHelmet'
import { useAuthStore } from '../stores/authStore'
import { useCartStore } from '../stores/cartStore'
import { usePaystack } from '../features/payment/usePaystack'
import { formatCurrency } from '../utils/formatCurrency'
import type { Booking, BookingItem } from '../types/booking.types'
import type { CartItem } from '../types/cart.types'
import type { BookingTravelerPayload } from '../api/bookings.api'
import {
  groupBookingItemsByDestination,
  groupCartItemsByDestination,
  tripSummaryHeadlineFromBooking,
  tripSummaryHeadlineFromCart,
} from '../utils/trip-line-groups.util'

const ARRIVAL_SLOTS: readonly string[] = [
  '14:00 - 15:00',
  '15:00 - 16:00',
  '16:00 - 17:00',
  'Later than 18:00',
]

const PREFERENCE_OPTIONS = [
  'Quiet Room',
  'Dietary Restrictions',
  'Spa Treatment Inquiry',
  'Airport Pickup',
] as const

type PreferenceId = (typeof PREFERENCE_OPTIONS)[number]
interface AdditionalTraveler extends BookingTravelerPayload {
  uid: string
}

function editorialShadowClassName(): string {
  return 'shadow-[0_8px_40px_rgba(27,28,26,0.04)]'
}

function cartLineTitle(item: CartItem): string {
  const isBundle = Boolean(item.bundleSnapshot && item.destinationId)
  if (isBundle) {
    return `${item.destination?.name || 'Destination'} bundle`
  }
  return item.package?.title || item.destination?.name || 'Destination bundle'
}

function bookingLineTitle(line: BookingItem): string {
  const snap = line.bundleSnapshot
  const isBundle = Boolean(snap && line.destinationId)
  if (isBundle) {
    return `${line.destination?.name || line.package?.destination?.name || 'Destination'} bundle`
  }
  return line.package?.title || line.destination?.name || 'Booking item'
}

function heroImageFromCartItem(item: CartItem | undefined): string {
  if (!item) {
    return 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&q=80'
  }
  return (
    item.destination?.heroImageUrl ||
    item.package?.destination?.heroImageUrl ||
    'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&q=80'
  )
}

function heroImageFromBooking(booking: Booking): string {
  if (booking.imageUrl) return booking.imageUrl
  const first = booking.items[0]
  if (!first) {
    return 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&q=80'
  }
  return (
    first.destination?.heroImageUrl ||
    first.package?.destination?.heroImageUrl ||
    'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&q=80'
  )
}

function nightsLabelFromCart(items: CartItem[]): string {
  const days = items
    .map((i) => i.package?.durationDays)
    .filter((d): d is number => typeof d === 'number' && d > 0)
  const n = days.length ? Math.max(...days) : null
  if (n == null) return 'Flexible'
  return `${n} night${n === 1 ? '' : 's'}`
}

function nightsLabelFromBooking(booking: Booking): string {
  const days = booking.items
    .map((i) => i.package?.durationDays)
    .filter((d): d is number => typeof d === 'number' && d > 0)
  const n = days.length ? Math.max(...days) : null
  if (n == null) return 'Flexible'
  return `${n} night${n === 1 ? '' : 's'}`
}

interface StepIndicatorProps {
  step: 1 | 2
}

function StepIndicator({ step }: StepIndicatorProps) {
  const steps: { n: 1 | 2; label: string }[] = [
    { n: 1, label: 'Details' },
    { n: 2, label: 'Payment' },
  ]
  return (
    <div className="mb-12 flex flex-wrap items-center gap-3 sm:gap-6">
      {steps.map((s, idx) => {
        const active = step === s.n
        const done = step > s.n
        return (
          <Fragment key={s.n}>
            {idx > 0 ? (
              <div className="hidden h-px w-8 shrink-0 bg-editorial-outline-variant/30 sm:block" aria-hidden />
            ) : null}
            <div className="flex items-center gap-3">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  active || done
                    ? 'bg-editorial-primary text-white'
                    : 'border border-editorial-outline-variant text-editorial-on-surface-variant'
                }`}
              >
                {s.n}
              </span>
              <span
                className={`font-sans text-sm font-bold uppercase tracking-widest ${
                  active ? 'text-editorial-primary' : 'text-editorial-on-surface-variant'
                }`}
              >
                {s.label}
              </span>
            </div>
          </Fragment>
        )
      })}
    </div>
  )
}

interface OrderSummaryAsideProps {
  step: 1 | 2
  cartItems: CartItem[]
  booking: Booking | null
  subtotal: number
  bundleDiscount: number
  afterDiscount: number
}

function OrderSummaryAside({
  step,
  cartItems,
  booking,
  subtotal,
  bundleDiscount,
  afterDiscount,
}: OrderSummaryAsideProps) {
  const useBooking = step >= 2 && booking
  const imageUrl = useBooking
    ? heroImageFromBooking(booking)
    : heroImageFromCartItem(cartItems[0])
  const tripHeadline = useBooking
    ? tripSummaryHeadlineFromBooking(booking)
    : tripSummaryHeadlineFromCart(cartItems)
  const { title, subtitle, destinationCount } = tripHeadline
  const nights = useBooking ? nightsLabelFromBooking(booking) : nightsLabelFromCart(cartItems)
  const cartGroups = useMemo(() => groupCartItemsByDestination(cartItems), [cartItems])
  const bookingGroups = useMemo(
    () => (useBooking && booking ? groupBookingItemsByDestination(booking.items ?? []) : []),
    [useBooking, booking],
  )

  const sectionEyebrow =
    destinationCount > 1 ? 'Destinations' : 'Your trip'

  return (
    <aside className="lg:col-span-4">
      <div
        className={`sticky top-28 rounded-xl bg-white p-6 sm:p-8 lg:top-32 ${editorialShadowClassName()}`}
      >
        <div className="mb-8 aspect-[4/3] overflow-hidden rounded-lg">
          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="space-y-6">
          <div>
            <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-editorial-gold">
              {sectionEyebrow}
            </span>
            <h2 className="mt-1 font-display text-2xl text-editorial-primary">{title}</h2>
            {subtitle ? (
              <p className="mt-1 font-sans text-sm text-editorial-on-surface-variant">{subtitle}</p>
            ) : null}
          </div>
          <div className="grid grid-cols-2 gap-4 border-y border-editorial-outline-variant/15 py-6">
            <div>
              <span className="font-sans text-[10px] uppercase tracking-widest text-editorial-on-surface-variant">
                Check-in
              </span>
              <p className="font-display text-lg text-editorial-primary">After booking</p>
            </div>
            <div>
              <span className="font-sans text-[10px] uppercase tracking-widest text-editorial-on-surface-variant">
                Stay
              </span>
              <p className="font-display text-lg text-editorial-primary">{nights}</p>
            </div>
          </div>
          <div className="space-y-6">
            {useBooking
              ? bookingGroups.map((group) => (
                  <div key={group.destinationKey} className="space-y-2">
                    <p className="border-b border-editorial-outline-variant/20 pb-1 font-sans text-[10px] font-bold uppercase tracking-wider text-editorial-on-surface-variant">
                      {group.country ? `${group.destinationName} · ${group.country}` : group.destinationName}
                    </p>
                    {group.lines.map((line) => (
                      <div key={line.id} className="flex items-center justify-between gap-2">
                        <span className="text-editorial-on-surface-variant">
                          {bookingLineTitle(line)}
                          {line.quantity > 1 ? ` (×${line.quantity})` : ''}
                        </span>
                        <span className="shrink-0 font-display text-editorial-primary">
                          {formatCurrency(Number(line.unitPriceNgn) * line.quantity, 'NGN')}
                        </span>
                      </div>
                    ))}
                  </div>
                ))
              : cartGroups.map((group) => (
                  <div key={group.destinationKey} className="space-y-2">
                    <p className="border-b border-editorial-outline-variant/20 pb-1 font-sans text-[10px] font-bold uppercase tracking-wider text-editorial-on-surface-variant">
                      {group.country ? `${group.destinationName} · ${group.country}` : group.destinationName}
                    </p>
                    {group.lines.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-2">
                        <span className="text-editorial-on-surface-variant">
                          {cartLineTitle(item)}
                          {item.quantity > 1 ? ` (×${item.quantity})` : ''}
                        </span>
                        <span className="shrink-0 font-display text-editorial-primary">
                          {formatCurrency(Number(item.unitPriceNgn) * item.quantity, 'NGN')}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
            {!useBooking && bundleDiscount > 0 ? (
              <div className="flex items-center justify-between gap-2 text-green-800">
                <span className="font-sans text-sm">Multi-line savings (5%)</span>
                <span className="shrink-0 font-display">− {formatCurrency(bundleDiscount, 'NGN')}</span>
              </div>
            ) : null}
            <div className="flex items-center justify-between gap-2 border-t border-editorial-outline-variant/15 pt-4">
              <span className="font-sans text-sm font-bold uppercase tracking-widest text-editorial-primary">
                Total amount
              </span>
              <span className="font-display text-2xl text-editorial-gold">
                {formatCurrency(useBooking ? booking.totalAmountNgn : afterDiscount, 'NGN')}
              </span>
            </div>
            {!useBooking ? (
              <p className="font-sans text-xs text-editorial-on-surface-variant/80">
                Subtotal {formatCurrency(subtotal, 'NGN')}
                {bundleDiscount > 0 ? ` · includes bundle savings` : null}
              </p>
            ) : null}
          </div>
          <div className="mt-8 flex items-start gap-3 rounded-lg bg-editorial-surface-container-low p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-editorial-gold" aria-hidden />
            <p className="font-sans text-xs leading-relaxed text-editorial-on-surface-variant">
              Your booking is protected by the Starlings Concierge Guarantee. No hidden fees at check-in.
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}

function CheckoutLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[70vh] bg-editorial-surface pb-16 font-sans text-editorial-on-background">
      {children}
    </div>
  )
}

export function Checkout() {
  const [searchParams] = useSearchParams()
  const resumeBookingId = searchParams.get('resumeBooking')
  const { user } = useAuthStore()

  const items = useCartStore((s) => s.items)
  const subtotal = useCartStore((s) => s.totalAmount())
  const bundleDiscount = items.length >= 2 ? Math.round(subtotal * 0.05) : 0
  const afterDiscount = subtotal - bundleDiscount

  const {
    step,
    currentBooking,
    isProcessing,
    isCreatingBooking,
    createBooking,
    handlePayment,
    resumeError,
    isResumingBooking,
  } = usePaystack({ resumeBookingId })

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [arrivalSlot, setArrivalSlot] = useState<string>(ARRIVAL_SLOTS[0])
  const [additionalTravelers, setAdditionalTravelers] = useState<AdditionalTraveler[]>([])
  const [travelerError, setTravelerError] = useState<string | null>(null)
  const [preferences, setPreferences] = useState<Record<PreferenceId, boolean>>({
    'Quiet Room': false,
    'Dietary Restrictions': false,
    'Spa Treatment Inquiry': false,
    'Airport Pickup': false,
  })

  useEffect(() => {
    if (!user) return
    const combined = [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
    setFullName((prev) => (prev ? prev : combined))
    setEmail((prev) => (prev ? prev : user.email))
    setPhone((prev) => (prev ? prev : user.phone || ''))
  }, [user])

  const reservationSubtitle = useMemo(() => {
    if (!items.length) return 'Complete your details to continue.'
    return 'Complete your details for this reservation. Your concierge will coordinate every destination in your cart.'
  }, [items])

  const togglePreference = (id: PreferenceId) => {
    setPreferences((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const addTraveler = (): void => {
    setAdditionalTravelers((prev) => [
      ...prev,
      { uid: `${Date.now()}-${prev.length}`, firstName: '', lastName: '', email: '', phone: '' },
    ])
  }

  const updateTraveler = (uid: string, patch: Partial<AdditionalTraveler>): void => {
    setAdditionalTravelers((prev) => prev.map((traveler) => (
      traveler.uid === uid ? { ...traveler, ...patch } : traveler
    )))
  }

  const removeTraveler = (uid: string): void => {
    setAdditionalTravelers((prev) => prev.filter((traveler) => traveler.uid !== uid))
  }

  const buildTravelersPayload = (): BookingTravelerPayload[] | null => {
    const ownerNames = fullName.trim().split(/\s+/)
    const ownerFirstName = ownerNames[0] || ''
    const ownerLastName = ownerNames.slice(1).join(' ') || 'Traveler'
    if (!ownerFirstName || !email.trim()) {
      setTravelerError('Please provide your full name and email before continuing.')
      return null
    }

    const cleanedAdditional = additionalTravelers.map((traveler) => ({
      firstName: traveler.firstName.trim(),
      lastName: traveler.lastName.trim(),
      email: traveler.email?.trim() || undefined,
      phone: traveler.phone?.trim() || undefined,
    }))

    const hasIncomplete = cleanedAdditional.some((traveler) => !traveler.firstName || !traveler.lastName)
    if (hasIncomplete) {
      setTravelerError('Each added traveler must include first and last name.')
      return null
    }

    setTravelerError(null)
    return [
      {
        firstName: ownerFirstName,
        lastName: ownerLastName,
        email: email.trim(),
        phone: phone.trim(),
        isPrimary: true,
      },
      ...cleanedAdditional.map((traveler) => ({ ...traveler, isPrimary: false })),
    ]
  }

  return (
    <>
      <SeoHelmet title="Checkout" description="Complete your Starlings Hospitality booking." />

      <CheckoutLayout>
        <main className="mx-auto max-w-[1440px] px-6 pb-12 pt-24 sm:px-8 md:px-12 md:pt-28 lg:px-24 lg:pb-16">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            {isResumingBooking ? (
              <p className="font-sans text-editorial-on-surface-variant">Loading your booking…</p>
            ) : resumeError && resumeBookingId ? (
              <div className="mx-auto max-w-lg space-y-6 rounded-xl border border-editorial-outline-variant/30 bg-white p-8 shadow-sm">
                <p className="font-sans text-sm text-red-700" role="alert">
                  {resumeError}
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link
                    to="/dashboard/bookings"
                    className="rounded-md bg-editorial-primary px-6 py-3 text-center font-sans text-sm font-medium uppercase tracking-widest text-white transition-colors hover:bg-navy-600"
                  >
                    Back to My Bookings
                  </Link>
                  <Link
                    to="/destinations"
                    className="rounded-md border border-editorial-outline-variant px-6 py-3 text-center font-sans text-sm text-editorial-primary transition-colors hover:bg-editorial-surface-container-low"
                  >
                    Continue shopping
                  </Link>
                </div>
              </div>
            ) : items.length === 0 && step === 1 && !resumeBookingId ? (
              <div className="mx-auto max-w-md text-center">
                <h1 className="mb-3 font-display text-3xl text-editorial-primary">Your cart is empty</h1>
                <p className="mb-8 font-sans text-editorial-on-surface-variant">Add a destination or package to continue.</p>
                <Link
                  to="/destinations"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-editorial-primary px-8 py-3 font-sans text-sm font-medium uppercase tracking-widest text-white transition-colors hover:bg-navy-600"
                >
                  Continue shopping
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
                <div className="lg:col-span-8">
                  <StepIndicator step={step} />

                  {step === 1 ? (
                    <section className="space-y-12">
                      <header>
                        <h1 className="mb-2 font-display text-3xl text-editorial-primary sm:text-4xl">
                          Guest information
                        </h1>
                        <p className="font-sans text-lg font-light text-editorial-on-surface-variant">
                          {reservationSubtitle}
                        </p>
                      </header>
                      <form
                        className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2"
                        onSubmit={(e) => {
                          e.preventDefault()
                        }}
                      >
                        <div>
                          <label
                            htmlFor="checkout-full-name"
                            className="mb-2 block font-sans text-xs uppercase tracking-widest text-editorial-on-surface-variant"
                          >
                            Full name
                          </label>
                          <input
                            id="checkout-full-name"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            autoComplete="name"
                            className="w-full border-0 border-b border-editorial-outline-variant/30 bg-transparent py-3 font-sans text-lg font-light text-editorial-on-background placeholder:text-editorial-on-surface-variant/30 focus:border-editorial-gold focus:outline-none focus:ring-0"
                            placeholder="Your full name"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="checkout-email"
                            className="mb-2 block font-sans text-xs uppercase tracking-widest text-editorial-on-surface-variant"
                          >
                            Email address
                          </label>
                          <input
                            id="checkout-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            className="w-full border-0 border-b border-editorial-outline-variant/30 bg-transparent py-3 font-sans text-lg font-light text-editorial-on-background placeholder:text-editorial-on-surface-variant/30 focus:border-editorial-gold focus:outline-none focus:ring-0"
                            placeholder="you@example.com"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="checkout-phone"
                            className="mb-2 block font-sans text-xs uppercase tracking-widest text-editorial-on-surface-variant"
                          >
                            Phone number
                          </label>
                          <input
                            id="checkout-phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            autoComplete="tel"
                            className="w-full border-0 border-b border-editorial-outline-variant/30 bg-transparent py-3 font-sans text-lg font-light text-editorial-on-background placeholder:text-editorial-on-surface-variant/30 focus:border-editorial-gold focus:outline-none focus:ring-0"
                            placeholder="+234 …"
                          />
                        </div>
                        <div className="relative">
                          <label
                            htmlFor="checkout-arrival"
                            className="mb-2 block font-sans text-xs uppercase tracking-widest text-editorial-on-surface-variant"
                          >
                            Arrival time (approx.)
                          </label>
                          <select
                            id="checkout-arrival"
                            value={arrivalSlot}
                            onChange={(e) => setArrivalSlot(e.target.value)}
                            className="w-full cursor-pointer appearance-none border-0 border-b border-editorial-outline-variant/30 bg-transparent py-3 pr-8 font-sans text-lg font-light text-editorial-on-background focus:border-editorial-gold focus:outline-none focus:ring-0"
                          >
                            {ARRIVAL_SLOTS.map((slot) => (
                              <option key={slot} value={slot}>
                                {slot}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            className="pointer-events-none absolute bottom-3 right-0 h-5 w-5 text-editorial-on-surface-variant"
                            aria-hidden
                          />
                        </div>
                        <div className="mt-4 md:col-span-2">
                          <h3 className="mb-6 font-display text-2xl text-editorial-primary">
                            Preferences &amp; requests
                          </h3>
                          <div className="flex flex-wrap gap-3 sm:gap-4">
                            {PREFERENCE_OPTIONS.map((id) => (
                              <button
                                key={id}
                                type="button"
                                onClick={() => togglePreference(id)}
                                className={`rounded-full px-5 py-2.5 font-sans text-sm transition-all sm:px-6 sm:py-3 ${
                                  preferences[id]
                                    ? 'bg-editorial-primary text-white'
                                    : 'bg-[#eae8e4] text-editorial-on-surface-variant'
                                }`}
                              >
                                {id}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="mt-2 space-y-4 md:col-span-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-display text-2xl text-editorial-primary">Travelers</h3>
                            <button
                              type="button"
                              onClick={addTraveler}
                              className="rounded-md border border-editorial-outline-variant px-4 py-2 font-sans text-xs uppercase tracking-widest text-editorial-primary transition-colors hover:bg-editorial-surface-container-low"
                            >
                              Add traveler
                            </button>
                          </div>
                          <p className="font-sans text-sm text-editorial-on-surface-variant">
                            You are the primary traveler. Add anyone else that should receive their own notification.
                          </p>
                          {additionalTravelers.map((traveler, idx) => (
                            <div
                              key={traveler.uid}
                              className="grid grid-cols-1 gap-4 rounded-lg border border-editorial-outline-variant/25 p-4 md:grid-cols-2"
                            >
                              <input
                                type="text"
                                value={traveler.firstName}
                                onChange={(e) => updateTraveler(traveler.uid, { firstName: e.target.value })}
                                placeholder={`Traveler ${idx + 2} first name`}
                                className="w-full rounded-md border border-editorial-outline-variant/30 bg-transparent px-3 py-2 font-sans text-sm focus:border-editorial-gold focus:outline-none"
                              />
                              <input
                                type="text"
                                value={traveler.lastName}
                                onChange={(e) => updateTraveler(traveler.uid, { lastName: e.target.value })}
                                placeholder="Last name"
                                className="w-full rounded-md border border-editorial-outline-variant/30 bg-transparent px-3 py-2 font-sans text-sm focus:border-editorial-gold focus:outline-none"
                              />
                              <input
                                type="email"
                                value={traveler.email}
                                onChange={(e) => updateTraveler(traveler.uid, { email: e.target.value })}
                                placeholder="Email (optional)"
                                className="w-full rounded-md border border-editorial-outline-variant/30 bg-transparent px-3 py-2 font-sans text-sm focus:border-editorial-gold focus:outline-none"
                              />
                              <div className="flex gap-2">
                                <input
                                  type="tel"
                                  value={traveler.phone}
                                  onChange={(e) => updateTraveler(traveler.uid, { phone: e.target.value })}
                                  placeholder="Phone (optional)"
                                  className="w-full rounded-md border border-editorial-outline-variant/30 bg-transparent px-3 py-2 font-sans text-sm focus:border-editorial-gold focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeTraveler(traveler.uid)}
                                  className="rounded-md border border-red-300 px-3 py-2 font-sans text-xs uppercase tracking-widest text-red-600 transition-colors hover:bg-red-50"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ))}
                          {travelerError ? (
                            <p className="font-sans text-sm text-red-600">{travelerError}</p>
                          ) : null}
                        </div>
                        <div className="mt-8 flex flex-col-reverse items-stretch justify-between gap-6 border-t border-editorial-outline-variant/15 pt-10 md:col-span-2 md:flex-row md:items-center">
                          {resumeBookingId ? (
                            <Link
                              to="/dashboard/bookings"
                              className="font-sans text-sm text-editorial-on-surface-variant underline underline-offset-4 transition-colors hover:text-editorial-primary"
                            >
                              Back to My Bookings
                            </Link>
                          ) : (
                            <Link
                              to="/gallery"
                              className="font-sans text-sm text-editorial-on-surface-variant underline underline-offset-4 transition-colors hover:text-editorial-primary"
                            >
                              Return to Gallery
                            </Link>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              const travelers = buildTravelersPayload()
                              if (!travelers) return
                              void createBooking({ travelers })
                            }}
                            disabled={isCreatingBooking || items.length === 0}
                            className="group inline-flex items-center justify-center gap-2 rounded-md bg-editorial-primary px-8 py-3.5 font-sans text-sm font-medium uppercase tracking-widest text-white shadow-lg shadow-editorial-primary/10 transition-all hover:bg-navy-600 disabled:pointer-events-none disabled:opacity-50 sm:px-12 sm:py-4"
                          >
                            {isCreatingBooking ? 'Creating booking…' : 'Continue to payment'}
                            <ArrowRight
                              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                              aria-hidden
                            />
                          </button>
                        </div>
                      </form>
                    </section>
                  ) : null}

                  {step === 2 && currentBooking ? (
                    <section className="space-y-8">
                      <header>
                        <span className="font-sans text-sm font-medium uppercase tracking-widest text-editorial-gold">
                          Step 02
                        </span>
                        <h2 className="mt-2 font-display text-3xl text-editorial-primary sm:text-4xl">
                          Secure payment
                        </h2>
                        <p className="mt-2 font-sans text-sm text-editorial-on-surface-variant">
                          Reference{' '}
                          <span className="font-mono text-editorial-primary">{currentBooking.referenceNumber}</span>
                        </p>
                      </header>
                      <div
                        className={`overflow-hidden rounded-2xl border border-editorial-outline-variant/20 bg-white ${editorialShadowClassName()}`}
                      >
                        <div className="flex items-center justify-between bg-editorial-primary px-5 py-5 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white">
                              <CreditCard className="h-4 w-4 text-editorial-primary" aria-hidden />
                            </div>
                            <span className="font-sans font-medium text-white">Pay with Paystack</span>
                          </div>
                          <Lock className="h-4 w-4 text-white/60" aria-hidden />
                        </div>
                        <div className="space-y-6 p-6 sm:p-8">
                          <div className="border-b border-editorial-outline-variant/10 pb-6 text-center">
                            <p className="mb-1 font-sans text-sm text-editorial-on-surface-variant">
                              Paying Starlings Hospitality
                            </p>
                            <p className="font-display text-3xl font-bold text-editorial-primary">
                              {formatCurrency(currentBooking.totalAmountNgn, 'NGN')}
                            </p>
                          </div>
                          <div className="space-y-4">
                            <div className="flex cursor-default items-center justify-between rounded-lg border border-editorial-outline-variant p-4 transition-colors hover:bg-editorial-surface-container-low">
                              <div className="flex items-center gap-4">
                                <Wallet className="h-5 w-5 text-editorial-on-surface-variant" aria-hidden />
                                <span className="font-sans font-medium text-editorial-on-background">Card &amp; more</span>
                              </div>
                              <span className="font-sans text-xs uppercase tracking-widest text-editorial-on-surface-variant">
                                Paystack
                              </span>
                            </div>
                            <div className="flex cursor-not-allowed items-center justify-between rounded-lg border border-editorial-outline-variant/50 p-4 opacity-50">
                              <div className="flex items-center gap-4">
                                <Building2 className="h-5 w-5 text-editorial-on-surface-variant" aria-hidden />
                                <span className="font-sans font-medium text-editorial-on-background">
                                  Bank transfer
                                </span>
                              </div>
                              <span className="font-sans text-xs text-editorial-on-surface-variant">Unavailable</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => void handlePayment()}
                            disabled={isProcessing}
                            className="w-full rounded-md bg-editorial-primary py-3.5 font-sans text-sm font-medium uppercase tracking-widest text-white transition-colors hover:bg-navy-600 disabled:opacity-60"
                          >
                            {isProcessing ? 'Opening Paystack…' : 'Pay now'}
                          </button>
                          {resumeBookingId ? (
                            <Link
                              to="/dashboard/bookings"
                              className="block text-center font-sans text-sm text-editorial-on-surface-variant underline-offset-4 hover:text-editorial-primary hover:underline"
                            >
                              Back to My Bookings
                            </Link>
                          ) : (
                            <Link
                              to="/dashboard/cart"
                              className="block text-center font-sans text-sm text-editorial-on-surface-variant underline-offset-4 hover:text-editorial-primary hover:underline"
                            >
                              Back to cart
                            </Link>
                          )}
                          <p className="flex items-center justify-center gap-2 pt-2 font-sans text-[10px] uppercase tracking-widest text-editorial-on-surface-variant/60">
                            <Lock className="h-3.5 w-3.5" aria-hidden />
                            Secured by Paystack
                          </p>
                        </div>
                      </div>
                    </section>
                  ) : null}
                </div>

                {!(items.length === 0 && step === 1 && !resumeBookingId) && (step !== 1 || items.length > 0 || resumeBookingId) ? (
                  <OrderSummaryAside
                    step={step}
                    cartItems={items}
                    booking={currentBooking}
                    subtotal={subtotal}
                    bundleDiscount={bundleDiscount}
                    afterDiscount={afterDiscount}
                  />
                ) : null}
              </div>
            )}
          </motion.div>
        </main>
      </CheckoutLayout>
    </>
  )
}
