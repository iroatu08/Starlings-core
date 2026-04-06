export function formatCurrency(amount: number, currency: 'NGN' | 'USD' = 'NGN'): string {
  if (currency === 'NGN') {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function koboToNgn(kobo: number): number {
  return kobo / 100
}

export function ngnToKobo(ngn: number): number {
  return Math.round(ngn * 100)
}
