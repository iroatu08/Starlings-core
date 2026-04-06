export interface Package {
  id: string
  destinationId: string
  destination?: Destination
  title: string
  description?: string
  includesVisa: boolean
  includesFlight: boolean
  includesHotel: boolean
  includesActivities: boolean
  priceNgn: number
  priceUsd: number
  durationDays: number
  maxCapacity: number
  createdAt: string
  updatedAt: string
}

export interface Destination {
  id: string
  name: string
  country: string
  description: string
  heroImageUrl?: string
  priceFromNgn: number
  priceFromUsd: number
  isFeatured: boolean
  packages?: Package[]
  galleryImages?: GalleryImage[]
  createdAt: string
}

export interface GalleryImage {
  id: string
  destinationId?: string
  destination?: Destination
  cloudinaryPublicId: string
  url: string
  altText?: string
  width?: number
  height?: number
  isFeatured: boolean
  createdAt: string
}
