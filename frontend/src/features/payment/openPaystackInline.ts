import type { QueryClient } from '@tanstack/react-query'
import { paymentsApi } from '../../api/payments.api'

export type PaystackInlineOutcome =
  | { status: 'success'; reference: string }
  | { status: 'cancelled' }

export async function openPaystackInline(
  accessCode: string,
  queryClient: QueryClient,
): Promise<PaystackInlineOutcome> {
  const PaystackPop = (await import('@paystack/inline-js')).default
  const popup = new PaystackPop()

  return new Promise((resolve, reject) => {
    popup.resumeTransaction(accessCode, {
      onSuccess: async (transaction: { reference: string }) => {
        try {
          await paymentsApi.verify(transaction.reference)
          queryClient.invalidateQueries({ queryKey: ['bookings'] })
          resolve({ status: 'success', reference: transaction.reference })
        } catch (err) {
          reject(err)
        }
      },
      onCancel: () => resolve({ status: 'cancelled' }),
    })
  })
}
