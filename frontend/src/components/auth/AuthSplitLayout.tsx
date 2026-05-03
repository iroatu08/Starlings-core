import type { ReactNode } from 'react'

/** Shared palette for password / auth editorial screens */
export const authEditorial = {
  cream: '#F9F8F6',
  navy: '#0A162F',
  navyDeep: '#051024',
  gold: '#A88F5E',
  label: '#6B7280',
  border: '#D1D5DB',
} as const

type AuthSplitLayoutProps = {
  heroImage: string
  heroAlt: string
  left: ReactNode
  /** Vertical placement of hero copy on desktop */
  heroContentPosition?: 'bottom' | 'center'
  /** Top row inside right panel (e.g. logo + back link); omit for minimal flows */
  header?: ReactNode
  children: ReactNode
  /** Pinned to bottom of right column (help strip, copyright) */
  footer?: ReactNode
  /** Override right column background (e.g. cream variant) */
  rightClassName?: string
}

export function AuthSplitLayout({
  heroImage,
  heroAlt,
  left,
  heroContentPosition = 'bottom',
  header,
  children,
  footer,
  rightClassName = 'bg-[#F9F8F6]',
}: AuthSplitLayoutProps) {
  const heroJustify = heroContentPosition === 'center' ? 'justify-center' : 'justify-end'

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <section
        className={`hidden lg:flex relative min-h-[40vh] lg:min-h-screen flex-col ${heroJustify} overflow-hidden bg-[#0A162F]`}
      >
        <img
          src={heroImage}
          alt={heroAlt}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A162F]/95 via-[#0A162F]/40 to-transparent" />
        <div className="relative z-10 p-12 lg:p-16 text-white max-w-xl">
          {left}
        </div>
      </section>

      <section className={`flex min-h-screen flex-col ${rightClassName}`}>
        <div className="flex flex-1 flex-col px-6 py-8 md:px-12 lg:px-16">
          {header ?? null}
          <div className="flex flex-1 flex-col justify-center py-8 lg:py-12">
            <div className="mx-auto w-full max-w-md">{children}</div>
          </div>
          {footer}
        </div>
      </section>
    </div>
  )
}
