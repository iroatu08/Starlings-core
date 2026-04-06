import { useState, useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { bookingsApi } from '../../api/bookings.api'
import { paymentsApi } from '../../api/payments.api'
import { useAuthStore } from '../../stores/authStore'
import { ngnToKobo } from '../../utils/formatCurrency'
import type { Booking } from '../../types/booking.types'

declare global {
  interface Window {
    PaystackPop: any
  }
}

export function usePaystack() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const createBookingMutation = useMutation({
    mutationFn: () => bookingsApi.createFromCart().then((r) => r.data.data),
    onSuccess: (booking) => {
      setCurrentBooking(booking)
      setStep(2)
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    },
  })

  const handlePayment = useCallback(async () => {
    if (!currentBooking || !user) return

    setIsProcessing(true)
    try {
      const { data } = await paymentsApi.initialize({
        bookingId: currentBooking.id,
        email: user.email,
        amount: ngnToKobo(currentBooking.totalAmountNgn),
        currency: 'NGN',
        callbackUrl: `${window.location.origin}/checkout/success`,
      })

      const PaystackPop = (await import('@paystack/inline-js')).default
      const popup = new PaystackPop()
      popup.resumeTransaction(data.data.access_code, {
        onSuccess: async (transaction: { reference: string }) => {
          await paymentsApi.verify(transaction.reference)
          queryClient.invalidateQueries({ queryKey: ['bookings'] })
          setStep(3)
        },
        onCancel: () => {
          console.log('Payment cancelled')
        },
      })
    } catch (err) {
      console.error('Payment failed:', err)
    } finally {
      setIsProcessing(false)
    }
  }, [currentBooking, user, queryClient])

  return {
    step,
    currentBooking,
    isProcessing,
    isCreatingBooking: createBookingMutation.isPending,
    createBooking: createBookingMutation.mutateAsync,
    handlePayment,
    goToStep: setStep,
  }
}
