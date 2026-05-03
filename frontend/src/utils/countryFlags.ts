/** ISO-style country label → flag emoji for destination cards */
export const countryToFlagEmoji: Record<string, string> = {
  France: '🇫🇷',
  UK: '🇬🇧',
  Nigeria: '🇳🇬',
  USA: '🇺🇸',
  UAE: '🇦🇪',
  Canada: '🇨🇦',
  Spain: '🇪🇸',
  Italy: '🇮🇹',
  Japan: '🇯🇵',
  Singapore: '🇸🇬',
  'South Africa': '🇿🇦',
  Turkey: '🇹🇷',
}

export function getCountryFlag(country: string): string {
  return countryToFlagEmoji[country] ?? '🌍'
}
