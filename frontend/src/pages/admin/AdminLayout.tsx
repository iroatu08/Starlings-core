import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Users, Calendar, MapPin, Image, Mail } from 'lucide-react'

const LINKS = [
  { to: '/admin', end: true, label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/users', end: false, label: 'Users', icon: Users },
  { to: '/admin/bookings', end: false, label: 'Bookings', icon: Calendar },
  { to: '/admin/destinations', end: false, label: 'Destinations', icon: MapPin },
  { to: '/admin/gallery', end: false, label: 'Gallery', icon: Image },
  { to: '/admin/contact', end: false, label: 'Contact', icon: Mail },
]

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-100 pt-20 md:pt-24">
      <div className="container-custom flex flex-col lg:flex-row gap-8 py-8">
        <aside className="w-full lg:w-56 shrink-0">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">Admin</p>
          <nav className="bg-white border border-border rounded-xl p-2 space-y-1 shadow-sm">
            {LINKS.map(({ to, end, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-navy text-white' : 'text-slate hover:bg-off-white'
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
