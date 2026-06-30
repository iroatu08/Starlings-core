import type { Destination } from '../types/destination.types';

/** Fallback image when no hero or gallery image is available yet. */
export const DESTINATION_IMAGE_PLACEHOLDER =
  'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=900&q=80';

/**
 * Resolves the best display image for a destination.
 * Prefers `heroImageUrl`, then featured gallery image, then first gallery image.
 *
 * @param destination - Destination with optional hero and gallery images
 * @returns URL string for rendering
 */
export function getDestinationHeroImage(
  destination: Pick<Destination, 'heroImageUrl' | 'galleryImages'>,
): string {
  const heroUrl = destination.heroImageUrl?.trim();
  if (heroUrl) return heroUrl;

  const gallery = destination.galleryImages ?? [];
  const featured = gallery.find((image) => image.isFeatured);
  if (featured?.url) return featured.url;
  if (gallery[0]?.url) return gallery[0].url;

  return DESTINATION_IMAGE_PLACEHOLDER;
}
