import { Link } from 'react-router-dom'
import { SeoHelmet } from '../../components/shared/SeoHelmet'

export function DashboardHome() {
  return (
    <>
      <SeoHelmet title="Dashboard" description="Your Starlings Hospitality account overview." />
      <div className="bg-white border border-border rounded-2xl p-8 shadow-sm">
        <h1 className="font-display text-2xl font-bold text-navy mb-2">Welcome back</h1>
        <p className="text-slate mb-6">Manage bookings, cart, and profile from the sidebar.</p>
        <Link to="/destinations" className="btn-primary">Explore destinations</Link>
      </div>
    </>
  )
}
