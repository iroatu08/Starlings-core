export interface DestinationReview {
  id: string
  destinationId: string
  userId: string | null
  authorName: string
  rating: number
  body: string
  createdAt: string
}

export interface DestinationReviewsResponse {
  reviews: DestinationReview[]
  averageRating: number
  count: number
}
