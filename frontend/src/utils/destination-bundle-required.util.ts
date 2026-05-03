import type { Destination, Package } from '../types/destination.types'

/** One selected package paired with its destination (e.g. Get Started, cart previews). */
export type PackageDestinationRow = {
  package: Package
  destination: Destination
}

/**
 * Packages that belong to the base bundle for a destination (`isRemovable === false`).
 *
 * @param destination - Destination including its `packages` relation
 */
export function getRequiredPackagesForDestination(destination: Destination): Package[] {
  return (destination.packages ?? []).filter((pkg) => pkg.isRemovable === false)
}

/**
 * Returns whether a package is mandatory for its destination bundle.
 *
 * @param pkg - Package; missing `isRemovable` defaults to removable (same as backend default).
 */
export function packageIsDestinationRequired(pkg: Package): boolean {
  return pkg.isRemovable === false
}

/**
 * Appends rows for required packages from `destination` that are missing from `rows`.
 *
 * @param rows - Current selection rows
 * @param destination - Destination whose required packages must be present
 * @returns New array with missing required rows appended; does not mutate `rows`
 */
export function appendRequiredRowsForDestination(
  rows: PackageDestinationRow[],
  destination: Destination,
): PackageDestinationRow[] {
  const required = getRequiredPackagesForDestination(destination)
  if (required.length === 0) return rows
  const ids = new Set(rows.map((r) => r.package.id))
  const additions: PackageDestinationRow[] = []
  for (const pkg of required) {
    if (!ids.has(pkg.id)) {
      additions.push({ package: pkg, destination })
      ids.add(pkg.id)
    }
  }
  if (additions.length === 0) return rows
  return [...rows, ...additions]
}

/**
 * Ensures required packages are included for every destination that appears in `rows`.
 * Use after restoring persisted selections so base bundle lines are never omitted.
 *
 * @param rows - Selected rows (e.g. from URL or pending bundle restore)
 */
export function mergeRowsWithDestinationRequiredBundles(
  rows: PackageDestinationRow[],
): PackageDestinationRow[] {
  const destinations = new Map<string, Destination>()
  for (const row of rows) {
    destinations.set(row.destination.id, row.destination)
  }
  let result = [...rows]
  for (const dest of destinations.values()) {
    result = appendRequiredRowsForDestination(result, dest)
  }
  return result
}
