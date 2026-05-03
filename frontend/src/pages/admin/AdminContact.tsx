import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { SeoHelmet } from '../../components/shared/SeoHelmet'
import { adminApi } from '../../api/admin.api'

interface ContactRow {
  id: string
  name: string
  email: string
  subject?: string
  message: string
  budget?: string
  isRead: boolean
  createdAt: string
}

export function AdminContact() {
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-contact', page],
    queryFn: () => adminApi.getContactSubmissions({ page, limit: 15 }).then((r) => r.data.data),
  })

  const readMutation = useMutation({
    mutationFn: (id: string) => adminApi.markContactRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-contact'] }),
  })

  const rows = (data?.submissions ?? []) as ContactRow[]

  return (
    <>
      <SeoHelmet title="Admin — Contact" description="Starlings Hospitality contact inquiries." />
      <div className="bg-white border border-border rounded-2xl p-8 shadow-sm">
        <h1 className="font-display text-2xl font-bold text-navy mb-6">Contact messages</h1>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 shimmer-bg rounded-lg" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <p className="text-slate">No submissions yet.</p>
        ) : (
          <>
            <ul className="space-y-4">
              {rows.map((s) => (
                <li
                  key={s.id}
                  className={`border rounded-xl p-4 text-sm ${s.isRead ? 'border-border bg-white' : 'border-gold/40 bg-off-white'}`}
                >
                  <div className="flex flex-wrap justify-between gap-2 mb-2">
                    <span className="font-semibold text-navy">{s.name}</span>
                    <span className="text-slate">{s.email}</span>
                    <span className="text-slate text-xs">{new Date(s.createdAt).toLocaleString()}</span>
                  </div>
                  {s.subject && <p className="text-navy font-medium mb-1">{s.subject}</p>}
                  {s.budget && <p className="text-gold text-xs mb-1">Budget: {s.budget}</p>}
                  <p className="text-slate whitespace-pre-wrap mb-3">{s.message}</p>
                  {!s.isRead && (
                    <button
                      type="button"
                      onClick={() => readMutation.mutate(s.id)}
                      className="text-xs text-gold font-semibold hover:underline"
                    >
                      Mark as read
                    </button>
                  )}
                </li>
              ))}
            </ul>
            <div className="flex justify-between items-center mt-6 text-sm text-slate">
              <span>Page {data?.page} — {data?.total} total</span>
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
                  disabled={!data || page * (data.limit ?? 15) >= (data.total ?? 0)}
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
