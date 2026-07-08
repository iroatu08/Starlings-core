import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { SeoHelmet } from '../../components/shared/SeoHelmet'
import { bookingsApi } from '../../api/bookings.api'
import { formatCurrency } from '../../utils/formatCurrency'
import { useRetryBookingPayment } from '../../features/payment/useRetryBookingPayment'

import { BookingStatus, PaymentStatus } from '../../types/payment.types'

const STATUS_STYLES: Record<BookingStatus, string> = {
  pending: 'bg-[#fdce5d] text-[#745700]',
  confirmed: 'bg-[#041534] text-white',
  cancelled: 'bg-[#e4e2de] text-[#45464e]',
  completed: 'bg-[#d9e2ff] text-[#384668]',
}

export function MyBookings() {
  const queryClient = useQueryClient()
  const [refundModalBooking, setRefundModalBooking] = useState<{
    id: string
    referenceNumber: string
  } | null>(null)
  const [refundReason, setRefundReason] = useState('')
  const [refundFormError, setRefundFormError] = useState('')

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => bookingsApi.getMyBookings().then((r) => r.data.data),
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,

  })

  const { payPendingBooking, isPaying, payingBookingId, payError, bookingNeedsPayment } = useRetryBookingPayment()
  const requestRefundMutation = useMutation({
    mutationFn: ({ bookingId, reason }: { bookingId: string; reason: string }) =>
      bookingsApi.requestRefund(bookingId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      queryClient.invalidateQueries({ queryKey: ['admin-refund-requests'] })
      setRefundModalBooking(null)
      setRefundReason('')
      setRefundFormError('')
    },
    onError: () => {
      setRefundFormError('Could not submit your refund request. Please try again.')
    },
  })

  useEffect(() => {
    if (!refundModalBooking) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !requestRefundMutation.isPending) {
        setRefundModalBooking(null)
        setRefundReason('')
        setRefundFormError('')
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [refundModalBooking, requestRefundMutation.isPending])

  const closeRefundModal = (): void => {
    if (requestRefundMutation.isPending) return
    setRefundModalBooking(null)
    setRefundReason('')
    setRefundFormError('')
  }

  const submitRefundRequest = (): void => {
    const trimmedReason = refundReason.trim()
    if (!refundModalBooking) return
    if (!trimmedReason) {
      setRefundFormError('Please explain why you are requesting a refund.')
      return
    }
    setRefundFormError('')
    requestRefundMutation.mutate({ bookingId: refundModalBooking.id, reason: trimmedReason })
  }

  const hasPaymentInitialized = (booking: (typeof bookings)[number]): boolean => {
    return Boolean(booking.payment)
  }

  const hasIncompletePayment = (booking: (typeof bookings)[number]): boolean => {
    return Boolean(
      booking.payment
      && (booking.payment.status === PaymentStatus.PENDING || booking.payment.status === PaymentStatus.FAILED)
    )
  }

  return (
    <>
      <SeoHelmet title="My bookings" description="Your Starlings Hospitality bookings." />
      <div className="rounded-xl bg-white p-8 shadow-[0_8px_40px_rgba(27,28,26,0.04)]">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h1 className="mb-2 font-display text-3xl text-[#041534]">My Bookings</h1>
            <div className="h-0.5 w-12 bg-[#785a00]" />
          </div>
          <span className="text-xs uppercase tracking-widest text-[#75777f]">
            {bookings.length} total
          </span>
        </div>
        {payError && (
          <p className="mb-4 rounded-sm bg-red-100 px-3 py-2 text-sm text-red-700" role="alert">
            {payError}
          </p>
        )}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 rounded-lg shimmer-bg" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-12 text-center">
            <h3 className="mb-2 font-display text-2xl text-[#041534]">No bookings yet</h3>
            <p className="mb-6 text-sm text-[#45464e]">Complete checkout to see your reservations here.</p>
            <Link
              to="/destinations"
              className="inline-flex rounded-lg bg-[#041534] px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-[#1b2a4a]"
            >
              Explore Destinations
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {bookings.map((booking) => {
              const fallbackImage =
                booking.items[0]?.package?.destination?.heroImageUrl ||
                'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&q=80'
              const thumbnailUrl = booking.imageUrl || fallbackImage
              const mustCompleteCheckoutFirst =
                bookingNeedsPayment(booking) && !hasPaymentInitialized(booking)
              const showReceipt =
                !mustCompleteCheckoutFirst &&
                (booking.payment?.status === PaymentStatus.PENDING ||
                  booking.payment?.status === PaymentStatus.SUCCEEDED ||
                  booking.status === BookingStatus.CONFIRMED ||
                  booking.status === BookingStatus.COMPLETED)

              return (
                <li
                  key={booking.id}
                  className="group flex flex-col gap-4 rounded-lg border border-[#c5c6cf]/20 p-4 transition-colors hover:bg-[#f5f3ef] sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 overflow-hidden rounded-md bg-[#efeeea]">
                      <img src={thumbnailUrl} alt={booking.referenceNumber} className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <p className="font-mono text-sm font-semibold text-[#041534]">{booking.referenceNumber}</p>
                      <p className="text-sm text-[#45464e]">{new Date(booking.createdAt).toLocaleString()}</p>
                      <p className="mt-1 font-bold text-[#785a00]">{formatCurrency(booking.totalAmountNgn, 'NGN')}</p>
                      {booking.payment?.paystackReference && (
                        <p className="mt-1 text-xs text-[#75777f]">
                          Paystack: <span className="font-mono">{booking.payment.paystackReference}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${STATUS_STYLES[booking.status]}`}
                    >
                      {booking.status}
                    </span>
                    {bookingNeedsPayment(booking) && !hasPaymentInitialized(booking) && (
                      <Link
                        to={`/checkout?resumeBooking=${encodeURIComponent(booking.id)}`}
                        className="rounded-sm bg-[#041534] px-4 py-2 text-xs font-bold uppercase tracking-widest text-white transition-all hover:bg-[#1b2a4a]"
                      >
                        Complete Checkout
                      </Link>
                    )}
                    {hasIncompletePayment(booking) && (
                      <button
                        type="button"
                        disabled={isPaying && payingBookingId === booking.id}
                        onClick={() => payPendingBooking(booking)}
                        className="rounded-sm bg-[#785a00] px-4 py-2 text-xs font-bold uppercase tracking-widest text-white transition-all hover:brightness-110 disabled:opacity-60"
                      >
                        {isPaying && payingBookingId === booking.id ? 'Opening…' : 'Complete Payment'}
                      </button>
                    )}
                    {showReceipt && (
                      <Link
                        to={`/dashboard/bookings/${booking.id}`}
                        className="rounded-sm border border-[#041534]/20 px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#041534] transition-all hover:border-[#785a00] hover:text-[#785a00]"
                      >
                        Receipt
                      </Link>
                    )}
                    {booking.payment?.status === PaymentStatus.SUCCEEDED
                      && booking.status === BookingStatus.CONFIRMED
                      && !booking.refundRequests?.some((request) => request.status === 'pending') && (
                        <button
                          type="button"
                          disabled={requestRefundMutation.isPending}
                          onClick={() => {
                            setRefundReason('')
                            setRefundFormError('')
                            setRefundModalBooking({
                              id: booking.id,
                              referenceNumber: booking.referenceNumber,
                            })
                          }}
                          className="rounded-sm border border-red-300 px-4 py-2 text-xs font-bold uppercase tracking-widest text-red-700 transition-all hover:bg-red-50 disabled:opacity-60"
                        >
                          Request refund
                        </button>
                      )}
                    {booking.refundRequests?.some((request) => request.status === 'pending') && (
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-800">
                        Refund pending review
                      </span>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {refundModalBooking && (
        <div
          className="fixed inset-0 z-[100] !mt-0 flex items-center justify-center bg-navy/50 p-4 backdrop-blur-sm"
          role="presentation"
          onClick={closeRefundModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="refund-request-title"
            className="w-full max-w-md space-y-4 rounded-2xl border border-border bg-white p-6 shadow-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="refund-request-title" className="font-display text-lg font-bold text-navy">
              Request a refund
            </h2>
            <p className="text-sm text-slate">
              Booking{' '}
              <span className="font-mono font-semibold text-navy">{refundModalBooking.referenceNumber}</span>
              . Tell us why you are requesting a refund and our team will review it.
            </p>
            {refundFormError && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                {refundFormError}
              </p>
            )}
            <div>
              <label htmlFor="refund-reason" className="label-field">
                Reason for refund
              </label>
              <textarea
                id="refund-reason"
                rows={4}
                value={refundReason}
                onChange={(event) => setRefundReason(event.target.value)}
                disabled={requestRefundMutation.isPending}
                placeholder="Explain what went wrong or why you need a refund…"
                className="input-field resize-y"
              />
            </div>
            <div className="flex flex-wrap justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={requestRefundMutation.isPending}
                onClick={closeRefundModal}
                className="btn-outline text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={requestRefundMutation.isPending}
                onClick={submitRefundRequest}
                className="rounded-lg bg-red-700 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {requestRefundMutation.isPending ? 'Submitting…' : 'Submit request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
