import apiClient from './axios.client'
import type { Destination } from '../types/destination.types'

export const destinationsApi = {
  getAll: (params?: { country?: string; featured?: boolean; minPriceNgn?: number; maxPriceNgn?: number }) =>
    apiClient.get<{ data: Destination[] }>('/destinations', { params }),

  getById: (id: string) =>
    apiClient.get<{ data: Destination }>(`/destinations/${id}`),
}
