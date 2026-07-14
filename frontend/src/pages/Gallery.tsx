import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { SeoHelmet } from '../components/shared/SeoHelmet'
import { galleryApi } from '../api/gallery.api'
import { destinationsApi } from '../api/destinations.api'
import { Lightbox } from '../components/shared/Lightbox'

/** Images fetched per page — large enough that a typical viewport still gets an early load-more. */
const PAGE_SIZE = 24

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
      className="group relative mb-6 w-full break-inside-avoid overflow-hidden rounded-xl border border-brand-outline bg-brand-white text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"
    >
      <div className="relative bg-brand-surface">
        {!loaded && <div className="aspect-[4/3] w-full shimmer-bg" aria-hidden />}
        <img
          src={`${url}${url.includes('?') ? '&' : '?'}w=600&q=70`}
          alt={alt}
          width={600}
          height={450}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={`h-auto w-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 ${
            loaded ? 'opacity-100 blur-0' : 'absolute inset-0 opacity-0 blur-xl'
          }`}
        />
      </div>

      {(country || title) && (
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-brand-teal/80 via-transparent to-transparent p-6 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          {country && (
            <span className="mb-2 font-sans text-xs font-bold uppercase tracking-[0.22em] text-brand-sky">
              {country}
            </span>
          )}
          {title && <h3 className="font-display text-2xl text-white">{title}</h3>}
        </div>
      )}
    </button>
  )
}

/**
 * Public travel gallery with infinite scroll over all uploaded images.
 */
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
    isError,
  } = useInfiniteQuery({
    queryKey: ['gallery-pages', 'all', PAGE_SIZE],
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
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  // Re-bind observer whenever the sentinel mounts after loading (was missing previously).
  useEffect(() => {
    const el = sentinelRef.current
    if (!el || isLoading) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore()
      },
      { rootMargin: '400px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMore, isLoading, filteredImages.length])

  // If the first page is short enough that the sentinel never scrolls into view, still keep fetching.
  useEffect(() => {
    if (isLoading || isFetchingNextPage || !hasNextPage) return
    const el = sentinelRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const nearViewport = rect.top < window.innerHeight + 400
    if (nearViewport) loadMore()
  }, [isLoading, isFetchingNextPage, hasNextPage, filteredImages.length, loadMore])

  return (
    <>
      <SeoHelmet
        title="Gallery"
        description="See the experience — lifestyle moments from curated travel across Nigeria, Ghana, and the UK."
      />

      <main className="bg-brand-surface pb-24 pt-32">
        <section className="mx-auto mb-12 max-w-screen-2xl px-6 md:mb-16 md:px-12">
          <div className="max-w-3xl">
            <span className="mb-4 block font-sans text-sm font-bold uppercase tracking-[0.2em] text-brand-teal">
              TRAVEL GALLERY
            </span>
            <h1 className="mb-8 font-display text-5xl leading-tight tracking-tight text-brand-black md:text-7xl">
              See the Experience
            </h1>
            <p className="max-w-xl font-sans text-lg leading-relaxed text-brand-muted">
              Lifestyle moments from our curated experiences across Nigeria, Ghana, and the UK.
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
                  ? 'bg-brand-teal text-white'
                  : 'bg-brand-surface-low text-brand-muted hover:bg-brand-outline'
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
                    ? 'bg-brand-teal text-white'
                    : 'bg-brand-surface-low text-brand-muted hover:bg-brand-outline'
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
          ) : isError ? (
            <p className="py-16 text-center font-sans text-brand-red">
              Could not load gallery images. Please try again.
            </p>
          ) : filteredImages.length === 0 ? (
            <p className="py-16 text-center font-sans text-brand-black">No gallery images yet.</p>
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

              <div ref={sentinelRef} className="h-8 w-full" aria-hidden />

              {isFetchingNextPage && (
                <p className="py-4 text-center font-sans text-sm text-brand-muted">Loading more…</p>
              )}

              {hasNextPage && !isFetchingNextPage && (
                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={loadMore}
                    className="rounded-lg bg-brand-teal px-8 py-3 font-sans text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-brand-teal-dark"
                  >
                    Load more
                  </button>
                </div>
              )}

              {!hasNextPage && flatImages.length > 0 && (
                <p className="mt-8 text-center font-sans text-xs uppercase tracking-widest text-brand-muted">
                  Showing all {filteredImages.length} images
                  {selectedCountry !== 'all' ? ` in ${selectedCountry}` : ''}
                </p>
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
