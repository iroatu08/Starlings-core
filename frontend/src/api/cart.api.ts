import apiClient from './axios.client'
import type { Cart } from '../types/cart.types'

export const cartApi = {
  getCart: () =>
    apiClient.get<{ data: Cart }>('/cart'),

  addItem: (packageId: string, quantity = 1) =>
    apiClient.post<{ data: Cart }>('/cart/items', { packageId, quantity }),

  updateItem: (itemId: string, quantity: number) =>
    apiClient.patch<{ data: Cart }>(`/cart/items/${itemId}`, { quantity }),

  removeItem: (itemId: string) =>
    apiClient.delete<{ data: Cart }>(`/cart/items/${itemId}`),

  clearCart: () =>
    apiClient.delete<{ data: Cart }>('/cart'),
}
