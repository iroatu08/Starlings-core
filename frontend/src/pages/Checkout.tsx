import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SeoHelmet } from '../components/shared/SeoHelmet'
import { useCartStore } from '../stores/cartStore'

export function Checkout() {
  const items = useCartStore((s) => s.items)

  return (
    <>
      <SeoHelmet title="Checkout" description="Complete your Starlings Hospitality booking." />

      <section className="section-padding bg-off-white min-h-[60vh] pt-28">
        <div className="container-custom max-w-lg">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-3xl font-bold text-navy mb-6">Checkout</h1>
            {items.length === 0 ? (
              <p className="text-slate mb-6">Your cart is empty.</p>
            ) : (
              <p className="text-slate mb-6">{items.length} item(s) in cart — payment integration can be wired here.</p>
            )}
            <Link to="/destinations" className="btn-primary">Continue shopping</Link>
          </motion.div>
        </div>
      </section>
    </>
  )
}
