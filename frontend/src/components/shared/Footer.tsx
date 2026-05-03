import { Link } from 'react-router-dom'
import { Globe2, Languages, Share2 } from 'lucide-react'
import { Logo } from '../../images'

const exploreLinks = [
  { label: 'Destinations', href: '/destinations' },
  { label: 'Services', href: '/services' },
  { label: 'Gallery', href: '/gallery' },
]

const companyLinks = [
  { label: 'About Us', href: '/about' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'Privacy Policy', href: '/privacy' },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="w-full bg-[#041534] text-white">
      <div className="mx-auto max-w-screen-2xl px-6 pb-12 pt-24 md:px-12">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-10 xl:gap-x-16">
          <div className="max-w-sm">
            <Link to="/" className="mb-8 block">
              <img src={Logo} alt="Starlings" className="h-12 w-auto object-contain brightness-0 invert" />
            </Link>
            <p className="font-sans text-sm leading-relaxed tracking-wide text-stone-400">
              Elevating the art of travel in Dubai. Curating bespoke journeys for the modern connoisseur.
            </p>
          </div>

          <div>
            <h2 className="mb-6 font-display text-xl text-white">Explore</h2>
            <ul className="space-y-4">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="font-sans text-sm tracking-wide text-stone-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-6 font-display text-xl text-white">Company</h2>
            <ul className="space-y-4">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="font-sans text-sm tracking-wide text-stone-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-6 font-display text-xl text-white">Contact</h2>
            <ul className="space-y-4 font-sans text-sm tracking-wide text-stone-400">
              <li>Sheikh Zayed Road, Dubai, UAE</li>
              <li>
                <a href="mailto:concierge@starlings.ae" className="transition-colors hover:text-white">
                  concierge@starlings.ae
                </a>
              </li>
              <li>
                <a href="tel:+97141234567" className="transition-colors hover:text-white">
                +234 812 322 8812
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-24 flex flex-col items-center justify-between gap-8 border-t border-white/10 pt-12 md:flex-row md:items-start">
          <p className="text-center font-sans text-sm tracking-wide text-stone-400 md:text-left">
            © {year} Starlings Hospitality Dubai. All rights reserved.
          </p>
          <div className="flex items-center gap-8 text-white">
            <Languages
              size={22}
              strokeWidth={1.5}
              className="cursor-pointer transition-colors hover:text-amber-400"
              aria-hidden
            />
            <Globe2
              size={22}
              strokeWidth={1.5}
              className="cursor-pointer transition-colors hover:text-amber-400"
              aria-hidden
            />
            <Share2
              size={22}
              strokeWidth={1.5}
              className="cursor-pointer transition-colors hover:text-amber-400"
              aria-hidden
            />
          </div>
        </div>
      </div>
    </footer>
  )
}
