import { SeoHelmet } from '../../components/shared/SeoHelmet'

export function MyBookings() {
  return (
    <>
      <SeoHelmet title="My bookings" description="Your Starlings Hospitality bookings." />
      <div className="bg-white border border-border rounded-2xl p-8 shadow-sm">
        <h1 className="font-display text-2xl font-bold text-navy mb-4">My bookings</h1>
        <p className="text-slate">No bookings yet. When you complete a purchase, they will appear here.</p>
      </div>
    </>
  )
}
