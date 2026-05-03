import { Link } from 'react-router-dom'
import { Logo } from '../../images'

const FOOTER_LINKS = [
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms of Service', to: '/terms' },
  { label: 'Contact', to: '/contact' },
  { label: 'Newsletter', to: '/contact' },
] as const

export function AdminFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="shrink-0 border-t border-slate-200/80 bg-admin-canvas px-4 py-4 md:px-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <img src={Logo} alt="" className="h-8 w-auto object-contain opacity-90" />
          <p className="text-sm text-slate-600">
            © {year} Starlings Hospitality. All rights reserved.
          </p>
        </div>
        <nav aria-label="Legal and contact">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {FOOTER_LINKS.map(({ label, to }) => (
              <li key={`${label}-${to}`}>
                <Link to={to} className="font-medium text-slate-600 transition-colors hover:text-admin-navy">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  )
}
