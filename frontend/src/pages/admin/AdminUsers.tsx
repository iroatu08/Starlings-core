import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { SeoHelmet } from '../../components/shared/SeoHelmet'
import { adminApi } from '../../api/admin.api'
import type { User } from '../../types/auth.types'

export function AdminUsers() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debounced, setDebounced] = useState('')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, debounced],
    queryFn: () => adminApi.getUsers({ page, limit: 15, search: debounced || undefined }).then((r) => r.data.data),
  })

  const patchMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<{ isActive: boolean; role: string }> }) =>
      adminApi.patchUser(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setDebounced(search.trim())
    setPage(1)
  }

  const toggleActive = (u: User) => {
    patchMutation.mutate({ id: u.id, body: { isActive: !u.isActive } })
  }

  const toggleRole = (u: User) => {
    const next = u.role === 'admin' ? 'user' : 'admin'
    patchMutation.mutate({ id: u.id, body: { role: next } })
  }

  return (
    <>
      <SeoHelmet title="Admin — Users" description="Manage Starlings Hospitality users." />
      <div className="bg-white border border-border rounded-2xl p-8 shadow-sm">
        <h1 className="font-display text-2xl font-bold text-navy mb-6">Users</h1>

        <form onSubmit={onSearchSubmit} className="flex flex-wrap gap-2 mb-6">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search email or name…"
            className="input-field flex-1 min-w-[200px]"
          />
          <button type="submit" className="btn-navy">Search</button>
        </form>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 shimmer-bg rounded-lg" />
            ))}
          </div>
        ) : !data?.users.length ? (
          <p className="text-slate">No users found.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-border text-slate">
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Email</th>
                    <th className="py-2 pr-4">Role</th>
                    <th className="py-2 pr-4">Verified</th>
                    <th className="py-2 pr-4">Active</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.users.map((u) => (
                    <tr key={u.id} className="border-b border-border/60">
                      <td className="py-3 pr-4 text-navy font-medium">
                        {u.firstName} {u.lastName}
                      </td>
                      <td className="py-3 pr-4 text-slate">{u.email}</td>
                      <td className="py-3 pr-4 capitalize">{u.role}</td>
                      <td className="py-3 pr-4">{u.isVerified ? 'Yes' : 'No'}</td>
                      <td className="py-3 pr-4">{u.isActive ? 'Yes' : 'No'}</td>
                      <td className="py-3 space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => toggleActive(u)}
                          className="text-xs text-gold font-semibold hover:underline"
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleRole(u)}
                          className="text-xs text-navy font-semibold hover:underline"
                        >
                          Make {u.role === 'admin' ? 'user' : 'admin'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between items-center mt-6 text-sm text-slate">
              <span>Page {data.page} of {Math.max(1, Math.ceil(data.total / data.limit))}</span>
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
