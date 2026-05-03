import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Globe,
  Headphones,
  Minus,
  Plus,
  ShieldCheck,
  X,
} from 'lucide-react'
import { SeoHelmet } from '../../components/shared/SeoHelmet'
import { useCart } from '../../features/cart/useCart'
import { formatCurrency } from '../../utils/formatCurrency'
import type { CartItem } from '../../types/cart.types'
import { groupCartItemsByDestination } from '../../utils/trip-line-groups.util'

function editorialCardShadow(): string {
  return 'shadow-[0_8px_40px_-12px_rgba(27,28,26,0.04)]'
}

function cartItemMetaLine(item: CartItem): string {
  const isBundle = Boolean(item.bundleSnapshot && item.destinationId)
  if (isBundle) {
    const n = item.bundleSnapshot?.keptPackageIds?.length ?? 0
    return `${n} curated package${n === 1 ? '' : 's'}`
  }
  const days = item.package?.durationDays
  const destName = item.package?.destination?.name
  const parts: string[] = []
  if (typeof days === 'number' && days > 0) {
    parts.push(`${days} night${days === 1 ? '' : 's'}`)
  }
  if (destName) parts.push(destName)
  if (parts.length) return parts.join(' · ')
  return item.package?.destination?.country || ''
}

function cartItemTitle(item: CartItem): string {
  const isBundle = Boolean(item.bundleSnapshot && item.destinationId)
  if (isBundle) {
    return `${item.destination?.name || 'Destination'} bundle`
  }
  return item.package?.title || item.destination?.name || 'Package'
}

function bundleDiscountNgn(items: CartItem[]): number {
  const subtotal = items.reduce((s, i) => s + Number(i.unitPriceNgn) * i.quantity, 0)
  if (items.length < 2) return 0
  return Math.round(subtotal * 0.05)
}

