import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { SeoHelmet } from '../../components/shared/SeoHelmet'
import { adminApi } from '../../api/admin.api'
import { formatCurrency } from '../../utils/formatCurrency'
import type { BookingStatus } from '../../types/booking.types'

const STATUSES: BookingStatus[] = ['pending', 'confirmed', 'cancelled', 'completed']

export function AdminBookings() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-bookings', page, statusFilter],
    queryFn: () =>
      adminApi
        .getBookings({
          page,
          limit: 15,
          status: statusFilter || undefined,
        })
        .then((r) => r.data.data),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookingStatus }) =>
      adminApi.patchBookingStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
    },
  })

  return (
    <>
      <SeoHelmet title="Admin — Bookings" description="Manage Starlings Hospitality bookings." />
      <div className="bg-white border border-border rounded-2xl p-8 shadow-sm">
        <h1 className="font-display text-2xl font-bold text-navy mb-6">Bookings</h1>

        <div className="flex flex-wrap gap-4 mb-6">
          <label className="text-sm text-slate flex items-center gap-2">
            Status
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="input-field py-1 text-sm"
            >
              <option value="">All</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 shimmer-bg rounded-lg" />
            ))}
          </div>
        ) : !data?.bookings.length ? (
          <p className="text-slate">No bookings found.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-border text-slate">
                    <th className="py-2 pr-4">Reference</th>
                    <th className="py-2 pr-4">Customer</th>
                    <th className="py-2 pr-4">Travelers</th>
                    <th className="py-2 pr-4">Amount</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2">Update</th>
                  </tr>
                </thead>
                <tbody>
                  {data.bookings.map((b) => (
                    <tr key={b.id} className="border-b border-border/60">
                      <td className="py-3 pr-4 font-mono text-navy">{b.referenceNumber}</td>
                      <td className="py-3 pr-4 text-slate">
                        {b.user?.email ?? '—'}
                      </td>
                      <td className="py-3 pr-4 text-slate">
                        {b.travelers?.length || 0}
                      </td>
                      <td className="py-3 pr-4 text-gold font-semibold">
                        {formatCurrency(Number(b.totalAmountNgn), 'NGN')}
                      </td>
                      <td className="py-3 pr-4 capitalize">{b.status}</td>
                      <td className="py-3">
                        <select
                          value={b.status}
                          onChange={(e) =>
                            statusMutation.mutate({ id: b.id, status: e.target.value as BookingStatus })
                          }
                          className="input-field py-1 text-xs min-w-[8rem]"
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between items-center mt-6 text-sm text-slate">
              <span>Page {data.page} — {data.total} total</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="btn-outline py-1 px-3 text-sm disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={page * data.limit >= data.total}
                  onClick={() => setPage((p) => p + 1)}
                  className="btn-outline py-1 px-3 text-sm disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
