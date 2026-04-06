import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Calendar, ShoppingBag, User } from 'lucide-react'

const LINKS = [
  { to: '/dashboard', end: true, label: 'Overview', icon: LayoutDashboard },
  { to: '/dashboard/bookings', end: false, label: 'Bookings', icon: Calendar },
  { to: '/dashboard/cart', end: false, label: 'Cart', icon: ShoppingBag },
  { to: '/dashboard/profile', end: false, label: 'Profile', icon: User },
]

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-off-white pt-20 md:pt-24">
      <div className="container-custom flex flex-col md:flex-row gap-8 py-8">
        <aside className="w-full md:w-56 shrink-0">
          <nav className="bg-white border border-border rounded-xl p-2 space-y-1">
            {LINKS.map(({ to, end, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-gold/15 text-navy' : 'text-slate hover:bg-off-white'
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
