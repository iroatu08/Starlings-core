import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { SeoHelmet } from '../../components/shared/SeoHelmet'
import { bookingsApi } from '../../api/bookings.api'
import { formatCurrency } from '../../utils/formatCurrency'
import { groupBookingItemsByDestination } from '../../utils/trip-line-groups.util'
import { PaymentStatus } from '../../types/payment.types'
import { useRetryBookingPayment } from '../../features/payment/useRetryBookingPayment'

export function BookingReceipt() {
  const { bookingId } = useParams<{ bookingId: string }>()
  const { payPendingBooking, isPaying, payError, bookingNeedsPayment } = useRetryBookingPayment()

  const { data: booking, isLoading, error } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => bookingsApi.getById(bookingId!).then((r) => r.data.data),
    enabled: !!bookingId,
  })

  const printReceipt = () => window.print()
  const downloadPdf = async () => {
    if (!bookingId) return
    const response = await bookingsApi.downloadReceiptPdf(bookingId)
    const blobUrl = URL.createObjectURL(response.data)
    window.open(blobUrl, '_blank', 'noopener,noreferrer')
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000)
  }

  if (isLoading) {
    return (
      <div className="bg-white border border-border rounded-2xl p-8 shadow-sm">
        <div className="h-64 shimmer-bg rounded-xl" />
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="bg-white border border-border rounded-2xl p-8 shadow-sm text-center">
        <p className="text-slate mb-4">Booking not found.</p>
        <Link to="/dashboard/bookings" className="btn-primary">Back to bookings</Link>
      </div>
    )
  }

  return (
    <>
      <SeoHelmet title={`Receipt ${booking.referenceNumber}`} description="Booking receipt" />
      <div className="bg-white border border-border rounded-2xl p-8 shadow-sm print:shadow-none print:border-0">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-navy">Booking receipt</h1>
            <p className="font-mono text-sm text-slate mt-1">{booking.referenceNumber}</p>
            <p className="text-slate text-sm">{new Date(booking.createdAt).toLocaleString()}</p>
          </div>
          <button type="button" onClick={printReceipt} className="btn-outline print:hidden">
            Print receipt
          </button>
        </div>

        <div className="border-t border-border pt-6 space-y-6">
          <h2 className="font-semibold text-navy">Line items</h2>
          {groupBookingItemsByDestination(booking.items).map((group) => (
            <div key={group.destinationKey} className="space-y-3">
              <div className="border-b border-border pb-2">
                <p className="font-semibold text-navy">
                  {group.destinationName}
                  {group.country ? <span className="font-normal text-slate"> · {group.country}</span> : null}
                </p>
                <p className="text-xs text-slate">Subtotal {formatCurrency(group.subtotalNgn, 'NGN')}</p>
              </div>
              <ul className="space-y-3">
                {group.lines.map((item) => (
                  <li key={item.id} className="flex justify-between text-sm">
                    <div>
                      <p className="font-medium text-navy">{item.package?.title || item.destination?.name || 'Destination bundle'}</p>
                      <p className="text-slate">
                        Qty {item.quantity} × {formatCurrency(Number(item.unitPriceNgn), 'NGN')}
                      </p>
                    </div>
                    <p className="text-gold font-semibold">
                      {formatCurrency(Number(item.unitPriceNgn) * item.quantity, 'NGN')}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="flex justify-between font-bold text-navy text-lg border-t border-border pt-4">
            <span>Total</span>
            <span>{formatCurrency(booking.totalAmountNgn, 'NGN')}</span>
          </div>
          {booking.payment?.paystackReference && (
            <p className="text-sm text-slate">
              Paystack reference: <span className="font-mono">{booking.payment.paystackReference}</span>
            </p>
          )}
          {booking.payment?.status === PaymentStatus.SUCCEEDED && (
            <p className="text-sm text-green-500 bg-green-500/10  p-2 rounded-md w-fit">Payment successful</p>
          )}
          {booking.payment?.status === PaymentStatus.FAILED && (
            <p className="text-sm text-red-500 bg-red-500/10  p-2 rounded-md w-fit">Payment failed</p>
          )}
          {booking.payment?.status === PaymentStatus.PENDING && (
            <p className="text-sm text-yellow-800 bg-amber-50 border border-amber-200 p-2 rounded-md w-fit">
              Payment pending — complete checkout when you are ready.
            </p>
          )}
          {booking.payment?.status === PaymentStatus.REFUND_PENDING && (
            <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 p-2 rounded-md w-fit">
              Refund is being processed.
            </p>
          )}
          {booking.payment?.status === PaymentStatus.REFUNDED && (
            <p className="text-sm text-blue-700 bg-blue-50 border border-blue-200 p-2 rounded-md w-fit">
              Payment refunded.
            </p>
          )}
          {booking.travelers?.length ? (
            <div className="pt-4">
              <h3 className="font-semibold text-navy">Travelers</h3>
              <ul className="mt-2 space-y-2">
                {booking.travelers.map((traveler) => (
                  <li key={traveler.id} className="rounded-md border border-border/60 p-3 text-sm">
                    <p className="font-medium text-navy">
                      {traveler.firstName} {traveler.lastName}
                      {traveler.isPrimary ? ' (Primary)' : ''}
                    </p>
                    <p className="text-slate">
                      {traveler.email || 'No email'} {traveler.phone ? `· ${traveler.phone}` : ''}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {bookingNeedsPayment(booking) && (
            <div className="print:hidden pt-4 border-t border-border mt-4">
              {payError && <p className="text-red-600 text-sm mb-3">{payError}</p>}
              <button
                type="button"
                disabled={isPaying}
                onClick={() => payPendingBooking(booking)}
                className="btn-primary"
              >
                {isPaying ? 'Opening Paystack…' : 'Retry payment'}
              </button>
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-col gap-2 text-xs text-slate print:hidden sm:flex-row sm:items-center sm:justify-between">
          <Link to="/dashboard/bookings" className="text-gold font-semibold">← Back to bookings</Link>
          <button type="button" onClick={downloadPdf} className="text-left text-navy underline sm:text-right">
            Download PDF receipt
          </button>
        </div>
      </div>
    </>
  )
}
