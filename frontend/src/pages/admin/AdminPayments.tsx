import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { SeoHelmet } from '../../components/shared/SeoHelmet'
import { adminApi } from '../../api/admin.api'
import { formatCurrency } from '../../utils/formatCurrency'
import { PaymentStatus } from '../../types/payment.types'
import type { RefundRequestStatus } from '../../types/booking.types'

const PAYMENT_STATUSES: PaymentStatus[] = [
  PaymentStatus.PENDING,
  PaymentStatus.REFUND_PENDING,
  PaymentStatus.REFUNDED,
  PaymentStatus.SUCCEEDED,
  PaymentStatus.FAILED,
]

function formatDateTime(value?: string): string {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

export function AdminPayments() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [search, setSearch] = useState('')
  const [rejectModalRequest, setRejectModalRequest] = useState<{
    id: string
    referenceNumber: string
    requesterEmail: string
  } | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectFormError, setRejectFormError] = useState('')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-payments', page, statusFilter, search],
    queryFn: () =>
      adminApi
        .getPayments({
          page,
          limit: 15,
          status: (statusFilter || undefined) as PaymentStatus | undefined,
          search: search.trim() || undefined,
        })
        .then((r) => r.data.data),
  })
  const { data: refundData, isLoading: isLoadingRefunds } = useQuery({
    queryKey: ['admin-refund-requests', page],
    queryFn: () => adminApi.getRefundRequests({ page, limit: 10 }).then((r) => r.data.data),
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: PaymentStatus }) =>
      adminApi.patchPaymentStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] })
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    },
  })
  const approveRefundMutation = useMutation({
    mutationFn: (id: string) => adminApi.approveRefundRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-refund-requests'] })
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] })
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] })
    },
  })
  const rejectRefundMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => adminApi.rejectRefundRequest(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-refund-requests'] })
      setRejectModalRequest(null)
      setRejectReason('')
      setRejectFormError('')
    },
    onError: () => {
      setRejectFormError('Could not reject this refund request. Please try again.')
    },
  })

  useEffect(() => {
    if (!rejectModalRequest) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !rejectRefundMutation.isPending) {
        setRejectModalRequest(null)
        setRejectReason('')
        setRejectFormError('')
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [rejectModalRequest, rejectRefundMutation.isPending])

  const closeRejectModal = (): void => {
    if (rejectRefundMutation.isPending) return
    setRejectModalRequest(null)
    setRejectReason('')
    setRejectFormError('')
  }

  const submitRejectRefund = (): void => {
    const trimmedReason = rejectReason.trim()
    if (!rejectModalRequest) return
    if (!trimmedReason) {
      setRejectFormError('Please provide a reason for rejecting this refund request.')
      return
    }
    setRejectFormError('')
    rejectRefundMutation.mutate({ id: rejectModalRequest.id, reason: trimmedReason })
  }

  const rows = useMemo(() => {
    if (!data?.payments?.length) return []
    return data.payments.map((payment) => {
      const booking = payment.booking
      const customerName = booking?.user
        ? `${booking.user.firstName ?? ''} ${booking.user.lastName ?? ''}`.trim() || booking.user.email
        : '—'
      const packageNames = Array.from(
        new Set(
          (booking?.items ?? [])
            .map((item) => item.package?.title)
            .filter((value): value is string => Boolean(value))
        )
      )
      const destinationNames = Array.from(
        new Set(
          (booking?.items ?? [])
            .map((item) => item.package?.destination?.name)
            .filter((value): value is string => Boolean(value))
        )
      )

      return {
        ...payment,
        customerName,
        packageName: packageNames.join(', ') || '—',
        destinationName: destinationNames.join(', ') || '—',
      }
    })
  }, [data?.payments])

  return (
    <>
      <SeoHelmet title='Admin — Payments' description='Manage Starlings Hospitality payments.' />
      <div className='rounded-2xl border border-border bg-white p-8 shadow-sm'>
        <h1 className='mb-6 font-display text-2xl font-bold text-navy'>Payments</h1>

        <div className='mb-6 flex flex-wrap gap-4'>
          <label className='flex items-center gap-2 text-sm text-slate'>
            Search
            <input
              type='text'
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
              placeholder='Name, email, package, destination, reference'
              className='input-field w-80 py-1 text-sm'
            />
          </label>
          <label className='flex items-center gap-2 text-sm text-slate'>
            Status
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value)
                setPage(1)
              }}
              className='input-field py-1 text-sm'
            >
              <option value=''>All</option>
              {PAYMENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
        </div>

        {isLoading ? (
          <div className='space-y-2'>
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className='h-14 rounded-lg shimmer-bg' />
            ))}
          </div>
        ) : !rows.length ? (
          <p className='text-slate'>No payments found.</p>
        ) : (
          <>
            <div className='overflow-x-auto'>
              <table className='w-full min-w-[920px] text-left text-sm'>
                <thead>
                  <tr className='border-b border-border text-slate'>
                    <th className='py-2 pr-4'>Customer</th>
                    <th className='py-2 pr-4'>Package</th>
                    <th className='py-2 pr-4'>Destination</th>
                    <th className='py-2 pr-4'>Reference</th>
                    <th className='py-2 pr-4'>Date</th>
                    <th className='py-2 pr-4'>Amount</th>
                    <th className='py-2 pr-4'>Status</th>
                    <th className='py-2'>Update</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className='border-b border-border/60'>
                      <td className='py-3 pr-4 text-slate'>{row.customerName}</td>
                      <td className='py-3 pr-4 text-slate'>{row.packageName}</td>
                      <td className='py-3 pr-4 text-slate'>{row.destinationName}</td>
                      <td className='py-3 pr-4 font-mono text-navy'>{row.paystackReference}</td>
                      <td className='py-3 pr-4 text-slate'>{formatDateTime(row.paidAt || row.createdAt)}</td>
                      <td className='py-3 pr-4 font-semibold text-gold'>
                        {formatCurrency(Number(row.amountNgn), 'NGN')}
                      </td>
                      <td className='py-3 pr-4 capitalize'>{row.status}</td>
                      <td className='py-3'>
                        <select
                          value={row.status}
                          disabled={updateStatusMutation.isPending}
                          onChange={(event) =>
                            updateStatusMutation.mutate({
                              id: row.id,
                              status: event.target.value as PaymentStatus,
                            })
                          }
                          className='input-field min-w-[8rem] py-1 text-xs'
                        >
                          {PAYMENT_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className='mt-6 flex items-center justify-between text-sm text-slate'>
              <span>
                Page {data?.page} — {data?.total} total
              </span>
              <div className='flex gap-2'>
                <button
                  type='button'
                  disabled={page <= 1}
                  onClick={() => setPage((prevPage) => prevPage - 1)}
                  className='btn-outline px-3 py-1 text-sm disabled:opacity-40'
                >
                  Previous
                </button>
                <button
                  type='button'
                  disabled={!data || page * data.limit >= data.total}
                  onClick={() => setPage((prevPage) => prevPage + 1)}
                  className='btn-outline px-3 py-1 text-sm disabled:opacity-40'
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
        <div className='mt-12 border-t border-border pt-8'>
          <h2 className='mb-4 font-display text-xl font-bold text-navy'>Refund Requests</h2>
          {isLoadingRefunds ? (
            <div className='space-y-2'>
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className='h-12 rounded-lg shimmer-bg' />
              ))}
            </div>
          ) : !refundData?.requests?.length ? (
            <p className='text-slate'>No refund requests.</p>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full min-w-[760px] text-left text-sm'>
                <thead>
                  <tr className='border-b border-border text-slate'>
                    <th className='py-2 pr-4'>Booking</th>
                    <th className='py-2 pr-4'>Requester</th>
                    <th className='py-2 pr-4'>Reason</th>
                    <th className='py-2 pr-4'>Amount</th>
                    <th className='py-2 pr-4'>Status</th>
                    <th className='py-2'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {refundData.requests.map((request) => (
                    <tr key={request.id} className='border-b border-border/60'>
                      <td className='py-3 pr-4 font-mono text-navy'>{request.booking?.referenceNumber || request.bookingId}</td>
                      <td className='py-3 pr-4 text-slate'>{request.user?.email || request.userId}</td>
                      <td className='py-3 pr-4 text-slate'>{request.reason}</td>
                      <td className='py-3 pr-4 font-semibold text-gold'>
                        {formatCurrency(Number(request.requestedAmountNgn), 'NGN')}
                      </td>
                      <td className='py-3 pr-4 capitalize'>{request.status}</td>
                      <td className='py-3'>
                        {request.status === ('pending' as RefundRequestStatus) ? (
                          <div className='flex gap-2'>
                            <button
                              type='button'
                              disabled={approveRefundMutation.isPending}
                              onClick={() => approveRefundMutation.mutate(request.id)}
                              className='rounded border border-green-300 px-3 py-1 text-xs font-semibold text-green-700 hover:bg-green-50 disabled:opacity-60'
                            >
                              Approve
                            </button>
                            <button
                              type='button'
                              disabled={rejectRefundMutation.isPending}
                              onClick={() => {
                                setRejectReason('')
                                setRejectFormError('')
                                setRejectModalRequest({
                                  id: request.id,
                                  referenceNumber: request.booking?.referenceNumber || request.bookingId,
                                  requesterEmail: request.user?.email || request.userId,
                                })
                              }}
                              className='rounded border border-red-300 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60'
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className='text-xs text-slate'>No actions</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {rejectModalRequest && (
        <div
          className='fixed inset-0 z-[100] !mt-0 flex items-center justify-center bg-navy/50 p-4 backdrop-blur-sm'
          role='presentation'
          onClick={closeRejectModal}
        >
          <div
            role='dialog'
            aria-modal='true'
            aria-labelledby='reject-refund-title'
            className='w-full max-w-md space-y-4 rounded-2xl border border-border bg-white p-6 shadow-lg'
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id='reject-refund-title' className='font-display text-lg font-bold text-navy'>
              Reject refund request
            </h2>
            <p className='text-sm text-slate'>
              Booking{' '}
              <span className='font-mono font-semibold text-navy'>{rejectModalRequest.referenceNumber}</span>
              {' '}from <span className='font-semibold text-navy'>{rejectModalRequest.requesterEmail}</span>.
              Provide a reason the customer will see in the rejection record.
            </p>
            {rejectFormError && (
              <p className='rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700' role='alert'>
                {rejectFormError}
              </p>
            )}
            <div>
              <label htmlFor='reject-refund-reason' className='label-field'>
                Rejection reason
              </label>
              <textarea
                id='reject-refund-reason'
                rows={4}
                value={rejectReason}
                onChange={(event) => setRejectReason(event.target.value)}
                disabled={rejectRefundMutation.isPending}
                placeholder='Explain why this refund request is being rejected…'
                className='input-field resize-y'
              />
            </div>
            <div className='flex flex-wrap justify-end gap-2 pt-2'>
              <button
                type='button'
                disabled={rejectRefundMutation.isPending}
                onClick={closeRejectModal}
                className='btn-outline text-sm'
              >
                Cancel
              </button>
              <button
                type='button'
                disabled={rejectRefundMutation.isPending}
                onClick={submitRejectRefund}
                className='rounded-lg bg-red-700 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50'
              >
                {rejectRefundMutation.isPending ? 'Rejecting…' : 'Reject request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
