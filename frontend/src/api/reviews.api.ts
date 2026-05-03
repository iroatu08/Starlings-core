import apiClient from './axios.client'
import type { DestinationReview, DestinationReviewsResponse } from '../types/review.types'

export const reviewsApi = {
  getForDestination: (destinationId: string) =>
    apiClient.get<{ data: DestinationReviewsResponse }>(
      `/destinations/${destinationId}/reviews`,
    ),

  create: (destinationId: string, body: { rating: number; body: string }) =>
    apiClient.post<{ data: DestinationReview }>(`/destinations/${destinationId}/reviews`, body),
}
