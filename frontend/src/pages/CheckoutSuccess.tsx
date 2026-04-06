import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SeoHelmet } from '../components/shared/SeoHelmet'

export function CheckoutSuccess() {
  return (
    <>
      <SeoHelmet title="Payment successful" description="Thank you for your booking with Starlings Hospitality." />

      <section className="section-padding bg-off-white min-h-[60vh] pt-28">
        <div className="container-custom max-w-lg text-center">
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
            <p className="text-5xl mb-4" aria-hidden>✓</p>
            <h1 className="font-display text-3xl font-bold text-navy mb-4">Thank you</h1>
            <p className="text-slate mb-8">Your payment was received. We will follow up with booking details.</p>
            <Link to="/dashboard" className="btn-primary">Go to dashboard</Link>
          </motion.div>
        </div>
      </section>
    </>
  )
}
