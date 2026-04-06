import { motion } from 'framer-motion'
import { CheckCircle, Clock, Users } from 'lucide-react'
import type { Package } from '../../types/destination.types'
import { formatCurrency } from '../../utils/formatCurrency'
import { useCart } from '../../features/cart/useCart'
import { useAuthStore } from '../../stores/authStore'
import { useNavigate } from 'react-router-dom'

interface PackageCardProps {
  pkg: Package
  index?: number
}

export function PackageCard({ pkg, index = 0 }: PackageCardProps) {
  const { addItem, isAddingItem } = useCart()
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    await addItem({ packageId: pkg.id, quantity: 1 })
  }

  const inclusions = [
    { label: 'Visa', included: pkg.includesVisa },
    { label: 'Flight', included: pkg.includesFlight },
    { label: 'Hotel', included: pkg.includesHotel },
    { label: 'Activities', included: pkg.includesActivities },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white rounded-2xl shadow-md overflow-hidden border border-border card-hover"
    >
      {/* Header */}
      <div className="gradient-navy p-6">
        <h3 className="font-display text-lg font-bold text-white mb-1">{pkg.title}</h3>
        <div className="flex items-center gap-4 text-white/70 text-sm">
          <span className="flex items-center gap-1"><Clock size={14} /> {pkg.durationDays} days</span>
          <span className="flex items-center gap-1"><Users size={14} /> Max {pkg.maxCapacity}</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        <p className="text-slate text-sm leading-relaxed mb-5 line-clamp-3">
          {pkg.description}
        </p>

        {/* Inclusions */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          {inclusions.map(({ label, included }) => (
            <div key={label} className={`flex items-center gap-2 text-sm ${included ? 'text-navy' : 'text-slate/40'}`}>
              <CheckCircle size={14} className={included ? 'text-gold' : 'text-slate/30'} />
              {label}
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="text-xs text-slate">Price per person</p>
            <p className="text-2xl font-bold text-navy">{formatCurrency(pkg.priceNgn, 'NGN')}</p>
            <p className="text-sm text-slate">${pkg.priceUsd.toLocaleString()} USD</p>
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={isAddingItem}
          className="w-full btn-primary"
          id={`add-to-cart-${pkg.id}`}
        >
          {isAddingItem ? 'Adding...' : 'Add to Cart'}
        </button>
      </div>
    </motion.div>
  )
}
