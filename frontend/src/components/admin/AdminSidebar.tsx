import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Calendar,
  MapPin,
  Image,
  Mail,
  Send,
  CreditCard,
} from 'lucide-react'
import { Logo } from '../../images'

const PRIMARY_LINKS = [
  { to: '/admin', end: true, label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/users', end: false, label: 'Users', icon: Users },
  { to: '/admin/bookings', end: false, label: 'Bookings', icon: Calendar },
  { to: '/admin/destinations', end: false, label: 'Content Manager', icon: MapPin },
  { to: '/admin/gallery', end: false, label: 'Gallery', icon: Image },
  { to: '/admin/contact', end: false, label: 'Contact Submissions', icon: Mail },
] as const

const SECONDARY_LINKS = [
  { to: '/admin/payments', end: false, label: 'Payments', icon: CreditCard },
  { to: '/admin/email', end: false, label: 'Email', icon: Send },
] as const

export interface AdminSidebarProps {
  isMobileOpen: boolean
  onCloseMobile: () => void
}

function navLinkClass(isActive: boolean): string {
  return `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-primary text-white shadow-sm'
      : 'text-slate-600 hover:bg-white/60 hover:text-primary'
  }`
}

export function AdminSidebar({ isMobileOpen, onCloseMobile }: AdminSidebarProps) {
  return (
    <>
      <div
        className={`
          fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200/80 bg-admin-canvas transition-transform duration-200 ease-out
          lg:static lg:z-0 lg:translate-x-0
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        aria-label="Admin navigation"
      >
        <div className="border-b border-slate-200/60 px-4 py-5">
          <div className="flex items-center gap-3">
            <img src={Logo} alt="" className="h-9 w-auto object-contain" />
            <div className="min-w-0">
              <p className="truncate font-display text-base font-bold text-admin-navy">Starlings Admin</p>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-slate-500">
                Management suite
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {PRIMARY_LINKS.map(({ to, end, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onCloseMobile}
              className={({ isActive }) => navLinkClass(isActive)}
            >
              <Icon size={18} strokeWidth={1.75} aria-hidden />
              {label}
            </NavLink>
          ))}
          <p className="px-3 pt-4 pb-1 text-[0.65rem] font-semibold uppercase tracking-wider text-slate-400">
            Finance & comms
          </p>
          {SECONDARY_LINKS.map(({ to, end, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onCloseMobile}
              className={({ isActive }) => navLinkClass(isActive)}
            >
              <Icon size={18} strokeWidth={1.75} aria-hidden />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200/60 p-4">
          <div className="rounded-xl border border-slate-200/80 bg-white/70 px-3 py-3 shadow-sm">
            <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-500">System health</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              <span className="text-xs font-medium text-slate-700">Live operations</span>
            </div>
          </div>
        </div>
      </div>

      {isMobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-admin-navy/40 lg:hidden"
          aria-label="Close menu"
          onClick={onCloseMobile}
        />
      ) : null}
    </>
  )
}
