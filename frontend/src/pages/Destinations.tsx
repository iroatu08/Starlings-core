import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ChevronDown, Star, X } from 'lucide-react';
import { SeoHelmet } from '../components/shared/SeoHelmet';
import { destinationsApi } from '../api/destinations.api';
import { useDebounce } from '../hooks/useDebounce';
import type { Destination } from '../types/destination.types';
import { formatCurrency } from '../utils/formatCurrency';
import { getDestinationHeroImage } from '../utils/destination-image.util';
import {
  countActiveBrowseFilters,
  DEFAULT_DESTINATION_BROWSE_FILTERS,
  DESTINATION_COUNTRIES,
  DURATION_FILTER_OPTIONS,
  filterDestinations,
  INCLUSION_FILTER_OPTIONS,
  parseDestinationFiltersFromSearchParams,
  PRICE_FILTER_OPTIONS,
  writeDestinationFiltersToSearchParams,
  type DestinationBrowseFilters,
  type DurationFilterId,
  type InclusionFilterId,
  type PriceFilterId,
} from '../utils/destination-filters.util';

/**
 * Browse and filter curated hospitality experiences.
 */
export function Destinations() {
  const [searchParams, setSearchParams] = useSearchParams();
  const resultsRef = useRef<HTMLElement>(null);

  const [search, setSearch] = useState(() => searchParams.get('q') ?? '');
  const [draftFilters, setDraftFilters] = useState<DestinationBrowseFilters>(() =>
    parseDestinationFiltersFromSearchParams(searchParams),
  );
  const [appliedFilters, setAppliedFilters] = useState<DestinationBrowseFilters>(() =>
    parseDestinationFiltersFromSearchParams(searchParams),
  );
  const [visibleCount, setVisibleCount] = useState(6);

  const debouncedSearch = useDebounce(search, 300);
  const activeFilterCount = countActiveBrowseFilters(appliedFilters);
  const hasPendingFilterChanges = JSON.stringify(draftFilters) !== JSON.stringify(appliedFilters);

  useEffect(() => {
    setVisibleCount(6);
  }, [appliedFilters, debouncedSearch]);

  useEffect(() => {
    setSearchParams((current) => {
      const trimmed = debouncedSearch.trim();
      const existing = current.get('q') ?? '';
      if (trimmed === existing) return current;

      const next = new URLSearchParams(current);
      if (trimmed) next.set('q', trimmed);
      else next.delete('q');
      return next;
    }, { replace: true });
  }, [debouncedSearch, setSearchParams]);

  const updateDraftFilters = (patch: Partial<DestinationBrowseFilters>): void => {
    setDraftFilters((current) => ({ ...current, ...patch }));
  };

  const applyFilters = (): void => {
    setAppliedFilters(draftFilters);
    const next = writeDestinationFiltersToSearchParams(searchParams, draftFilters);
    if (debouncedSearch.trim()) next.set('q', debouncedSearch.trim());
    else next.delete('q');
    setSearchParams(next, { replace: true });
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const clearBrowseFilters = (): void => {
    const reset = { ...DEFAULT_DESTINATION_BROWSE_FILTERS };
    setDraftFilters(reset);
    setAppliedFilters(reset);
    const next = writeDestinationFiltersToSearchParams(searchParams, reset);
    next.delete('q');
    setSearch('');
    setSearchParams(next, { replace: true });
  };

  const { data, isLoading } = useQuery({
    queryKey: ['destinations', appliedFilters.country],
    queryFn: () =>
      destinationsApi
        .getAll(appliedFilters.country !== 'All' ? { country: appliedFilters.country } : undefined)
        .then((r) => r.data.data),
  });

  const filtered = useMemo(
    () => filterDestinations(data ?? [], debouncedSearch, appliedFilters),
    [data, debouncedSearch, appliedFilters],
  );

  const visibleDestinations = filtered.slice(0, visibleCount);
  const canLoadMore = filtered.length > visibleDestinations.length;

  const activeFilterLabels = useMemo(() => {
    const labels: string[] = [];
    if (appliedFilters.country !== 'All') labels.push(appliedFilters.country);
    const price = PRICE_FILTER_OPTIONS.find((entry) => entry.id === appliedFilters.priceId);
    if (price && price.id !== 'all') labels.push(price.label);
    const inclusion = INCLUSION_FILTER_OPTIONS.find((entry) => entry.id === appliedFilters.activityId);
    if (inclusion && inclusion.id !== 'all') labels.push(inclusion.label);
    const duration = DURATION_FILTER_OPTIONS.find((entry) => entry.id === appliedFilters.durationId);
    if (duration && duration.id !== 'all') labels.push(duration.label);
    if (debouncedSearch.trim()) labels.push(`"${debouncedSearch.trim()}"`);
    return labels;
  }, [appliedFilters, debouncedSearch]);

  return (
    <>
      <SeoHelmet
        title="Experiences"
        description="Browse curated hospitality experiences across Nigeria, Ghana, and the UK. Find your perfect package and book with Starlings."
      />

      <main className="bg-[#fbf9f5] pb-24 pt-28">
        <section className="mx-auto mb-12 max-w-screen-2xl px-6 md:px-12">
          <div className="mb-8 max-w-3xl">
            <span className="mb-4 block font-sans text-sm uppercase tracking-[0.1em] text-[#785a00]">
              Curated Experiences
            </span>
            <h1 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.1] tracking-[-0.02em] text-[#041534]">
              Find Your Next Experience
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[#45464e]">
              Explore thoughtfully curated experiences across Lagos, Abeokuta, Accra, London, Brighton, Belfast, and more.
              Browse by destination, budget, or travel style to discover the experience that&apos;s right for you.
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-[0_8px_40px_-10px_rgba(27,28,26,0.04)] md:p-8">
            <input
              type="search"
              placeholder="Search by name, country, or description…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') applyFilters();
              }}
              className="mb-6 w-full rounded-md border border-[#c5c6cf]/40 bg-[#fbf9f5] px-4 py-3 text-base outline-none focus:border-[#785a00]"
              aria-label="Search experiences"
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              <div className="min-w-0">
                <label htmlFor="filter-country" className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-[#75777f]">
                  Country
                </label>
                <div className="relative">
                  <select
                    id="filter-country"
                    value={draftFilters.country}
                    onChange={(e) => updateDraftFilters({ country: e.target.value })}
                    className="w-full appearance-none border-b border-[#c5c6cf]/30 bg-transparent px-0 py-2 font-display text-lg text-[#041534] outline-none focus:border-[#785a00] focus:ring-0"
                  >
                    {DESTINATION_COUNTRIES.map((country) => (
                      <option key={country} value={country}>
                        {country === 'All' ? 'All Countries' : country}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-1 top-1/2 size-4 -translate-y-1/2 text-[#75777f]" />
                </div>
              </div>

              <div className="min-w-0">
                <label htmlFor="filter-price" className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-[#75777f]">
                  Price Range
                </label>
                <div className="relative">
                  <select
                    id="filter-price"
                    value={draftFilters.priceId}
                    onChange={(e) => updateDraftFilters({ priceId: e.target.value as PriceFilterId })}
                    className="w-full appearance-none border-b border-[#c5c6cf]/30 bg-transparent px-0 py-2 font-display text-lg text-[#041534] outline-none focus:border-[#785a00] focus:ring-0"
                  >
                    {PRICE_FILTER_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label === 'Any price' ? 'Any Budget' : option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-1 top-1/2 size-4 -translate-y-1/2 text-[#75777f]" />
                </div>
              </div>

              <div className="min-w-0">
                <label htmlFor="filter-inclusions" className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-[#75777f]">
                  Inclusions
                </label>
                <div className="relative">
                  <select
                    id="filter-inclusions"
                    value={draftFilters.activityId}
                    onChange={(e) => updateDraftFilters({ activityId: e.target.value as InclusionFilterId })}
                    className="w-full appearance-none border-b border-[#c5c6cf]/30 bg-transparent px-0 py-2 font-display text-lg text-[#041534] outline-none focus:border-[#785a00] focus:ring-0"
                  >
                    {INCLUSION_FILTER_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label === 'Any inclusions' ? 'All Inclusions' : option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-1 top-1/2 size-4 -translate-y-1/2 text-[#75777f]" />
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-4 border-t border-[#eae8e4] pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-[#75777f]">Duration</p>
                <div className="flex flex-wrap gap-2">
                  {DURATION_FILTER_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => updateDraftFilters({ durationId: option.id as DurationFilterId })}
                      className={`rounded-full px-4 py-1.5 text-xs transition-colors ${
                        draftFilters.durationId === option.id
                          ? 'bg-[#041534] text-white'
                          : 'bg-[#eae8e4] text-[#45464e] hover:bg-[#e4e2de]'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-3 sm:justify-end">
                {(activeFilterCount > 0 || debouncedSearch.trim()) && (
                  <button
                    type="button"
                    onClick={clearBrowseFilters}
                    className="inline-flex items-center gap-2 rounded-lg border border-[#c5c6cf]/50 px-5 py-3 font-sans text-sm uppercase tracking-[0.14em] text-[#45464e] transition-colors hover:border-[#785a00] hover:text-[#041534]"
                  >
                    <X size={14} aria-hidden />
                    Clear
                  </button>
                )}
                <button
                  type="button"
                  onClick={applyFilters}
                  className="rounded-lg bg-[#785a00] px-8 py-3 font-sans text-sm uppercase tracking-[0.18em] text-white transition-all hover:brightness-95"
                >
                  {hasPendingFilterChanges ? 'Apply filters' : 'Show results'}
                </button>
              </div>
            </div>

            {activeFilterLabels.length > 0 && (
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#75777f]">Active:</span>
                {activeFilterLabels.map((label) => (
                  <span
                    key={label}
                    className="rounded-full bg-[#f3f1ec] px-3 py-1 text-xs text-[#45464e]"
                  >
                    {label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        <section ref={resultsRef} className="mx-auto max-w-screen-2xl scroll-mt-28 px-6 md:px-12">
          {!isLoading && (
            <p className="mb-10 text-sm text-[#75777f]">
              {filtered.length} {filtered.length === 1 ? 'experience' : 'experiences'}
              {activeFilterCount > 0 || debouncedSearch.trim() ? ' matching your filters' : ' available'}
            </p>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 gap-x-12 gap-y-24 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-[460px] rounded-xl shimmer-bg" />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-x-12 gap-y-24 md:grid-cols-2 lg:grid-cols-3">
                {visibleDestinations.map((dest: Destination, i) => {
                  const imageUrl = getDestinationHeroImage(dest);
                  return (
                    <article key={dest.id} className={`group ${i % 3 === 1 ? 'md:mt-10' : ''}`}>
                      <div className="relative mb-6 aspect-[4/5] overflow-hidden">
                        <img
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          src={imageUrl}
                          alt={dest.name}
                          width={720}
                          height={900}
                          loading="lazy"
                          decoding="async"
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
                      <p className="mb-6 line-clamp-3 text-sm leading-relaxed text-[#45464e]">
                        {dest.description}
                      </p>
                      <div className="mb-8">
                        <div className="mb-1 text-xs text-[#75777f]">Starting from</div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl text-[#041534]">
                            {formatCurrency(dest.priceFromNgn, 'NGN')}
                          </span>
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
                  );
                })}
              </div>

              <div className="mt-24 text-center">
                <button
                  type="button"
                  disabled={!canLoadMore}
                  onClick={() => setVisibleCount((c) => c + 3)}
                  className="border-b border-[#041534]/30 pb-2 font-display text-xl text-[#041534] transition-all hover:border-[#785a00] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Load more experiences
                </button>
                <div className="mt-4 text-xs uppercase tracking-widest text-[#75777f]">
                  Displaying {visibleDestinations.length} of {filtered.length} experiences
                </div>
              </div>
            </>
          ) : (
            <div className="py-20 text-center">
              <h3 className="mb-2 font-display text-2xl text-[#041534]">No experiences found</h3>
              <p className="text-[#45464e]">Try adjusting your filters or contact us for a custom itinerary.</p>
              <button
                type="button"
                onClick={clearBrowseFilters}
                className="mt-6 mr-6 inline-block font-sans text-sm font-semibold uppercase tracking-widest text-[#785a00] underline underline-offset-8"
              >
                Clear filters
              </button>
              <Link
                to="/contact"
                className="mt-6 inline-block font-sans text-sm font-semibold uppercase tracking-widest text-[#785a00] underline underline-offset-8"
              >
                Talk to our team
              </Link>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
