import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { SeoHelmet } from '../components/shared/SeoHelmet'
import { galleryApi } from '../api/gallery.api'
import { destinationsApi } from '../api/destinations.api'
import { Lightbox } from '../components/shared/Lightbox'

const PAGE_SIZE = 16

function GalleryImageTile({
  url,
  alt,
  country,
  title,
  onClick,
}: {
  url: string
  alt: string
  country?: string
  title?: string
  onClick: () => void
}) {
  const [loaded, setLoaded] = useState(false)

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative mb-6 w-full break-inside-avoid overflow-hidden rounded-xl bg-white text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-[#785a00]"
    >
      <div className="relative bg-[#f5f3ef]">
        {!loaded && <div className="aspect-[4/3] shimmer-bg w-full" aria-hidden />}
        <img
          src={`${url}${url.includes('?') ? '&' : '?'}w=600&q=70`}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={`h-auto w-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 ${
            loaded ? 'opacity-100 blur-0' : 'absolute inset-0 opacity-0 blur-xl'
          }`}
        />
      </div>

      {(country || title) && (
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-[#041534]/80 via-transparent to-transparent p-6 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          {country && (
            <span className="mb-2 font-sans text-xs font-bold uppercase tracking-[0.22em] text-[#ffdf9a]">
              {country}
            </span>
          )}
          {title && <h3 className="font-display text-2xl text-white">{title}</h3>}
        </div>
      )}
    </button>
  )
}

export function Gallery() {
  const [selectedCountry, setSelectedCountry] = useState<string>('all')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const { data: destinations = [] } = useQuery({
    queryKey: ['destinations', 'gallery-filter'],
    queryFn: () => destinationsApi.getAll().then((r) => r.data.data),
  })

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['gallery-pages', 'all'],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      galleryApi
        .getPage({
          page: pageParam,
          limit: PAGE_SIZE,
        })
        .then((r) => r.data.data),
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
  })

  const flatImages = data?.pages.flatMap((p) => p.data) ?? []

  const countries = useMemo(() => {
    const unique = new Set<string>()
    destinations.forEach((d) => {
      if (d.country) unique.add(d.country)
    })
    return Array.from(unique).sort((a, b) => a.localeCompare(b))
  }, [destinations])

  const filteredImages = useMemo(() => {
    if (selectedCountry === 'all') return flatImages
    return flatImages.filter((img) => img.destination?.country === selectedCountry)
  }, [flatImages, selectedCountry])

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore()
      },
      { rootMargin: '200px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [loadMore])

  return (
    <>
      <SeoHelmet
        title="Gallery"
        description="Travel inspiration from destinations we love — Starlings Hospitality gallery."
      />

      <main className="bg-[#fbf9f5] pb-24 pt-32">
        <section className="mx-auto mb-12 max-w-screen-2xl px-6 md:mb-16 md:px-12">
          <div className="max-w-3xl">
            <span className="mb-4 block font-sans text-sm font-bold uppercase tracking-[0.2em] text-[#785a00]">
              Visual Chronicles
            </span>
            <h1 className="mb-8 font-display text-5xl leading-tight tracking-tight text-[#041534] md:text-7xl">
              Capturing the <br />
              <span className="italic">Sublime</span> Moments.
            </h1>
            <p className="max-w-xl font-sans text-lg leading-relaxed text-[#45464e]">
              Explore our curated collection of extraordinary stays across the globe. From the Haussmann facades of Paris
              to the shimmering skylines of Dubai.
            </p>
          </div>
        </section>

        <section
          className="mx-auto mb-10 max-w-screen-2xl overflow-x-auto px-6 md:mb-12 md:px-12"
          aria-label="Gallery filters"
        >
          <div className="flex min-w-max items-center gap-3 pb-3">
            <button
              type="button"
              onClick={() => setSelectedCountry('all')}
              className={`rounded-full px-6 py-2.5 font-sans text-sm font-medium transition-colors ${
                selectedCountry === 'all'
                  ? 'bg-[#041534] text-white'
                  : 'bg-[#eae8e4] text-[#45464e] hover:bg-[#e4e2de]'
              }`}
            >
              All Collections
            </button>
            {countries.map((country) => (
              <button
                key={country}
                type="button"
                onClick={() => setSelectedCountry(country)}
                className={`rounded-full px-6 py-2.5 font-sans text-sm font-medium transition-colors ${
                  selectedCountry === country
                    ? 'bg-[#041534] text-white'
                    : 'bg-[#eae8e4] text-[#45464e] hover:bg-[#e4e2de]'
                }`}
              >
                {country}
              </button>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-screen-2xl px-6 md:px-12" aria-label="Gallery masonry">
          {isLoading ? (
            <div className="columns-1 gap-6 md:columns-2 lg:columns-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="mb-6 h-56 break-inside-avoid rounded-xl shimmer-bg" />
              ))}
            </div>
          ) : filteredImages.length === 0 ? (
            <p className="py-16 text-center font-sans text-[#041534]">No gallery images yet.</p>
          ) : (
            <>
              <div className="columns-1 gap-6 md:columns-2 lg:columns-3">
                {filteredImages.map((img, i) => (
                  <GalleryImageTile
                    key={img.id}
                    url={img.url}
                    alt={img.altText || img.destination?.name || 'Gallery'}
                    country={img.destination?.country}
                    title={img.destination?.name}
                    onClick={() => setLightboxIndex(i)}
                  />
                ))}
              </div>
              <div ref={sentinelRef} className="h-8 w-full" />
              {isFetchingNextPage && (
                <p className="py-4 text-center font-sans text-sm text-[#041534]">Loading more…</p>
              )}
            </>
          )}
        </section>
      </main>

      {lightboxIndex !== null && filteredImages.length > 0 && (
        <Lightbox
          images={filteredImages.map((img) => ({ url: img.url, altText: img.altText }))}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  )
}
