import apiClient from './axios.client'
import type { Cart } from '../types/cart.types'

export interface AddCartItemPayload {
  packageId?: string
  destinationId?: string
  keptPackageIds?: string[]
  removedPackageIds?: string[]
  quantity?: number
}

export interface UpdateCartItemPayload {
  quantity?: number
  keptPackageIds?: string[]
  removedPackageIds?: string[]
}

export const cartApi = {
  getCart: () =>
    apiClient.get<{ data: Cart }>('/cart'),

  addItem: (payload: AddCartItemPayload) =>
    apiClient.post<{ data: Cart }>('/cart/items', payload),

  updateItem: (itemId: string, payload: UpdateCartItemPayload) =>
    apiClient.patch<{ data: Cart }>(`/cart/items/${itemId}`, payload),

  removeItem: (itemId: string) =>
    apiClient.delete<{ data: Cart }>(`/cart/items/${itemId}`),

  clearCart: () =>
    apiClient.delete<{ data: Cart }>('/cart'),
}
