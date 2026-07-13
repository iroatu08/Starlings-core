import type { Destination } from '../types/destination.types'

export const DESTINATION_COUNTRIES = ['All', 'Nigeria', 'Ghana', 'UK'] as const

export type DestinationCountry = (typeof DESTINATION_COUNTRIES)[number]

export const PRICE_FILTER_OPTIONS = [
  { id: 'all', label: 'Any price', max: Infinity },
  { id: '1m', label: 'Under ₦1M', max: 1_000_000 },
  { id: '2m', label: 'Under ₦2M', max: 2_000_000 },
  { id: '3m', label: 'Under ₦3M', max: 3_000_000 },
] as const

export type PriceFilterId = (typeof PRICE_FILTER_OPTIONS)[number]['id']

export const INCLUSION_FILTER_OPTIONS = [
  { id: 'all', label: 'Any inclusions' },
  { id: 'visa', label: 'Visa support' },
  { id: 'flight', label: 'Flights' },
  { id: 'hotel', label: 'Hotels' },
  { id: 'activities', label: 'Activities' },
] as const

export type InclusionFilterId = (typeof INCLUSION_FILTER_OPTIONS)[number]['id']

export const DURATION_FILTER_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'short', label: '3–5 Days', minDays: 3, maxDays: 5 },
  { id: 'long', label: '7+ Days', minDays: 7, maxDays: Infinity },
] as const

export type DurationFilterId = (typeof DURATION_FILTER_OPTIONS)[number]['id']

export type DestinationBrowseFilters = {
  country: DestinationCountry | string
  priceId: PriceFilterId
  activityId: InclusionFilterId
  durationId: DurationFilterId
}

export const DEFAULT_DESTINATION_BROWSE_FILTERS: DestinationBrowseFilters = {
  country: 'All',
  priceId: 'all',
  activityId: 'all',
  durationId: 'all',
}

/**
 * Returns the longest package duration for a destination (proxy for trip length).
 *
 * @param dest - Destination with optional packages
 */
export function getDestinationTripDurationDays(dest: Destination): number {
  const packages = dest.packages ?? []
  if (packages.length === 0) return 0
  return packages.reduce((maxDays, pkg) => Math.max(maxDays, pkg.durationDays), 0)
}

/**
 * Returns true when a destination offers at least one package with the selected inclusion.
 *
 * @param dest - Destination to evaluate
 * @param activityId - Inclusion filter id
 */
export function destinationMatchesInclusion(dest: Destination, activityId: InclusionFilterId): boolean {
  if (activityId === 'all') return true
  const packages = dest.packages ?? []
  return packages.some((pkg) => {
    if (activityId === 'visa') return pkg.includesVisa
    if (activityId === 'flight') return pkg.includesFlight
    if (activityId === 'hotel') return pkg.includesHotel
    if (activityId === 'activities') return pkg.includesActivities
    return true
  })
}

/**
 * Returns true when a destination's trip duration falls within the selected range.
 *
 * @param dest - Destination to evaluate
 * @param durationId - Duration filter id
 */
export function destinationMatchesDuration(dest: Destination, durationId: DurationFilterId): boolean {
  const option = DURATION_FILTER_OPTIONS.find((entry) => entry.id === durationId)
  if (!option || option.id === 'all') return true

  const tripDays = getDestinationTripDurationDays(dest)
  if (tripDays === 0) return true

  return tripDays >= option.minDays && tripDays <= option.maxDays
}

/**
 * Returns true when the search query matches destination name, country, or description.
 *
 * @param dest - Destination to evaluate
 * @param query - Case-insensitive search string
 */
export function destinationMatchesSearch(dest: Destination, query: string): boolean {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return true
  return (
    dest.name.toLowerCase().includes(normalized)
    || dest.country.toLowerCase().includes(normalized)
    || dest.description.toLowerCase().includes(normalized)
  )
}

/**
 * Filters destinations by search text and browse filter selections.
 *
 * @param destinations - Source list from the API
 * @param searchQuery - Debounced search string
 * @param filters - Applied browse filters
 */
export function filterDestinations(
  destinations: Destination[],
  searchQuery: string,
  filters: DestinationBrowseFilters,
): Destination[] {
  const priceMax = PRICE_FILTER_OPTIONS.find((entry) => entry.id === filters.priceId)?.max ?? Infinity

  return destinations.filter((dest) => {
    if (!destinationMatchesSearch(dest, searchQuery)) return false
    if (priceMax !== Infinity && Number(dest.priceFromNgn) > priceMax) return false
    if (!destinationMatchesInclusion(dest, filters.activityId)) return false
    if (!destinationMatchesDuration(dest, filters.durationId)) return false
    return true
  })
}

/**
 * Counts how many browse filters differ from defaults (excludes search).
 *
 * @param filters - Current applied filters
 */
export function countActiveBrowseFilters(filters: DestinationBrowseFilters): number {
  let count = 0
  if (filters.country !== 'All') count += 1
  if (filters.priceId !== 'all') count += 1
  if (filters.activityId !== 'all') count += 1
  if (filters.durationId !== 'all') count += 1
  return count
}

/**
 * Parses browse filters from URL search params.
 *
 * @param params - Current URL search params
 */
export function parseDestinationFiltersFromSearchParams(
  params: URLSearchParams,
): DestinationBrowseFilters {
  const country = params.get('country')
  const priceId = params.get('price')
  const activityId = params.get('inclusions')
  const durationId = params.get('duration')

  return {
    country:
      country && DESTINATION_COUNTRIES.includes(country as DestinationCountry)
        ? country
        : DEFAULT_DESTINATION_BROWSE_FILTERS.country,
    priceId:
      priceId && PRICE_FILTER_OPTIONS.some((entry) => entry.id === priceId)
        ? (priceId as PriceFilterId)
        : DEFAULT_DESTINATION_BROWSE_FILTERS.priceId,
    activityId:
      activityId && INCLUSION_FILTER_OPTIONS.some((entry) => entry.id === activityId)
        ? (activityId as InclusionFilterId)
        : DEFAULT_DESTINATION_BROWSE_FILTERS.activityId,
    durationId:
      durationId && DURATION_FILTER_OPTIONS.some((entry) => entry.id === durationId)
        ? (durationId as DurationFilterId)
        : DEFAULT_DESTINATION_BROWSE_FILTERS.durationId,
  }
}

/**
 * Writes browse filters to URL search params (preserves unrelated keys such as `q`).
 *
 * @param params - Existing search params
 * @param filters - Filters to persist
 */
export function writeDestinationFiltersToSearchParams(
  params: URLSearchParams,
  filters: DestinationBrowseFilters,
): URLSearchParams {
  const next = new URLSearchParams(params)

  if (filters.country === 'All') next.delete('country')
  else next.set('country', filters.country)

  if (filters.priceId === 'all') next.delete('price')
  else next.set('price', filters.priceId)

  if (filters.activityId === 'all') next.delete('inclusions')
  else next.set('inclusions', filters.activityId)

  if (filters.durationId === 'all') next.delete('duration')
  else next.set('duration', filters.durationId)

  return next
}
