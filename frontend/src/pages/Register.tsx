import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, Phone, AlertCircle, CheckCircle } from 'lucide-react'
import { SeoHelmet } from '../components/shared/SeoHelmet'
import { useAuth } from '../features/auth/useAuth'

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().optional(),
  password: z.string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Must include an uppercase letter')
    .regex(/[0-9]/, 'Must include a number')
    .regex(/[!@#$%^&*]/, 'Must include a special character'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})
type RegisterForm = z.infer<typeof registerSchema>

export function Register() {
  const [showPassword, setShowPassword] = useState(false)
  const [success, setSuccess] = useState(false)
  const { register: registerUser, isRegistering, registerError } = useAuth()

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const password = watch('password', '')

  const onSubmit = async (data: RegisterForm) => {
    try {
      await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phone: data.phone,
      })
      setSuccess(true)
    } catch {}
  }

  const getErrorMessage = (error: any): string => {
    return error?.response?.data?.message || 'Registration failed. Please try again.'
  }

  if (success) {
    return (
      <div className="min-h-screen bg-off-white flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h1 className="font-display text-3xl font-bold text-navy mb-4">Check Your Email!</h1>
          <p className="text-slate mb-8">
            We've sent a verification link to your email address. Please click the link to activate your account.
          </p>
          <Link to="/login" className="btn-primary">Go to Sign In</Link>
        </motion.div>
      </div>
    )
  }

  return (
    <>
      <SeoHelmet title="Create Account" description="Join Starlings Hospitality and start booking your dream trips." />

      <div className="min-h-screen bg-off-white flex">
        {/* Left image */}
        <div className="hidden lg:flex w-1/2 relative overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80"
            alt="Dubai"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-navy/70" />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
            <span className="text-5xl mb-4">✈</span>
            <h2 className="font-display text-4xl font-bold text-white mb-4">
              Start Your Journey
            </h2>
            <p className="text-white/70 text-lg">
              Join thousands of travellers who trust Starlings for their adventures
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-md py-8"
          >
            <div className="mb-8">
              <Link to="/" className="flex items-center gap-2 mb-8">
                <span className="text-xl">✈</span>
                <span className="font-display text-lg font-bold text-gold">Starlings</span>
              </Link>
              <h1 className="font-display text-3xl font-bold text-navy">Create Account</h1>
              <p className="text-slate mt-2">Join us and start exploring the world</p>
            </div>

            {registerError && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm mb-6">
                <AlertCircle size={16} className="flex-shrink-0" />
                {getErrorMessage(registerError)}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="label-field">First Name</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
                    <input id="firstName" type="text" placeholder="John" className={`input-field pl-9 ${errors.firstName ? 'border-red-400' : ''}`} {...register('firstName')} />
                  </div>
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
                </div>
                <div>
                  <label htmlFor="lastName" className="label-field">Last Name</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
                    <input id="lastName" type="text" placeholder="Doe" className={`input-field pl-9 ${errors.lastName ? 'border-red-400' : ''}`} {...register('lastName')} />
                  </div>
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="reg-email" className="label-field">Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
                  <input id="reg-email" type="email" placeholder="you@example.com" className={`input-field pl-9 ${errors.email ? 'border-red-400' : ''}`} {...register('email')} />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="label-field">Phone <span className="text-slate font-normal">(optional)</span></label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
                  <input id="phone" type="tel" placeholder="+234 800 000 0000" className="input-field pl-9" {...register('phone')} />
                </div>
              </div>

              <div>
                <label htmlFor="reg-password" className="label-field">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
                  <input id="reg-password" type={showPassword ? 'text' : 'password'} placeholder="Create a strong password" className={`input-field pl-9 pr-10 ${errors.password ? 'border-red-400' : ''}`} {...register('password')} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="label-field">Confirm Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
                  <input id="confirmPassword" type="password" placeholder="Repeat password" className={`input-field pl-9 ${errors.confirmPassword ? 'border-red-400' : ''}`} {...register('confirmPassword')} />
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
              </div>

              <button type="submit" disabled={isRegistering} className="btn-primary w-full" id="register-submit">
                {isRegistering ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-sm text-slate mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-gold font-semibold hover:text-gold-600 transition-colors">Sign In</Link>
            </p>
          </motion.div>
        </div>
      </div>
    </>
  )
}
