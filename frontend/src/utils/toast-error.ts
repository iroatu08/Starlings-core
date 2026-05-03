import { toast } from '../hooks/use-toast'

/** Extract a user-facing message from axios-style or generic errors */
export function getApiErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const res = (error as { response?: { data?: { message?: string } } }).response
    if (res?.data?.message && typeof res.data.message === 'string') return res.data.message
  }
  if (error instanceof Error && error.message) return error.message
  return 'Something went wrong. Please try again.'
}

type ToastApiErrorOptions = {
  title?: string
}

/** Show a destructive toast for API / thrown errors */
export function toastApiError(error: unknown, options?: ToastApiErrorOptions): void {
  toast({
    variant: 'destructive',
    title: options?.title ?? 'Error',
    description: getApiErrorMessage(error),
  })
}
