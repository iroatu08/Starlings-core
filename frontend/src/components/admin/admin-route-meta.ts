/**
 * Maps admin URLs to the contextual title shown in AdminHeader.
 * Longer prefixes are matched first so `/admin` does not swallow child routes.
 */
const ADMIN_SECTION_TITLES: { prefix: string; title: string }[] = [
  { prefix: '/admin/users', title: 'User Management' },
  { prefix: '/admin/bookings', title: 'Bookings Management' },
  { prefix: '/admin/payments', title: 'Payments Management' },
  { prefix: '/admin/destinations', title: 'Content Manager' },
  { prefix: '/admin/gallery', title: 'Gallery Management' },
  { prefix: '/admin/contact', title: 'Contact Submissions' },
  { prefix: '/admin/email', title: 'Email' },
]

/**
 * Returns the header bar title for the current admin route.
 */
export function getAdminSectionTitle(pathname: string): string {
  const normalized = pathname.replace(/\/$/, '') || '/admin'
  if (normalized === '/admin') {
    return 'Dashboard'
  }
  const sorted = [...ADMIN_SECTION_TITLES].sort((a, b) => b.prefix.length - a.prefix.length)
  const match = sorted.find(
    (entry) => normalized === entry.prefix || normalized.startsWith(`${entry.prefix}/`),
  )
  return match?.title ?? 'Admin'
}
