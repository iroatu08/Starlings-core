import { useState, useEffect } from 'react'
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { ArrowLeft, MapPin, Clock, Users, DollarSign, Star } from 'lucide-react'
import { SeoHelmet } from '../components/shared/SeoHelmet'
import { Lightbox } from '../components/shared/Lightbox'
import { destinationsApi } from '../api/destinations.api'
import { reviewsApi } from '../api/reviews.api'
import { formatCurrency } from '../utils/formatCurrency'
import { getDestinationMapCenter } from '../utils/destinationMapCenter'
import { getDestinationHeroImage } from '../utils/destination-image.util'
import { useAuthStore } from '../stores/authStore'
import { useCart } from '../features/cart/useCart'

function getReviewSubmitError(err: unknown): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const res = (err as { response?: { data?: { message?: string | string[] } } }).response
    const msg = res?.data?.message
    if (typeof msg === 'string') return msg
    if (Array.isArray(msg)) return msg.join(', ')
  }
  return 'Could not submit your review. Please try again.'
}

export function DestinationDetail() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const { addItem, isAddingItem } = useCart()
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [rating, setRating] = useState(5)
  const [reviewBody, setReviewBody] = useState('')
  const [reviewFormError, setReviewFormError] = useState('')
  const [selectedPackageIds, setSelectedPackageIds] = useState<string[]>([])



  useEffect(() => {
    const proto = L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown }
    delete proto._getIconUrl
    L.Icon.Default.mergeOptions({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })
  }, [])

  const { data: destination, isLoading: destLoading, error: destError } = useQuery({
    queryKey: ['destination', id],
    queryFn: () => destinationsApi.getById(id!).then((r) => r.data.data),
    enabled: !!id,
  })

  useEffect(() => {
    if (!destination?.packages?.length) return
    setSelectedPackageIds(destination.packages.map((pkg) => pkg.id))
  }, [destination?.id, destination?.packages])

  const { data: reviewsPayload, isLoading: reviewsLoading, error: reviewsError } = useQuery({
    queryKey: ['destination-reviews', id],
    queryFn: () => reviewsApi.getForDestination(id!).then((r) => r.data.data),
    enabled: !!destination?.id,
  })

  const reviewMutation = useMutation({
    mutationFn: () => reviewsApi.create(id!, { rating, body: reviewBody.trim() }),
    onSuccess: () => {
      setReviewBody('')
      setRating(5)
      setReviewFormError('')
      queryClient.invalidateQueries({ queryKey: ['destination-reviews', id] })
    },
    onError: (err: unknown) => {
      setReviewFormError(getReviewSubmitError(err))
    },
  })

  if (destLoading) {
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

  if (destError || !destination) {
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
  const mapCenter = getDestinationMapCenter(destination.country, destination.latitude, destination.longitude)
  const reviews = reviewsPayload?.reviews ?? []
  const avgRating = reviewsPayload?.averageRating ?? 0
  const reviewCount = reviewsPayload?.count ?? 0

  const onReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setReviewFormError('')
    if (reviewBody.trim().length < 10) {
      setReviewFormError('Please write at least 10 characters.')
      return
    }
    reviewMutation.mutate()
  }

  const allPackages = destination.packages ?? []
  const selectedPackages = allPackages.filter((pkg) => selectedPackageIds.includes(pkg.id))
  const removedPackages = allPackages.filter((pkg) => !selectedPackageIds.includes(pkg.id))
  const runningTotalNgn = selectedPackages.reduce((sum, pkg) => sum + Number(pkg.priceNgn), 0)

  const togglePackage = (packageId: string) => {
    const target = allPackages.find((pkg) => pkg.id === packageId)
    if (!target || target.isRemovable === false) return
    setSelectedPackageIds((prev) => (
      prev.includes(packageId)
        ? prev.filter((idValue) => idValue !== packageId)
        : [...prev, packageId]
    ))
  }

  const addCustomizedBundleToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } })
      return
    }
    if (!destination.id || selectedPackageIds.length === 0) {
      return
    }
    await addItem({
      destinationId: destination.id,
      keptPackageIds: selectedPackageIds,
      removedPackageIds: removedPackages.map((pkg) => pkg.id),
    })
  }

  const heroImage = getDestinationHeroImage(destination)

  return (
    <>
      <SeoHelmet title={destination.name} description={destination.description} image={heroImage} />

      {/* Hero */}
      <div className="relative h-[65vh] min-h-[400px] overflow-hidden">
        <img
          src={heroImage}
          alt={destination.name}
          width={1920}
          height={1080}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 bg-navy/40" />

        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
          <div className="container-custom">
            <Link to="/destinations" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-4 transition-colors">
              <ArrowLeft size={16} /> Back to Experiences
            </Link>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
              <span className="inline-block bg-gold text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">
                {destination.country}
              </span>
              <h1 className="font-display text-4xl md:text-6xl font-bold text-white">{destination.name}</h1>
              <div className="flex flex-wrap gap-6 mt-4 text-white/80 text-sm">
                <span className="flex items-center gap-1">
                  <MapPin size={14} className="text-gold" />
                  {destination.country}
                </span>
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
                        type="button"
                        onClick={() => setLightboxIndex(i)}
                        className="aspect-square rounded-xl overflow-hidden hover:scale-105 transition-transform duration-300"
                      >
                        <img src={img.url} alt={img.altText || destination.name} className="w-full h-full object-cover" loading="lazy" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-10">
                <h2 className="font-display text-2xl font-bold text-navy mb-4 flex items-center gap-2">
                  <MapPin size={22} className="text-gold" />
                  Location
                </h2>
                <div className="rounded-2xl overflow-hidden border border-border shadow-sm h-64 z-0">
                  <MapContainer
                    center={mapCenter}
                    zoom={11}
                    className="h-full w-full z-0"
                    scrollWheelZoom={false}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={mapCenter}>
                      <Popup>{destination.name}</Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </div>

              <div className="mt-10">
                <div className="flex flex-wrap items-baseline justify-between gap-4 mb-4">
                  <h2 className="font-display text-2xl font-bold text-navy">Guest reviews</h2>
                  {!reviewsLoading && !reviewsError && reviewCount > 0 && (
                    <p className="text-slate text-sm">
                      <span className="text-gold font-semibold">{avgRating.toFixed(1)}</span>
                      {' '}average · {reviewCount} review{reviewCount === 1 ? '' : 's'}
                    </p>
                  )}
                </div>

                {reviewsError && (
                  <p className="text-slate text-sm mb-4">Reviews could not be loaded.</p>
                )}

                {reviewsLoading && (
                  <div className="space-y-3">
                    {[1, 2, 3].map((k) => (
                      <div key={k} className="h-24 rounded-xl shimmer-bg" />
                    ))}
                  </div>
                )}

                {!reviewsLoading && !reviewsError && reviews.length === 0 && (
                  <p className="text-slate text-sm">No reviews yet. Be the first to share your experience.</p>
                )}

                {!reviewsLoading && !reviewsError && reviews.length > 0 && (
                  <ul className="space-y-4">
                    {reviews.map((rev) => (
                      <li key={rev.id} className="bg-white border border-border rounded-xl p-5 shadow-sm">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="font-semibold text-navy">{rev.authorName}</span>
                          <span className="flex items-center gap-0.5 text-gold text-sm" aria-label={`${rev.rating} out of 5 stars`}>
                            {Array.from({ length: rev.rating }).map((_, i) => (
                              <Star key={i} size={14} fill="currentColor" />
                            ))}
                          </span>
                        </div>
                        <p className="text-xs text-slate mb-2">
                          {new Date(rev.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="text-slate text-sm leading-relaxed">{rev.body}</p>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-8 border border-border rounded-xl p-5 bg-white shadow-sm">
                  <h3 className="font-semibold text-navy mb-3">Leave a review</h3>
                  {isAuthenticated ? (
                    <form onSubmit={onReviewSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="review-rating" className="label-field">Rating</label>
                        <select
                          id="review-rating"
                          value={rating}
                          onChange={(e) => setRating(Number(e.target.value))}
                          className="input-field w-full max-w-xs"
                        >
                          {[5, 4, 3, 2, 1].map((n) => (
                            <option key={n} value={n}>{n} star{n === 1 ? '' : 's'}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="review-body" className="label-field">Your experience</label>
                        <textarea
                          id="review-body"
                          rows={4}
                          value={reviewBody}
                          onChange={(e) => setReviewBody(e.target.value)}
                          className="input-field w-full resize-y"
                          placeholder="Tell others what worked well (at least 10 characters)."
                          maxLength={2000}
                        />
                      </div>
                      {reviewFormError && (
                        <p className="text-red-600 text-sm">{reviewFormError}</p>
                      )}
                      <button
                        type="submit"
                        disabled={reviewMutation.isPending}
                        className="btn-primary"
                      >
                        {reviewMutation.isPending ? 'Submitting…' : 'Submit review'}
                      </button>
                    </form>
                  ) : (
                    <p className="text-slate text-sm">
                      <Link
                        to="/login"
                        state={{ from: location }}
                        className="text-gold font-semibold hover:underline"
                      >
                        Sign in
                      </Link>
                      {' '}to leave a review (one per destination).
                    </p>
                  )}
                </div>
              </div>
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
              
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Packages */}
      {destination.packages && destination.packages.length > 0 && (
        <section className="section-padding bg-white">
          <div className="container-custom">
            <h2 className="mb-4 font-display text-3xl font-bold text-navy">Customize Your Destination Bundle</h2>
            <p className="mb-8 max-w-3xl text-slate">
              Toggle removable packages to personalize your booking. Locked packages are required by the destination configuration.
            </p>
            <div className="space-y-4">
              {destination.packages.map((pkg) => {
                const isSelected = selectedPackageIds.includes(pkg.id)
                const isLocked = pkg.isRemovable === false
                return (
                  <div key={pkg.id} className={`rounded-xl border p-4 ${isSelected ? 'border-[#785a00]/40 bg-[#fffaf0]' : 'border-border bg-white'}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-navy">{pkg.title}</p>
                        <p className="mt-1 text-sm text-slate">{pkg.description}</p>
                        <p className="mt-2 text-sm font-semibold text-[#785a00]">{formatCurrency(pkg.priceNgn, 'NGN')}</p>
                      </div>
                      <label
                        htmlFor={`package-${pkg.id}`}
                        className={`custom-checkbox ${isLocked ? 'custom-checkbox--disabled' : ''}`}
                      >
                        <input
                          id={`package-${pkg.id}`}
                          type="checkbox"
                          checked={isSelected}
                          disabled={isLocked}
                          onChange={() => togglePackage(pkg.id)}
                        />
                        <span className="checkmark" aria-hidden />
                        <span className="custom-checkbox__label">
                          {isLocked ? 'Required' : isSelected ? 'Included' : 'Removed'}
                        </span>
                      </label>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-8 flex items-center justify-between rounded-xl border border-[#041534]/10 bg-[#fbf9f5] p-4">
              <p className="text-sm text-slate">Running total</p>
              <p className="font-display text-2xl text-[#041534]">{formatCurrency(runningTotalNgn, 'NGN')}</p>
            </div>

            <button
                  type="button"
                  onClick={() => {
                    void addCustomizedBundleToCart()
                  }}
                  disabled={isAddingItem || selectedPackageIds.length === 0}
                  className="btn-primary mt-6 w-fit text-center ml-auto flex disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isAddingItem ? 'Adding...' : 'Add Customized Bundle to Cart'}
                </button>
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
