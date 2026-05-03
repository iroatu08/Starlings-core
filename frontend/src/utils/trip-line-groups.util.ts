import type { Booking, BookingItem } from '../types/booking.types'
import type { CartItem } from '../types/cart.types'
/** Resolved destination identity for grouping cart or booking lines. */
export interface TripLineDestinationMeta {
  /** Stable key for grouping (UUID or fallback sentinel). */
  destinationKey: string
  destinationName: string
  country?: string
}

export interface TripDestinationGroup<T> {
  destinationKey: string
  destinationName: string
  country?: string
  lines: T[]
  /** Sum of line totals in NGN (unitPriceNgn × quantity). */
  subtotalNgn: number
}

const FALLBACK_KEY = '__unknown_destination__'

/**
 * Resolves display metadata for a cart line (bundle vs standalone package).
 *
 * @param item - Cart item from API with optional relations
 */
export function resolveCartLineDestination(item: CartItem): TripLineDestinationMeta {
  const isBundle = Boolean(item.bundleSnapshot && item.destinationId)
  if (isBundle && item.destination) {
    return {
      destinationKey: item.destination.id,
      destinationName: item.destination.name,
      country: item.destination.country,
    }
  }
  if (isBundle && item.destinationId) {
    return {
      destinationKey: item.destinationId,
      destinationName: 'Destination bundle',
    }
  }
  const fromPackage = item.package?.destination
  if (fromPackage) {
    return {
      destinationKey: fromPackage.id,
      destinationName: fromPackage.name,
      country: fromPackage.country,
    }
  }
  return {
    destinationKey: FALLBACK_KEY,
    destinationName: 'Other',
  }
}

/**
 * Resolves display metadata for a booking line item.
 *
 * @param item - Booking item from API with optional relations
 */
export function resolveBookingLineDestination(item: BookingItem): TripLineDestinationMeta {
  const isBundle = Boolean(item.bundleSnapshot && item.destinationId)
  if (isBundle && item.destination) {
    return {
      destinationKey: item.destination.id,
      destinationName: item.destination.name,
      country: item.destination.country,
    }
  }
  if (isBundle && item.destinationId) {
    return {
      destinationKey: item.destinationId,
      destinationName: 'Destination bundle',
    }
  }
  const fromPackage = item.package?.destination
  if (fromPackage) {
    return {
      destinationKey: fromPackage.id,
      destinationName: fromPackage.name,
      country: fromPackage.country,
    }
  }
  return {
    destinationKey: FALLBACK_KEY,
    destinationName: 'Other',
  }
}

function lineTotalNgn(unitPriceNgn: number, quantity: number): number {
  return Number(unitPriceNgn) * quantity
}

/**
 * Groups cart items by destination; sorts groups by destination name.
 *
 * @param items - Cart lines (possibly mixed destinations)
 */
export function groupCartItemsByDestination(items: CartItem[]): TripDestinationGroup<CartItem>[] {
  const map = new Map<string, TripDestinationGroup<CartItem>>()
  for (const item of items) {
    const meta = resolveCartLineDestination(item)
    const existing = map.get(meta.destinationKey)
    const add = lineTotalNgn(item.unitPriceNgn, item.quantity)
    if (existing) {
      existing.lines.push(item)
      existing.subtotalNgn += add
    } else {
      map.set(meta.destinationKey, {
        destinationKey: meta.destinationKey,
        destinationName: meta.destinationName,
        country: meta.country,
        lines: [item],
        subtotalNgn: add,
      })
    }
  }
  return Array.from(map.values()).sort((a, b) =>
    a.destinationName.localeCompare(b.destinationName, undefined, { sensitivity: 'base' }),
  )
}

/**
 * Groups booking items by destination; sorts groups by destination name.
 *
 * @param items - Booking line items
 */
export function groupBookingItemsByDestination(items: BookingItem[]): TripDestinationGroup<BookingItem>[] {
  const map = new Map<string, TripDestinationGroup<BookingItem>>()
  for (const item of items) {
    const meta = resolveBookingLineDestination(item)
    const existing = map.get(meta.destinationKey)
    const add = lineTotalNgn(item.unitPriceNgn, item.quantity)
    if (existing) {
      existing.lines.push(item)
      existing.subtotalNgn += add
    } else {
      map.set(meta.destinationKey, {
        destinationKey: meta.destinationKey,
        destinationName: meta.destinationName,
        country: meta.country,
        lines: [item],
        subtotalNgn: add,
      })
    }
  }
  return Array.from(map.values()).sort((a, b) =>
    a.destinationName.localeCompare(b.destinationName, undefined, { sensitivity: 'base' }),
  )
}

/**
 * Unique destination display names in appearance order (for subtitles).
 *
 * @param groups - Output from {@link groupCartItemsByDestination} or {@link groupBookingItemsByDestination}
 */
export function destinationNamesFromGroups<T>(groups: TripDestinationGroup<T>[]): string[] {
  const seen = new Set<string>()
  const names: string[] = []
  for (const g of groups) {
    const label = g.country ? `${g.destinationName} (${g.country})` : g.destinationName
    if (!seen.has(label)) {
      seen.add(label)
      names.push(label)
    }
  }
  return names
}

/**
 * Headline + subtitle for checkout hero when cart has one or many destinations.
 *
 * @param items - Cart items
 */
export function tripSummaryHeadlineFromCart(items: CartItem[]): {
  title: string
  subtitle: string
  destinationCount: number
} {
  if (items.length === 0) {
    return { title: 'Your journey', subtitle: 'Starlings Hospitality', destinationCount: 0 }
  }
  const groups = groupCartItemsByDestination(items)
  const names = destinationNamesFromGroups(groups)
  if (names.length <= 1) {
    const g = groups[0]
    return {
      title: 'Your trip',
      subtitle: names[0] ?? g.destinationName,
      destinationCount: 1,
    }
  }
  return {
    title: 'Your trip',
    subtitle: names.join(' · '),
    destinationCount: names.length,
  }
}

/**
 * Headline + subtitle for checkout/payment step when booking has multiple destinations.
 *
 * @param booking - Booking with items
 */
export function tripSummaryHeadlineFromBooking(booking: Booking): {
  title: string
  subtitle: string
  destinationCount: number
} {
  const items = booking.items ?? []
  if (items.length === 0) {
    return { title: 'Your booking', subtitle: 'Starlings Hospitality', destinationCount: 0 }
  }
  const groups = groupBookingItemsByDestination(items)
  const names = destinationNamesFromGroups(groups)
  if (names.length <= 1) {
    const g = groups[0]
    return {
      title: 'Your trip',
      subtitle: names[0] ?? g.destinationName,
      destinationCount: 1,
    }
  }
  return {
    title: 'Your trip',
    subtitle: names.join(' · '),
    destinationCount: names.length,
  }
}
