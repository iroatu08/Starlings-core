import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { Facebook, Instagram, Linkedin, Youtube } from 'lucide-react'
import { Logo } from '../../images'

/** Public profile URLs — update to your real handles. */
const socialLinks: ReadonlyArray<{ href: string; label: string; Icon: LucideIcon }> = [
  { href: 'https://www.instagram.com/', label: 'Starlings on Instagram', Icon: Instagram },
  { href: 'https://www.facebook.com/', label: 'Starlings on Facebook', Icon: Facebook },
  { href: 'https://www.linkedin.com/', label: 'Starlings on LinkedIn', Icon: Linkedin },
  { href: 'https://www.youtube.com/', label: 'Starlings on YouTube', Icon: Youtube },
]

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
              <li>Block 4 Flat 3 Kings court II estate Willie Desanya street Abesan Lagos</li>
              <li>
                <a href="mailto:concierge@starlings.ae" className="transition-colors hover:text-white">
                info@starlingshsp.com
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
          <nav aria-label="Social media" className="flex items-center gap-6 text-white md:gap-8">
            {socialLinks.map(({ href, label, Icon }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
                aria-label={label}
              >
                <Icon size={22} strokeWidth={1.5} aria-hidden />
              </a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )
}