export function MyCart() {
  const { cart, isLoading, updateItem, removeItem, totalAmount, totalItems, isCartMutating } = useCart()

  const items = cart?.items ?? []
  const groupedItems = groupCartItemsByDestination(items)
  const bundleDiscount = bundleDiscountNgn(items)
  const totalDue = totalAmount - bundleDiscount

  return (
    <>
      <SeoHelmet title="Cart" description="Your Starlings Hospitality cart." />

      <div className="w-full bg-editorial-surface pb-12 font-sans text-editorial-on-background antialiased">
        <header className="mb-10 md:mb-16">
          <span className="mb-3 block font-sans text-sm font-bold uppercase tracking-[0.1em] text-editorial-gold">
            Your selection
          </span>
          <h1 className="font-display text-4xl tracking-tight text-editorial-primary md:text-5xl lg:text-6xl">
            Curation basket
          </h1>
        </header>

        {isLoading ? (
          <div className="grid min-h-[320px] grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-16">
            <div className="space-y-8 lg:col-span-8">
              <div className={`h-56 rounded-lg bg-white ${editorialCardShadow()} shimmer-bg`} />
              <div className={`h-56 rounded-lg bg-white ${editorialCardShadow()} shimmer-bg`} />
            </div>
            <div className="lg:col-span-4">
              <div className="h-96 rounded-lg bg-editorial-primary/20 shimmer-bg lg:sticky lg:top-28" />
            </div>
          </div>
        ) : !items.length ? (
          <div className="mx-auto max-w-md rounded-lg border border-editorial-outline-variant/20 bg-white p-10 text-center shadow-sm">
            <p className="mb-2 font-display text-2xl text-editorial-primary">Your basket is empty</p>
            <p className="mb-8 font-sans text-sm text-editorial-on-surface-variant">
              Explore destinations and curated packages to begin.
            </p>
            <Link
              to="/destinations"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-editorial-primary px-8 py-3 font-sans text-sm font-semibold uppercase tracking-widest text-white transition-colors hover:bg-navy-600"
            >
              Browse destinations
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="space-y-12 lg:col-span-8">
              {groupedItems.map((group) => (
                <div key={group.destinationKey} className="space-y-6">
                  <div className="border-b border-editorial-outline-variant/20 pb-3">
                    <h2 className="font-display text-2xl text-editorial-primary md:text-3xl">
                      {group.destinationName}
                      {group.country ? (
                        <span className="font-sans text-lg font-normal text-editorial-on-surface-variant">
                          {' '}
                          · {group.country}
                        </span>
                      ) : null}
                    </h2>
                    <p className="mt-1 font-sans text-sm text-editorial-on-surface-variant">
                      Subtotal {formatCurrency(group.subtotalNgn, 'NGN')}
                    </p>
                  </div>
                  <div className="space-y-8">
                    {group.lines.map((item) => {
                      const isBundle = Boolean(item.bundleSnapshot && item.destinationId)
                      const imageUrl =
                        item.destination?.heroImageUrl ||
                        item.package?.destination?.heroImageUrl ||
                        'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&q=80'
                      const title = cartItemTitle(item)
                      const meta = cartItemMetaLine(item)
                      const lineTotal = Number(item.unitPriceNgn) * item.quantity

                      const setQuantity = (next: number): void => {
                        const q = Math.min(99, Math.max(1, next))
                        if (q !== item.quantity) updateItem({ itemId: item.id, quantity: q })
                      }

                      return (
                        <article
                          key={item.id}
                          className={`group relative flex flex-col gap-8 bg-white p-6 md:flex-row md:p-8 ${editorialCardShadow()}`}
                        >
                          <div className="h-48 w-full shrink-0 overflow-hidden md:h-48 md:w-64">
                            <img
                              src={imageUrl}
                              alt=""
                              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                          </div>
                          <div className="flex min-w-0 flex-1 flex-col justify-between">
                            <div>
                              <div className="mb-2 flex items-start justify-between gap-4">
                                <h3 className="font-display text-xl leading-tight text-editorial-primary md:text-2xl">
                                  {title}
                                </h3>
                                <button
                                  type="button"
                                  onClick={() => removeItem(item.id)}
                                  disabled={isCartMutating}
                                  className="shrink-0 rounded p-1 text-editorial-on-surface-variant/40 transition-colors hover:text-red-600 disabled:opacity-50"
                                  aria-label="Remove from cart"
                                >
                                  <X className="h-5 w-5" strokeWidth={1.5} />
                                </button>
                              </div>
                              {meta ? (
                                <p className="mb-4 font-sans text-sm tracking-wide text-editorial-on-surface-variant">
                                  {meta}
                                </p>
                              ) : null}
                              <div className="mt-2 flex flex-wrap items-center gap-4">
                                <span className="font-sans text-xs font-bold uppercase tracking-wide text-editorial-on-surface-variant/60">
                                  {isBundle ? 'Bundle' : 'Quantity'}
                                </span>
                                {isBundle ? (
                                  <span className="font-display text-lg text-editorial-primary">Fixed</span>
                                ) : (
                                  <div className="flex items-center gap-3 rounded bg-editorial-surface-container-low px-3 py-1">
                                    <button
                                      type="button"
                                      disabled={isCartMutating || item.quantity <= 1}
                                      onClick={() => setQuantity(item.quantity - 1)}
                                      className="rounded p-1 text-editorial-primary transition-colors hover:bg-white/80 disabled:opacity-40"
                                      aria-label="Decrease quantity"
                                    >
                                      <Minus className="h-4 w-4" strokeWidth={2} />
                                    </button>
                                    <span className="min-w-[1.5rem] text-center font-display text-lg text-editorial-primary">
                                      {item.quantity}
                                    </span>
                                    <button
                                      type="button"
                                      disabled={isCartMutating || item.quantity >= 99}
                                      onClick={() => setQuantity(item.quantity + 1)}
                                      className="rounded p-1 text-editorial-primary transition-colors hover:bg-white/80 disabled:opacity-40"
                                      aria-label="Increase quantity"
                                    >
                                      <Plus className="h-4 w-4" strokeWidth={2} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="mt-6 flex justify-end border-t border-editorial-outline-variant/10 pt-4 md:border-0 md:pt-0">
                              <span className="font-display text-2xl text-editorial-primary">
                                {formatCurrency(lineTotal, 'NGN')}
                              </span>
                            </div>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between pt-4">
                <Link
                  to="/destinations"
                  className="group inline-flex items-center gap-2 border-b-2 border-editorial-primary/10 pb-1 font-sans text-sm font-medium text-editorial-primary transition-all hover:border-editorial-gold"
                >
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" aria-hidden />
                  Continue exploring
                </Link>
                <span className="hidden font-sans text-xs text-editorial-on-surface-variant sm:block">
                  {totalItems} piece{totalItems === 1 ? '' : 's'} in basket
                </span>
              </div>
            </div>

            <aside className="lg:col-span-4">
              <div className="space-y-8 bg-editorial-primary p-8 text-white md:p-10 lg:sticky lg:top-28">
                <h3 className="font-display text-2xl md:text-3xl">Summary</h3>
                <div className="space-y-4 font-sans">
                  <div className="flex items-center justify-between text-white/70">
                    <span>Subtotal</span>
                    <span className="font-display text-lg md:text-xl">{formatCurrency(totalAmount, 'NGN')}</span>
                  </div>
                  {bundleDiscount > 0 ? (
                    <div className="flex items-center justify-between text-green-200/90">
                      <span>Multi-line savings (5%)</span>
                      <span className="font-display text-lg md:text-xl">
                        − {formatCurrency(bundleDiscount, 'NGN')}
                      </span>
                    </div>
                  ) : null}
                </div>
                <div className="border-t border-white/10 pt-8">
                  <div className="flex items-end justify-between gap-4">
                    <span className="font-sans text-sm font-bold uppercase tracking-[0.1em] text-white/90">
                      Total due
                    </span>
                    <span className="font-display text-3xl text-[#fdce5d] md:text-4xl">
                      {formatCurrency(totalDue, 'NGN')}
                    </span>
                  </div>
                </div>
                <Link
                  to="/checkout"
                  className="group flex w-full items-center justify-between bg-editorial-gold px-6 py-4 text-editorial-primary transition-colors hover:bg-[#eec051] md:py-5 md:pl-8 md:pr-8"
                >
                  <span className="font-sans text-sm font-bold uppercase tracking-widest text-white">
                    Proceed to checkout
                  </span>
                  <ArrowRight
                    className="h-5 w-5 text-white transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </Link>
                <div className="flex flex-col items-center gap-4 pt-2 opacity-70">
                  <div
                    className="flex gap-6 text-white/90"
                    aria-label="Secure payment, concierge support, global destinations"
                  >
                    <ShieldCheck className="h-5 w-5" aria-hidden />
                    <Headphones className="h-5 w-5" aria-hidden />
                    <Globe className="h-5 w-5" aria-hidden />
                  </div>
                  <p className="text-center font-sans text-[10px] uppercase tracking-[0.2em] text-white/60">
                    Secure concierge checkout · Starlings Hospitality
                  </p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </>
  )
}
