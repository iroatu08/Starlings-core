import { useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Link, useSearchParams } from 'react-router-dom'
import { Check, CheckCircle, Circle, Eye, EyeOff } from 'lucide-react'
import { SeoHelmet } from '../components/shared/SeoHelmet'
import { authApi } from '../api/auth.api'
import { AuthSplitLayout, authEditorial } from '../components/auth/AuthSplitLayout'

const RESET_HERO_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCyLKQylT3k49X9Q4b-eldOJGb_ZjUTIvhFH__uBM5Q4-ZQCf5HA7JTtTf9yIS9u6KOkVneiJWNFRKzuKepiRz_woApAcFMQET2-CReRHq6jxksFGjMgG4ivqPd_g9id9bt1L2kH29gbkO4upJ2OCEfK0wJXxyQ6-HKj7dE6HqXvNu87eZBGL7sYj1uSZbY3iIKxWNaJBVYqHbVWkKP9rQS5D4vo8uD9tTkX5ezFt-fJal5z5AYrbCB6lAobyl_XL0j6t-4gIj89Hv4'

const schema = z.object({
  newPassword: z.string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Must include an uppercase letter')
    .regex(/[0-9]/, 'Must include a number')
    .regex(/[!@#$%^&*]/, 'Must include a special character'),
  confirm: z.string(),
}).refine((d) => d.newPassword === d.confirm, { message: 'Passwords do not match', path: ['confirm'] })

type Form = z.infer<typeof schema>

const inputUnderline =
  'w-full border-0 border-b bg-transparent py-3 pr-10 font-sans text-base text-[#111827] placeholder:text-gray-400 focus:ring-0 outline-none transition-colors'

function getPasswordChecks(password: string) {
  return {
    length: password.length >= 8,
    number: /[0-9]/.test(password),
    upper: /[A-Z]/.test(password),
    special: /[!@#$%^&*]/.test(password),
  }
}

function strengthLabel(score: number): string {
  if (score <= 1) return 'WEAK'
  if (score === 2) return 'FAIR'
  if (score === 3) return 'GOOD'
  return 'STRONG'
}

export function ResetPassword() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: '', confirm: '' },
  })

  const newPasswordValue = useWatch({ control, name: 'newPassword', defaultValue: '' }) ?? ''

  const { checks, score, strengthText } = useMemo(() => {
    const c = getPasswordChecks(newPasswordValue)
    const s = Object.values(c).filter(Boolean).length
    return { checks: c, score: s, strengthText: strengthLabel(s) }
  }, [newPasswordValue])

  const onSubmit = async (data: Form) => {
    if (!token) {
      setError('This reset link is invalid or has expired.')
      return
    }
    try {
      setError('')
      await authApi.resetPassword(token, data.newPassword)
      setDone(true)
    } catch {
      setError('Unable to reset password. This link may have expired.')
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9F8F6] p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <CheckCircle size={56} strokeWidth={1.25} className="text-[#A88F5E] mx-auto mb-6" />
          <h1 className="font-display text-3xl font-semibold text-[#0A162F] mb-4">Password updated</h1>
          <p className="text-[#6B7280] leading-relaxed mb-8">
            Your password has been updated. You can now sign in with your new credentials.
          </p>
          <Link
            to="/login"
            className="inline-block w-full max-w-xs bg-[#051024] text-white font-semibold py-4 px-8 rounded-sm hover:opacity-95 transition-opacity"
          >
            Sign in
          </Link>
        </motion.div>
      </div>
    )
  }

  const requirementRow = (met: boolean, label: string) => (
    <div className="flex items-center gap-2 text-xs font-sans">
      {met ? (
        <Check className="h-4 w-4 shrink-0 text-[#A88F5E]" strokeWidth={2.5} aria-hidden />
      ) : (
        <Circle className="h-4 w-4 shrink-0 text-[#D1D5DB]" strokeWidth={1.5} aria-hidden />
      )}
      <span className={met ? 'text-[#374151]' : 'text-[#9CA3AF]'}>{label}</span>
    </div>
  )

  return (
    <>
      <SeoHelmet
        title="Reset your password | Starlings"
        description="Create a new secure password for your Starlings Hospitality account."
      />

      <AuthSplitLayout
        heroImage={RESET_HERO_IMAGE}
        heroAlt="Luxury bedroom with view toward balcony and trees"
        heroContentPosition="center"
        left={(
          <div className="text-center lg:text-left space-y-6 max-w-lg mx-auto lg:mx-0">
            <p className="font-display text-2xl italic text-white/95">Starlings</p>
            <h2 className="font-display text-3xl lg:text-[2.35rem] leading-tight font-semibold">
              Secure your sanctuary with a new password.
            </h2>
            <p className="text-white/80 text-sm leading-relaxed font-sans">
              Refining the art of hospitality through seamless security and unparalleled elegance.
            </p>
            <p className="pt-4 text-[0.65rem] tracking-[0.22em] uppercase text-white/65 font-sans">
              Exclusive concierge — Dubai | London | Paris
            </p>
          </div>
        )}
        header={(
          <div className="flex items-center justify-between gap-4 mb-4">
            <span className="font-display text-xl font-semibold text-[#0A162F]">Starlings</span>
            <Link to="/login" className="text-sm text-[#6B7280] hover:text-[#0A162F] transition-colors">
              ← Back to login
            </Link>
          </div>
        )}
      >
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <h1 className="font-display text-3xl lg:text-4xl font-semibold text-[#0A162F] mb-3">
            Reset your password
          </h1>
          <p className="text-[#6B7280] text-sm leading-relaxed mb-8 font-sans">
            Please enter your new password below. Make sure it&apos;s at least 8 characters long and meets the
            requirements.
          </p>

          {!token && (
            <div className="mb-6 p-3 rounded-md bg-amber-50 border border-amber-100 text-amber-900 text-sm" role="status">
              Missing reset token. Open the link from your email, or request a new reset from forgot password.
            </div>
          )}

          {error && (
            <div className="mb-6 p-3 rounded-md bg-red-50 border border-red-100 text-red-700 text-sm" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
            <div>
              <label htmlFor="new-password" className="block text-[0.65rem] font-bold tracking-[0.12em] uppercase text-[#9CA3AF] mb-2 font-sans">
                New password
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showNew ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className={`${inputUnderline} border-[#D1D5DB] focus:border-[#A88F5E] ${errors.newPassword ? 'border-red-400' : ''}`}
                  aria-invalid={errors.newPassword ? 'true' : 'false'}
                  {...register('newPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-[#9CA3AF] hover:text-[#0A162F]"
                  aria-label={showNew ? 'Hide password' : 'Show password'}
                >
                  {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-red-600 text-xs mt-2">{errors.newPassword.message}</p>
              )}

              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[0.65rem] font-bold tracking-[0.12em] uppercase text-[#9CA3AF] font-sans">
                    Password strength
                  </span>
                  <span className="text-[0.65rem] font-bold tracking-[0.12em] uppercase font-sans" style={{ color: authEditorial.gold }}>
                    {strengthText}
                  </span>
                </div>
                <div className="h-1 w-full rounded-full bg-[#E5E7EB] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${(score / 4) * 100}%`,
                      backgroundColor: authEditorial.gold,
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-1">
                  {requirementRow(checks.length, '8+ characters')}
                  {requirementRow(checks.number, 'One number')}
                  {requirementRow(checks.upper, 'One uppercase')}
                  {requirementRow(checks.special, 'Special symbol')}
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-[0.65rem] font-bold tracking-[0.12em] uppercase text-[#9CA3AF] mb-2 font-sans">
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className={`${inputUnderline} border-[#D1D5DB] focus:border-[#A88F5E] ${errors.confirm ? 'border-red-400' : ''}`}
                  aria-invalid={errors.confirm ? 'true' : 'false'}
                  {...register('confirm')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-[#9CA3AF] hover:text-[#0A162F]"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirm && <p className="text-red-600 text-xs mt-2">{errors.confirm.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !token}
              className="w-full bg-[#051024] text-white font-semibold py-4 rounded-sm hover:opacity-95 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Updating…' : 'Update password'}
            </button>
          </form>

          <Link
            to="/login"
            className="mt-8 inline-block text-sm text-[#6B7280] hover:text-[#0A162F] transition-colors"
          >
            ← Back to login
          </Link>
        </motion.div>
      </AuthSplitLayout>
    </>
  )
}
