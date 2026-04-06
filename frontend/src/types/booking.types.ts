import type { Package } from './destination.types'
import type { Payment } from './payment.types'

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'

export interface BookingItem {
  id: string
  bookingId: string
  packageId: string
  package: Package
  quantity: number
  unitPriceNgn: number
}

export interface Booking {
  id: string
  referenceNumber: string
  userId: string
  status: BookingStatus
  totalAmountNgn: number
  items: BookingItem[]
  payment?: Payment
  createdAt: string
}
