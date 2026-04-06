import apiClient from './axios.client'
import type { GalleryImage } from '../types/destination.types'

export const galleryApi = {
  getAll: (destinationId?: string) =>
    apiClient.get<{ data: GalleryImage[] }>('/gallery', { params: { destinationId } }),
}
