import type { Package } from './destination.types'
import type { Destination } from './destination.types'

export interface BundlePackageSnapshot {
  id: string
  name: string
  type: string
  description: string | null
  priceNgn: number
  priceUsd: number
  isRemovable: boolean
}

export interface CartBundleSnapshot {
  packagesSnapshot: BundlePackageSnapshot[]
  keptPackageIds: string[]
  removedPackageIds: string[]
  originalTotalNgn: number
  originalTotalUsd: number
  customizedTotalNgn: number
  customizedTotalUsd: number
}

export interface CartItem {
  id: string
  cartId: string
  packageId: string | null
  package?: Package | null
  destinationId?: string | null
  destination?: Destination | null
  quantity: number
  unitPriceNgn: number
  bundleSnapshot?: CartBundleSnapshot | null
}

export interface Cart {
  id: string
  userId: string
  items: CartItem[]
  createdAt: string
  updatedAt: string
}
