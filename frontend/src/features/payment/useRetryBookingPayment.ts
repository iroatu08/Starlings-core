import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { paymentsApi } from '../../api/payments.api'
import { useAuthStore } from '../../stores/authStore'
import { ngnToKobo } from '../../utils/formatCurrency'
import { openPaystackInline } from './openPaystackInline'
import { PaymentStatus } from '../../types/payment.types'
import type { Booking } from '../../types/booking.types'

function bookingNeedsPayment(booking: Booking): boolean {
  if (booking.status !== 'pending') return false
  if (!booking.payment) return true
  return booking.payment.status === PaymentStatus.PENDING || booking.payment.status === PaymentStatus.FAILED
}

export function useRetryBookingPayment() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isPaying, setIsPaying] = useState(false)
  const [payingBookingId, setPayingBookingId] = useState<string | null>(null)
  const [payError, setPayError] = useState('')

  const payPendingBooking = useCallback(
    async (booking: Booking) => {
      if (!user || !bookingNeedsPayment(booking)) return
      setPayError('')
      setIsPaying(true)
      setPayingBookingId(booking.id)
      try {
        const { data } = await paymentsApi.initialize({
          bookingId: booking.id,
          email: user.email,
          amount: ngnToKobo(booking.totalAmountNgn),
          currency: 'NGN',
          callbackUrl: `${window.location.origin}/checkout/success`,
        })
        const outcome = await openPaystackInline(data.data.access_code, queryClient)
        queryClient.invalidateQueries({ queryKey: ['booking', booking.id] })
        queryClient.invalidateQueries({ queryKey: ['bookings'] })
        queryClient.invalidateQueries({ queryKey: ['cart'] })
        if (outcome.status === 'success') {
          const q = new URLSearchParams({ reference: outcome.reference })
          navigate(`/checkout/success?${q.toString()}`)
        }
      } catch (err: unknown) {
        const msg = axios.isAxiosError(err)
          ? (err.response?.data as { message?: string } | undefined)?.message
          : undefined
        setPayError(msg || 'Could not start payment. Please try again.')
      } finally {
        setIsPaying(false)
        setPayingBookingId(null)
      }
    },
    [user, queryClient, navigate],
  )

  return { payPendingBooking, isPaying, payingBookingId, payError, bookingNeedsPayment }
}
