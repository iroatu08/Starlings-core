import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Link, useSearchParams } from 'react-router-dom'
import { Lock, CheckCircle } from 'lucide-react'
import { SeoHelmet } from '../components/shared/SeoHelmet'
import { authApi } from '../api/auth.api'

const schema = z.object({
  newPassword: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/).regex(/[!@#$%^&*]/),
  confirm: z.string(),
}).refine(d => d.newPassword === d.confirm, { message: 'Passwords do not match', path: ['confirm'] })
type Form = z.infer<typeof schema>

export function ResetPassword() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: Form) => {
    try { setError(''); await authApi.resetPassword(token, data.newPassword); setDone(true) }
    catch { setError('Unable to reset password. This link may have expired.') }
  }

  if (done) return (
    <div className="min-h-screen bg-off-white flex items-center justify-center p-8">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
        <CheckCircle size={64} className="text-green-500 mx-auto mb-6" />
        <h1 className="font-display text-3xl font-bold text-navy mb-4">Password Reset!</h1>
        <p className="text-slate mb-8">Your password has been updated. You can now sign in.</p>
        <Link to="/login" className="btn-primary">Sign In</Link>
      </motion.div>
    </div>
  )

  return (
    <>
      <SeoHelmet title="Reset Password" />
      <div className="min-h-screen bg-off-white flex items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-white rounded-2xl p-8 shadow-md">
          <h1 className="font-display text-3xl font-bold text-navy mb-2">Reset Password</h1>
          <p className="text-slate mb-8">Choose a new password for your account.</p>
          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label htmlFor="new-password" className="label-field">New Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
                <input id="new-password" type="password" placeholder="New password" className={`input-field pl-9 ${errors.newPassword ? 'border-red-400' : ''}`} {...register('newPassword')} />
              </div>
              {errors.newPassword && <p className="text-red-500 text-xs mt-1">Must be 8+ chars with uppercase, number, and special char</p>}
            </div>
            <div>
              <label htmlFor="confirm-password" className="label-field">Confirm Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
                <input id="confirm-password" type="password" placeholder="Confirm password" className={`input-field pl-9 ${errors.confirm ? 'border-red-400' : ''}`} {...register('confirm')} />
              </div>
              {errors.confirm && <p className="text-red-500 text-xs mt-1">{errors.confirm.message}</p>}
            </div>
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
              {isSubmitting ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </motion.div>
      </div>
    </>
  )
}
