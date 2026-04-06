import { AnimatePresence, motion } from 'framer-motion'
import { X, ShoppingBag, Trash2, Plus, Minus } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '../../stores/cartStore'
import { useCart } from '../../features/cart/useCart'
import { formatCurrency } from '../../utils/formatCurrency'

export function CartDrawer() {
  const { isOpen, closeDrawer } = useCartStore()
  const { cart, totalAmount, removeItem, updateItem } = useCart()
  const navigate = useNavigate()

  const items = cart?.items || []

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            className="fixed inset-0 bg-navy/50 backdrop-blur-sm z-50"
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <ShoppingBag size={22} className="text-gold" />
                <h2 className="font-display text-xl font-bold text-navy">Your Cart</h2>
                <span className="bg-gold text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                  {items.length}
                </span>
              </div>
              <button
                onClick={closeDrawer}
                className="w-9 h-9 rounded-full hover:bg-off-white flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag size={48} className="text-slate/30 mb-4" />
                  <p className="font-display text-lg font-bold text-navy">Your cart is empty</p>
                  <p className="text-slate text-sm mt-1 mb-6">Add some amazing travel packages</p>
                  <button
                    onClick={() => { closeDrawer(); navigate('/destinations') }}
                    className="btn-primary"
                  >
                    Browse Destinations
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      exit={{ opacity: 0, x: 50 }}
                      className="flex gap-4 p-4 rounded-xl bg-off-white border border-border"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-navy text-sm truncate">
                          {item.package?.title}
                        </p>
                        <p className="text-xs text-slate mt-0.5">
                          {item.package?.destination?.name}
                        </p>
                        <p className="text-gold font-bold mt-2 text-sm">
                          {formatCurrency(item.unitPriceNgn * item.quantity, 'NGN')}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-slate/50 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                        <div className="flex items-center gap-2 bg-white border border-border rounded-lg">
                          <button
                            onClick={() => updateItem({ itemId: item.id, quantity: Math.max(1, item.quantity - 1) })}
                            className="w-7 h-7 flex items-center justify-center hover:text-gold transition-colors"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="text-sm font-semibold text-navy w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateItem({ itemId: item.id, quantity: item.quantity + 1 })}
                            className="w-7 h-7 flex items-center justify-center hover:text-gold transition-colors"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-border space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate text-sm">Subtotal</span>
                  <span className="font-bold text-navy text-lg">{formatCurrency(totalAmount, 'NGN')}</span>
                </div>
                <Link
                  to="/checkout"
                  onClick={closeDrawer}
                  className="btn-primary w-full text-center block"
                  id="cart-checkout-btn"
                >
                  Proceed to Checkout
                </Link>
                <button
                  onClick={() => { closeDrawer(); navigate('/destinations') }}
                  className="w-full text-center text-sm text-slate hover:text-navy transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
