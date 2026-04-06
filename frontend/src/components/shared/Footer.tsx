import { Link } from 'react-router-dom'
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react'

const footerLinks = {
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Our Team', href: '/about#team' },
    { label: 'Careers', href: '/about#careers' },
    { label: 'Press', href: '/about#press' },
  ],
  Destinations: [
    { label: 'France', href: '/destinations?country=France' },
    { label: 'United Kingdom', href: '/destinations?country=UK' },
    { label: 'Nigeria', href: '/destinations?country=Nigeria' },
    { label: 'United States', href: '/destinations?country=USA' },
    { label: 'UAE', href: '/destinations?country=UAE' },
    { label: 'Canada', href: '/destinations?country=Canada' },
  ],
  Services: [
    { label: 'Visa Assistance', href: '/services' },
    { label: 'Flight Bookings', href: '/services' },
    { label: 'Hotel Reservations', href: '/services' },
    { label: 'Activity Packages', href: '/services' },
    { label: 'Get Started', href: '/get-started' },
  ],
  Support: [
    { label: 'Contact Us', href: '/contact' },
    { label: 'FAQs', href: '/contact#faq' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
}

export function Footer() {
  return (
    <footer className="bg-navy text-white">
      {/* Main Footer */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <span className="text-2xl">✈</span>
              <div>
                <span className="font-display text-xl font-bold text-gold">Starlings</span>
                <span className="block text-xs text-white/40 tracking-widest uppercase">Hospitality</span>
              </div>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              Where your travel dreams become reality. A premium Dubai-based travel agency serving destinations across France, UK, Nigeria, USA, UAE, and Canada.
            </p>
            {/* Social */}
            <div className="flex gap-3">
              {[
                { icon: Facebook, href: '#', label: 'Facebook' },
                { icon: Instagram, href: '#', label: 'Instagram' },
                { icon: Twitter, href: '#', label: 'Twitter' },
                { icon: Youtube, href: '#', label: 'YouTube' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:border-gold hover:text-gold transition-all duration-200"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-gold text-sm mb-4 tracking-wide">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-white/60 text-sm hover:text-gold transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Strip */}
        <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: MapPin, text: 'Sheikh Zayed Road, Dubai, UAE' },
            { icon: Phone, text: '+971 50 000 0000' },
            { icon: Mail, text: 'info@starlingshosp.com' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-white/60 text-sm">
              <Icon size={16} className="text-gold flex-shrink-0" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 py-6">
        <div className="container-custom flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <p>© {new Date().getFullYear()} Starlings Hospitality. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-gold transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-gold transition-colors">Terms of Service</Link>
            <Link to="/sitemap" className="hover:text-gold transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
