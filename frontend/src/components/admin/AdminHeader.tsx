import { useLocation } from 'react-router-dom'
import { Bell, LogOut, Menu, Search, Settings } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useAuth } from '../../features/auth/useAuth'
import { useToast } from '../../hooks/use-toast'
import { getAdminSectionTitle } from './admin-route-meta'

export interface AdminHeaderProps {
  onOpenMobileNav: () => void
}

function getInitials(firstName?: string, lastName?: string): string {
  const a = firstName?.trim()?.charAt(0) ?? ''
  const b = lastName?.trim()?.charAt(0) ?? ''
  const initials = `${a}${b}`.toUpperCase()
  return initials || '?'
}

function getRoleLabel(role: string | undefined): string {
  if (role === 'admin') return 'Super Admin'
  return 'User'
}

export function AdminHeader({ onOpenMobileNav }: AdminHeaderProps) {
  const { pathname } = useLocation()
  const { user } = useAuthStore()
  const { logout, isLoggingOut } = useAuth()
  const { toast } = useToast()
  const title = getAdminSectionTitle(pathname)

  const comingSoon = (): void => {
    toast({ title: 'Coming soon', description: 'This action is not available yet.' })
  }

  const searchField = (
    <div className="relative w-full md:max-w-xl">
      <label htmlFor="admin-global-search" className="sr-only">
        Search admin
      </label>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        strokeWidth={1.75}
        aria-hidden
      />
      <input
        id="admin-global-search"
        type="search"
        placeholder="Search admin…"
        className="w-full rounded-full border border-slate-200 bg-slate-50/80 py-2 pl-10 pr-4 text-sm text-admin-navy placeholder:text-slate-400 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
      />
    </div>
  )

  return (
    <header className="sticky top-0 z-30 shrink-0 border-b border-slate-200/90 bg-white px-4 py-3 md:px-6">
      {/* Desktop: single row — title | search | actions (matches mockup). */}
      <div className="hidden items-center gap-6 md:flex">
        <button
          type="button"
          className="rounded-lg p-2 text-admin-navy hover:bg-slate-100 lg:hidden"
          aria-label="Open admin menu"
          onClick={onOpenMobileNav}
        >
          <Menu size={22} strokeWidth={1.75} />
        </button>
        <h1 className="shrink-0 font-sans text-xl font-bold text-admin-navy">{title}</h1>
        <div className="flex min-w-0 flex-1 justify-center px-2">{searchField}</div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-admin-navy"
            aria-label="Notifications"
            onClick={comingSoon}
          >
            <Bell size={20} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-admin-navy"
            aria-label="Settings"
            onClick={comingSoon}
          >
            <Settings size={20} strokeWidth={1.75} />
          </button>
          <div className="ml-2 flex items-center gap-2 border-l border-slate-200 pl-4 md:gap-3">
            <div className="hidden text-right lg:block">
              <p className="text-sm font-semibold text-admin-navy">
                {user ? `${user.firstName} ${user.lastName}`.trim() : 'Admin'}
              </p>
              <p className="text-xs text-slate-500">{getRoleLabel(user?.role)}</p>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-admin-navy text-xs font-bold text-white">
              {user ? getInitials(user.firstName, user.lastName) : 'A'}
            </div>
            <button
              type="button"
              disabled={isLoggingOut}
              onClick={() => logout()}
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-50 md:px-3"
              aria-label="Log out"
            >
              <LogOut size={18} strokeWidth={1.75} aria-hidden />
              <span className="hidden xl:inline">Log out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile: hamburger + title + avatar row, then search */}
      <div className="flex flex-col gap-3 md:hidden">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="shrink-0 rounded-lg p-2 text-admin-navy hover:bg-slate-100"
            aria-label="Open admin menu"
            onClick={onOpenMobileNav}
          >
            <Menu size={22} strokeWidth={1.75} />
          </button>
          <h1 className="min-w-0 flex-1 truncate font-sans text-lg font-bold text-admin-navy">{title}</h1>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-admin-navy text-xs font-bold text-white">
            {user ? getInitials(user.firstName, user.lastName) : 'A'}
          </div>
        </div>
        {searchField}
        <div className="flex flex-wrap items-center justify-end gap-1">
          <button
            type="button"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Notifications"
            onClick={comingSoon}
          >
            <Bell size={20} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Settings"
            onClick={comingSoon}
          >
            <Settings size={20} strokeWidth={1.75} />
          </button>
          <button
            type="button"
            disabled={isLoggingOut}
            onClick={() => logout()}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
            aria-label="Log out"
          >
            <LogOut size={18} strokeWidth={1.75} aria-hidden />
            Log out
          </button>
        </div>
      </div>
    </header>
  )
}
