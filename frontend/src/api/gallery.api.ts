import apiClient from './axios.client'
import type { GalleryImage } from '../types/destination.types'

export interface GalleryPageResponse {
  data: GalleryImage[]
  page: number
  limit: number
  hasMore: boolean
}

export const galleryApi = {
  getPage: (params: { destinationId?: string; page?: number; limit?: number }) =>
    apiClient.get<{ data: GalleryPageResponse }>('/gallery', { params }),
}
