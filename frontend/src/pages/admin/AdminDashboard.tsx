import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { SeoHelmet } from '../../components/shared/SeoHelmet'
import { adminApi } from '../../api/admin.api'
import { formatCurrency } from '../../utils/formatCurrency'
import { Link } from 'react-router-dom'

export function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getStats().then((r) => r.data.data),
  })

  const chartData = useMemo(() => {
    if (!stats?.recentBookings?.length) return []
    const byMonth = new Map<string, number>()
    stats.recentBookings.forEach((b) => {
      const key = b.createdAt.slice(0, 7)
      byMonth.set(key, (byMonth.get(key) || 0) + Number(b.totalAmountNgn))
    })
    return Array.from(byMonth.entries())
      .map(([month, revenue]) => ({ month, revenue }))
      .sort((a, b) => a.month.localeCompare(b.month))
  }, [stats])

  return (
    <>
      <SeoHelmet title="Admin" description="Starlings Hospitality admin dashboard." />
      <div className="space-y-8">
        <div className="bg-white border border-border rounded-2xl p-8 shadow-sm">
          <h1 className="font-display text-2xl font-bold text-navy mb-6">Overview</h1>
          {isLoading || !stats ? (
            <div className="h-32 shimmer-bg rounded-xl" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="rounded-xl border border-border p-4 bg-off-white">
                <p className="text-slate text-sm">Total bookings</p>
                <p className="font-display text-2xl font-bold text-navy">{stats.totalBookings}</p>
              </div>
              <div className="rounded-xl border border-border p-4 bg-off-white">
                <p className="text-slate text-sm">Users</p>
                <p className="font-display text-2xl font-bold text-navy">{stats.totalUsers}</p>
              </div>
              <div className="rounded-xl border border-border p-4 bg-off-white">
                <p className="text-slate text-sm">Revenue (successful payments)</p>
                <p className="font-display text-2xl font-bold text-gold">
                  {formatCurrency(stats.revenueNgn, 'NGN')}
                </p>
              </div>
            </div>
          )}

          <div className="border border-border rounded-xl p-4 bg-off-white/50">
            <h2 className="font-semibold text-navy mb-4">Recent booking volume (last 10, by month)</h2>
            {chartData.length === 0 ? (
              <p className="text-slate text-sm">No chart data yet.</p>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#6B7280" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#6B7280" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value, 'NGN'), 'Amount']}
                      labelFormatter={(l) => `Month ${l}`}
                    />
                    <Bar dataKey="revenue" fill="#C49A2D" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-border rounded-2xl p-8 shadow-sm">
          <h2 className="font-display text-lg font-bold text-navy mb-4">Recent bookings</h2>
          {!stats?.recentBookings?.length ? (
            <p className="text-slate text-sm">No bookings yet.</p>
          ) : (
            <ul className="divide-y divide-border text-sm">
              {stats.recentBookings.map((b) => (
                <li key={b.id} className="py-3 flex flex-wrap justify-between gap-2">
                  <span className="font-mono text-navy">{b.referenceNumber}</span>
                  <span className="text-gold font-semibold">{formatCurrency(Number(b.totalAmountNgn), 'NGN')}</span>
                  <span className="text-slate capitalize">{b.status}</span>
                </li>
              ))}
            </ul>
          )}
          <Link to="/admin/bookings" className="inline-block mt-4 text-gold font-semibold text-sm hover:underline">
            View all bookings →
          </Link>
        </div>
      </div>
    </>
  )
}
