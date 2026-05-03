import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Menu, X, User, LogOut, ChevronDown } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useCartStore } from '../../stores/cartStore'
import { useAuth } from '../../features/auth/useAuth'
import { Logo } from '../../images'

const CENTER_LINKS = [
  { label: 'Destinations', href: '/destinations' },
  { label: 'Services', href: '/services' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'About Us', href: '/about' },
]

export function Navbar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const location = useLocation()
  const { user, isAuthenticated } = useAuthStore()
  const { toggleDrawer } = useCartStore()
  const totalItemCount = useCartStore((state) => state.items.reduce((sum, i) => sum + i.quantity, 0))
  const { logout } = useAuth()

  useEffect(() => {
    setIsMobileOpen(false)
    setIsDropdownOpen(false)
  }, [location])

  const linkClass = (href: string) => {
    const active =
      location.pathname === href || (href !== '/' && location.pathname.startsWith(href))
    return `font-display text-base tracking-tight pb-1 transition-colors duration-300 lg:text-lg ${
      active
        ? 'border-b-2 border-amber-600 text-[#041534]'
        : 'border-b-2 border-transparent text-slate-500 hover:text-amber-800'
    }`
  }

  const authActions = (
    <>
      {isAuthenticated && (
        <button
          type="button"
          onClick={toggleDrawer}
          className="relative p-1 text-slate-600 transition-colors hover:text-amber-800"
          aria-label="Open cart"
        >
          <ShoppingCart size={22} strokeWidth={1.5} />
          {totalItemCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-600 text-[10px] font-bold text-white">
              {totalItemCount}
            </span>
          )}
        </button>
      )}

      {isAuthenticated ? (
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 text-slate-600 transition-colors hover:text-amber-800"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#041534] text-sm font-bold text-white">
              {user?.firstName?.[0]}
            </div>
            <ChevronDown size={16} />
          </button>
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xl"
              >
                <div className="border-b border-stone-100 p-3">
                  <p className="text-sm font-semibold text-slate-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="truncate text-xs text-slate-500">{user?.email}</p>
                </div>
                <div className="py-1">
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-800 hover:bg-stone-50"
                  >
                    <User size={14} /> Dashboard
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-800 hover:bg-stone-50"
                    >
                      <User size={14} /> Admin
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => logout()}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex items-center gap-4 sm:gap-6">
          <Link
            to="/login"
            className="font-display text-base text-slate-500 transition-colors duration-300 hover:text-amber-800 lg:text-lg"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="rounded-lg bg-[#041534] px-5 py-2 font-sans text-sm font-medium text-white transition-all hover:bg-[#1b2a4a] active:scale-95 lg:px-6"
          >
            Sign Up
          </Link>
        </div>
      )}
    </>
  )

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-stone-200/70 bg-[#fbf9f5]/90 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto w-full max-w-screen-2xl px-6 py-4 md:px-12 md:py-5"
      >
        {/* Mobile top row */}
        <div className="flex items-center justify-between md:hidden">
          <Link to="/" className="block">
            <img src={Logo} alt="Starlings" className="h-10 w-auto object-contain" />
          </Link>
          <button
            type="button"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 text-slate-700"
            aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Desktop: full-width bar content — grid keeps nav links visually centered */}
        <div className="hidden items-center md:grid md:grid-cols-[1fr_auto_1fr] md:gap-4">
          <Link
            to="/"
            className="justify-self-start"
          >
            <img src={Logo} alt="Starlings" className="h-10 w-auto object-contain" />
          </Link>

          <div className="flex items-center justify-center gap-6 lg:gap-10">
            {CENTER_LINKS.map((link) => (
              <Link key={link.href} to={link.href} className={linkClass(link.href)}>
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center justify-end gap-4 lg:gap-6">{authActions}</div>
        </div>

        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 border-t border-stone-200 pt-4 md:hidden"
            >
              <div className="flex flex-col gap-1">
                {CENTER_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`py-3 font-display text-base ${
                      location.pathname === link.href ||
                      (link.href !== '/' && location.pathname.startsWith(link.href))
                        ? 'text-amber-800'
                        : 'text-slate-600'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link to="/contact" className="py-3 font-display text-base text-slate-600">
                  Contact
                </Link>
              </div>
              {!isAuthenticated && (
                <div className="mt-4 flex flex-col gap-3 border-t border-stone-100 pt-4">
                  <Link to="/login" className="text-center font-display text-slate-700">
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-lg bg-[#041534] py-3 text-center font-medium text-white"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
              {isAuthenticated && (
                <div className="mt-4 space-y-3 border-t border-stone-100 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Cart</span>
                    <button
                      type="button"
                      onClick={toggleDrawer}
                      className="relative p-2 text-slate-700"
                      aria-label="Open cart"
                    >
                      <ShoppingCart size={22} />
                      {totalItemCount > 0 && (
                        <span className="absolute -right-0 -top-0 flex h-5 w-5 items-center justify-center rounded-full bg-amber-600 text-[10px] font-bold text-white">
                          {totalItemCount}
                        </span>
                      )}
                    </button>
                  </div>
                  <Link to="/dashboard" className="block py-2 text-sm text-slate-700">
                    Dashboard
                  </Link>
                  <button type="button" onClick={() => logout()} className="py-2 text-sm text-red-600">
                    Sign Out
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </nav>
  )
}
