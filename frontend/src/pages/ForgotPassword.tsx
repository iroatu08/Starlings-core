import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { CheckCircle, MessageCircle, Phone } from 'lucide-react'
import { SeoHelmet } from '../components/shared/SeoHelmet'
import { authApi } from '../api/auth.api'
import { AuthSplitLayout, authEditorial } from '../components/auth/AuthSplitLayout'

const FORGOT_HERO_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCNkWH5Cqyvx9LWhdiJkA_HSsXnJInPSRweWYGs9vO7Qotl446dr6qo7xM9bNnhx6oLwPiPIONGJgmsPnfanpOJV_U3KaqRBvNENl7oXOp1Th4V0yefgmBDHd0KbDp1-cQhsIhoUopFdqZd8Uzxn1WmfjYyJ-LqWNjTH22HMr_VHkS1xFS7EUfBIPXVHCrmfdRM1JeH9wY9DxGypi4AwdSyl2Tx7oCJE0uQ3tRGLZ2ST16Oc2tIvxfoNT1rzXkQ1JDH_cSseTW5Gop8'

const schema = z.object({ email: z.string().email('Enter a valid email') })
type Form = z.infer<typeof schema>

const inputUnderline =
  'w-full border-0 border-b bg-transparent py-3 px-0 font-sans text-base text-[#111827] placeholder:text-gray-400 focus:ring-0 outline-none transition-colors'

export function ForgotPassword() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: Form) => {
    try {
      setError('')
      await authApi.forgotPassword(data.email)
      setSent(true)
    } catch {
      setError('Unable to send reset email. Please try again.')
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F8F6] p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <CheckCircle size={56} strokeWidth={1.25} className="text-[#A88F5E] mx-auto mb-6" />
          <h1 className="font-display text-3xl font-semibold text-[#0A162F] mb-4">Check your email</h1>
          <p className="text-[#6B7280] leading-relaxed mb-8">
            If an account with that email exists, we&apos;ve sent password reset instructions.
          </p>
          <Link
            to="/login"
            className="inline-block w-full max-w-xs bg-[#0A162F] text-white uppercase tracking-wider text-sm font-medium py-4 px-8 rounded-sm hover:opacity-95 transition-opacity"
          >
            Back to sign in
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <>
      <SeoHelmet
        title="Forgotten access | Starlings"
        description="Reset your Starlings Hospitality password. We will email you secure instructions."
      />

      <AuthSplitLayout
        heroImage={FORGOT_HERO_IMAGE}
        heroAlt="Luxury lounge at night with velvet seating and city views"
        left={(
          <div className="space-y-5">
            <p className="text-[0.7rem] tracking-[0.28em] uppercase font-sans" style={{ color: authEditorial.gold }}>
              The Art of Living
            </p>
            <h2 className="font-display text-3xl lg:text-[2.25rem] leading-tight font-semibold">
              Return to your curated escape.
            </h2>
            <p className="text-white/85 text-sm leading-relaxed font-sans max-w-md">
              Starlings Hospitality bridges the gap between travel and homecoming. Rediscover your preferences,
              saved destinations, and member-exclusive services.
            </p>
          </div>
        )}
        header={(
          <div className="flex items-center justify-between gap-4 mb-4">
            <span className="font-display text-xl font-semibold text-[#0A162F]">Starlings</span>
            <Link
              to="/login"
              className="text-sm text-[#6B7280] hover:text-[#0A162F] transition-colors"
            >
              ← Back to login
            </Link>
          </div>
        )}
        footer={(
          <div className="w-full max-w-md mx-auto">
            <div className="border-t border-[#E8E6E3] pt-8">
              <p className="text-center text-[0.65rem] tracking-[0.25em] uppercase text-[#9CA3AF] mb-6 font-sans">
                Need help?
              </p>
              <div className="grid grid-cols-2 gap-3">
                <a
                  href="mailto:info@starlings.com"
                  className="flex items-center justify-center gap-2 rounded-md border border-[#E5E7EB] bg-white py-3.5 text-sm text-[#374151] hover:bg-gray-50 transition-colors"
                >
                  <MessageCircle size={18} strokeWidth={1.5} className="text-[#6B7280]" aria-hidden />
                  Chat Support
                </a>
                <a
                  href="tel:+2348123228812"
                  className="flex items-center justify-center gap-2 rounded-md border border-[#E5E7EB] bg-white py-3.5 text-sm text-[#374151] hover:bg-gray-50 transition-colors"
                >
                  <Phone size={18} strokeWidth={1.5} className="text-[#6B7280]" aria-hidden />
                  Call Desk
                </a>
              </div>
            </div>
            <p className="text-right text-[0.65rem] tracking-[0.12em] uppercase text-[#9CA3AF] mt-10 font-sans">
              © {new Date().getFullYear()} Starlings Hospitality. All rights reserved.
            </p>
          </div>
        )}
      >
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <h1 className="font-display text-3xl lg:text-4xl font-semibold text-[#0A162F] mb-3">
            Forgotten access?
          </h1>
          <p className="text-[#6B7280] text-sm leading-relaxed mb-10 font-sans">
            We&apos;ll send you an email with instructions to reset your password.
          </p>

          {error && (
            <div className="mb-6 p-3 rounded-md bg-red-50 border border-red-100 text-red-700 text-sm" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
            <div>
              <label htmlFor="forgot-email" className="block text-[0.65rem] font-bold tracking-[0.12em] uppercase text-[#9CA3AF] mb-2 font-sans">
                Email address
              </label>
              <input
                id="forgot-email"
                type="email"
                autoComplete="email"
                placeholder="concierge@starlings.luxury"
                className={`${inputUnderline} border-[#D1D5DB] focus:border-[#A88F5E] ${errors.email ? 'border-red-400' : ''}`}
                aria-invalid={errors.email ? 'true' : 'false'}
                {...register('email')}
              />
              {errors.email && <p className="text-red-600 text-xs mt-2">{errors.email.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#0A162F] text-white uppercase tracking-[0.2em] text-xs font-semibold py-4 rounded-sm hover:opacity-95 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        </motion.div>
      </AuthSplitLayout>
    </>
  )
}
