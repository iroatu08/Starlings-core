import { SeoHelmet } from '../../components/shared/SeoHelmet'

export function AdminDashboard() {
  return (
    <>
      <SeoHelmet title="Admin" description="Starlings Hospitality admin dashboard." />
      <div className="bg-white border border-border rounded-2xl p-8 shadow-sm">
        <h1 className="font-display text-2xl font-bold text-navy mb-2">Admin dashboard</h1>
        <p className="text-slate">Use the sidebar to manage users, bookings, destinations, gallery, and contact messages.</p>
      </div>
    </>
  )
}
