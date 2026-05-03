export type PendingBundlePayload = {
  packageIds: string[]
  sourcePath: string
  destinationId?: string
  continueToCheckout?: boolean
  createdAt: number
}

const PENDING_BUNDLE_KEY = 'starlings-pending-bundle'
const MAX_AGE_MS = 1000 * 60 * 60 * 24

export function savePendingBundle(payload: Omit<PendingBundlePayload, 'createdAt'>): void {
  const value: PendingBundlePayload = {
    ...payload,
    createdAt: Date.now(),
  }
  sessionStorage.setItem(PENDING_BUNDLE_KEY, JSON.stringify(value))
}

export function readPendingBundle(): PendingBundlePayload | null {
  const raw = sessionStorage.getItem(PENDING_BUNDLE_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as PendingBundlePayload
    if (!Array.isArray(parsed.packageIds) || parsed.packageIds.length === 0) return null
    if (Date.now() - parsed.createdAt > MAX_AGE_MS) {
      clearPendingBundle()
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function clearPendingBundle(): void {
  sessionStorage.removeItem(PENDING_BUNDLE_KEY)
}
