import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Mail, CheckCircle } from 'lucide-react'
import { SeoHelmet } from '../components/shared/SeoHelmet'
import { authApi } from '../api/auth.api'

const schema = z.object({ email: z.string().email('Enter a valid email') })
type Form = z.infer<typeof schema>

export function ForgotPassword() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: Form) => {
    try { setError(''); await authApi.forgotPassword(data.email); setSent(true) }
    catch { setError('Unable to send reset email. Please try again.') }
  }

  if (sent) return (
    <div className="min-h-screen bg-off-white flex items-center justify-center p-8">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
        <CheckCircle size={64} className="text-green-500 mx-auto mb-6" />
        <h1 className="font-display text-3xl font-bold text-navy mb-4">Check Your Email</h1>
        <p className="text-slate mb-8">If an account with that email exists, we've sent password reset instructions.</p>
        <Link to="/login" className="btn-primary">Back to Sign In</Link>
      </motion.div>
    </div>
  )

  return (
    <>
      <SeoHelmet title="Forgot Password" />
      <div className="min-h-screen bg-off-white flex items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-white rounded-2xl p-8 shadow-md">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <span className="text-xl">✈</span>
            <span className="font-display text-lg font-bold text-gold">Starlings</span>
          </Link>
          <h1 className="font-display text-3xl font-bold text-navy mb-2">Forgot Password?</h1>
          <p className="text-slate mb-8">Enter your email and we'll send you a reset link.</p>

          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label htmlFor="forgot-email" className="label-field">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
                <input id="forgot-email" type="email" placeholder="you@example.com" className={`input-field pl-10 ${errors.email ? 'border-red-400' : ''}`} {...register('email')} />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <Link to="/login" className="block text-center text-sm text-slate mt-6 hover:text-navy transition-colors">
            ← Back to Sign In
          </Link>
        </motion.div>
      </div>
    </>
  )
}
