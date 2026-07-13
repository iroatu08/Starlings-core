import { toast } from '../hooks/use-toast'

/** Normalize NestJS-style `message` fields (string or validation array). */
function formatApiMessage(message: unknown): string | null {
  if (typeof message === 'string' && message.trim()) return message
  if (Array.isArray(message)) {
    const parts = message.filter((part): part is string => typeof part === 'string' && Boolean(part.trim()))
    if (parts.length > 0) return parts.join('. ')
  }
  return null
}

/** Extract a user-facing message from axios-style or generic errors */
export function getApiErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const res = (error as { response?: { data?: { message?: unknown } } }).response
    const apiMessage = formatApiMessage(res?.data?.message)
    if (apiMessage) return apiMessage
  }
  if (error instanceof Error && error.message && !error.message.startsWith('Request failed with status code')) {
    return error.message
  }
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
