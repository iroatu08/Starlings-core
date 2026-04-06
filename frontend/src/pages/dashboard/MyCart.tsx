import { Link } from 'react-router-dom'
import { SeoHelmet } from '../../components/shared/SeoHelmet'
import { useCartStore } from '../../stores/cartStore'

export function MyCart() {
  const items = useCartStore((s) => s.items)

  return (
    <>
      <SeoHelmet title="Cart" description="Your Starlings Hospitality cart." />
      <div className="bg-white border border-border rounded-2xl p-8 shadow-sm">
        <h1 className="font-display text-2xl font-bold text-navy mb-4">Cart</h1>
        {items.length === 0 ? (
          <p className="text-slate mb-4">Your cart is empty.</p>
        ) : (
          <p className="text-slate mb-4">{items.length} item(s) — open the cart drawer from the header to review.</p>
        )}
        <Link to="/checkout" className="btn-primary">Go to checkout</Link>
      </div>
    </>
  )
}
