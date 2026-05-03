import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { bookingsApi } from '../../api/bookings.api'
import { paymentsApi } from '../../api/payments.api'
import { useAuthStore } from '../../stores/authStore'
import { ngnToKobo } from '../../utils/formatCurrency'
import { openPaystackInline } from './openPaystackInline'
import type { Booking } from '../../types/booking.types'
import type { CreateBookingPayload } from '../../api/bookings.api'

export interface UsePaystackOptions {
  /** When set, loads this booking and skips cart → booking (step 1) for pending bookings with no payment row. */
  resumeBookingId?: string | null
}

export function usePaystack(opts?: UsePaystackOptions) {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [step, setStep] = useState<1 | 2>(1)
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [resumeError, setResumeError] = useState<string | null>(null)
  const [isResumingBooking, setIsResumingBooking] = useState(false)

  const resumeBookingId = opts?.resumeBookingId?.trim() || null

  useEffect(() => {
    if (!resumeBookingId || !user) {
      setResumeError(null)
      setIsResumingBooking(false)
      return
    }

    let cancelled = false
    setIsResumingBooking(true)
    setResumeError(null)

    void (async () => {
      try {
        const { data } = await bookingsApi.getById(resumeBookingId)
        const booking = data.data
        if (cancelled) return

        if (booking.status !== 'pending') {
          setResumeError('This booking cannot be resumed from checkout.')
          return
        }
        if (booking.payment) {
          setResumeError(
            'Payment was already started for this booking. Use Complete Payment on My Bookings.',
          )
          return
        }
        setCurrentBooking(booking)
        setStep(2)
      } catch (err: unknown) {
        if (cancelled) return
        const msg = axios.isAxiosError(err)
          ? (err.response?.data as { message?: string } | undefined)?.message
          : undefined
        setResumeError(msg || 'Could not load booking.')
      } finally {
        if (!cancelled) setIsResumingBooking(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [resumeBookingId, user?.id])

  const createBookingMutation = useMutation({
    mutationFn: (payload?: CreateBookingPayload) => bookingsApi.createFromCart(payload).then((r) => r.data.data),
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

      const result = await openPaystackInline(data.data.access_code, queryClient)
      if (result.status === 'success') {
        queryClient.invalidateQueries({ queryKey: ['cart'] })
        const q = new URLSearchParams({ reference: result.reference })
        navigate(`/checkout/success?${q.toString()}`)
      }
    } catch (err) {
      console.error('Payment failed:', err)
    } finally {
      setIsProcessing(false)
    }
  }, [currentBooking, user, queryClient, navigate])

  return {
    step,
    currentBooking,
    isProcessing,
    isCreatingBooking: createBookingMutation.isPending,
    createBooking: createBookingMutation.mutateAsync,
    handlePayment,
    resumeError,
    isResumingBooking,
  }
}
