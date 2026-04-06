import type { Package } from './destination.types'

export interface CartItem {
  id: string
  cartId: string
  packageId: string
  package: Package
  quantity: number
  unitPriceNgn: number
}

export interface Cart {
  id: string
  userId: string
  items: CartItem[]
  createdAt: string
  updatedAt: string
}
