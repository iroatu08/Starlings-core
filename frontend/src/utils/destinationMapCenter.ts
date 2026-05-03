/** Fallback map centers when API lat/lng missing */
const COUNTRY_CENTERS: Record<string, [number, number]> = {
  France: [48.8566, 2.3522],
  UK: [51.5074, -0.1278],
  Nigeria: [6.5244, 3.3792],
  USA: [40.7128, -74.006],
  UAE: [25.2048, 55.2708],
  Canada: [43.6532, -79.3832],
  Spain: [41.3851, 2.1734],
  Italy: [41.9028, 12.4964],
  Japan: [35.6762, 139.6503],
  Singapore: [1.3521, 103.8198],
  'South Africa': [-33.9249, 18.4241],
  Turkey: [41.0082, 28.9784],
}

export function getDestinationMapCenter(
  country: string,
  latitude?: number | string | null,
  longitude?: number | string | null
): [number, number] {
  const lat = latitude != null && latitude !== '' ? Number(latitude) : NaN
  const lng = longitude != null && longitude !== '' ? Number(longitude) : NaN
  if (!Number.isNaN(lat) && !Number.isNaN(lng)) return [lat, lng]
  return COUNTRY_CENTERS[country] ?? [20, 0]
}
