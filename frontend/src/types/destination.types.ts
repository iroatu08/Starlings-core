export interface Package {
  id: string
  destinationId: string
  destination?: Destination
  title: string
  packageType?: 'visa_processing' | 'hotel_reservation' | 'free_taxi' | 'airport_transfer' | 'custom'
  isRemovable?: boolean
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
  isActive?: boolean
  latitude?: number | null
  longitude?: number | null
  packages?: Package[]
  galleryImages?: GalleryImage[]
  totalPriceNgn?: number
  totalPriceUsd?: number
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
