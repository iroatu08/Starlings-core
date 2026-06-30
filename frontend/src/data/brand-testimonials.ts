/**
 * Brand-level client testimonials used for homepage social proof.
 */
export interface BrandTestimonial {
  id: string;
  quote: string;
  location: string;
  rating: number;
}

/** Curated testimonials from Starlings clients. */
export const BRAND_TESTIMONIALS: BrandTestimonial[] = [
  {
    id: 'london-trip',
    quote:
      "Honestly, I didn't worry about a single thing. Starlings covered every detail, I literally just showed up and had fun. Best trip to London ever.",
    location: 'London',
    rating: 5,
  },
  {
    id: 'driver-timing',
    quote:
      "They're too good at this! I hadn't even finished breakfast and my driver was already downstairs waiting for my next stop. The timing was insane.",
    location: 'Starlings Guest',
    rating: 5,
  },
];

/**
 * Computes the average star rating across brand testimonials.
 *
 * @param testimonials - List of brand testimonials
 * @returns Average rating rounded to one decimal place
 */
export function getAverageBrandRating(testimonials: BrandTestimonial[]): number {
  if (testimonials.length === 0) return 0;
  const sum = testimonials.reduce((total, item) => total + item.rating, 0);
  return Math.round((sum / testimonials.length) * 10) / 10;
}
