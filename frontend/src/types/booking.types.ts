import type { Package } from './destination.types'
import type { Payment } from './payment.types'

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

export type RefundRequestStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'failed'

export interface BookingTraveler {
  id: string
  bookingId: string
  sortOrder: number
  firstName: string
  lastName: string
  email?: string | null
  phone?: string | null
  isPrimary: boolean
  createdAt: string
}

export interface RefundRequest {
  id: string
  bookingId: string
  userId: string
  status: RefundRequestStatus
  reason: string
  requestedAmountNgn: number
  adminId?: string | null
  resolvedAt?: string | null
  paystackRefundReference?: string | null
  failureReason?: string | null
  createdAt: string
  updatedAt: string
  booking?: Pick<Booking, 'id' | 'referenceNumber'>
  user?: { id: string; email: string; firstName?: string; lastName?: string }
}

export interface BookingItem {
  id: string
  bookingId: string
  packageId: string | null
  destinationId?: string | null
  destination?: Package['destination'] | null
  package: Package | null
  quantity: number
  unitPriceNgn: number
  originalTotalNgn?: number
  customizedTotalNgn?: number
  savingsNgn?: number
  bundleSnapshot?: {
    packagesSnapshot: Array<{
      id: string
      name: string
      type: string
      description: string | null
      priceNgn: number
      priceUsd: number
      isRemovable: boolean
    }>
    keptPackageIds: string[]
    removedPackageIds: string[]
    originalTotalNgn: number
    originalTotalUsd: number
    customizedTotalNgn: number
    customizedTotalUsd: number
    savingsNgn: number
    savingsUsd: number
  } | null
}

export interface Booking {
  id: string
  referenceNumber: string
  userId: string
  imageUrl?: string | null
  status: BookingStatus
  totalAmountNgn: number
  items: BookingItem[]
  payment?: Payment
  travelers?: BookingTraveler[]
  refundRequests?: RefundRequest[]
  user?: { id: string; email: string; firstName?: string; lastName?: string }
  createdAt: string
}
