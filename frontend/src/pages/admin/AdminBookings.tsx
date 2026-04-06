import { SeoHelmet } from '../../components/shared/SeoHelmet'

export function AdminBookings() {
  return (
    <>
      <SeoHelmet title="Admin — Bookings" description="Manage Starlings Hospitality bookings." />
      <div className="bg-white border border-border rounded-2xl p-8 shadow-sm">
        <h1 className="font-display text-2xl font-bold text-navy mb-4">Bookings</h1>
        <p className="text-slate">Connect this view to your bookings API when ready.</p>
      </div>
    </>
  )
}
