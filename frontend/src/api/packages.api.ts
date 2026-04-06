import apiClient from './axios.client'
import type { Package } from '../types/destination.types'

export const packagesApi = {
  getAll: (destinationId?: string) =>
    apiClient.get<{ data: Package[] }>('/packages', { params: { destinationId } }),

  getById: (id: string) =>
    apiClient.get<{ data: Package }>(`/packages/${id}`),
}
