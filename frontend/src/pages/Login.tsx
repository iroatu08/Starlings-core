import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react'
import { SeoHelmet } from '../components/shared/SeoHelmet'
import { useAuth } from '../features/auth/useAuth'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})
type LoginForm = z.infer<typeof loginSchema>

export function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const { login, isLoggingIn, loginError } = useAuth()
  const location = useLocation()

  const from = (location.state as any)?.from?.pathname || '/dashboard'

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data)
    } catch {}
  }

  const getErrorMessage = (error: any): string => {
    return error?.response?.data?.message || error?.message || 'Invalid credentials'
  }

  return (
    <>
      <SeoHelmet title="Sign In" description="Sign in to your Starlings Hospitality account." />

      <div className="min-h-screen bg-off-white flex">
        {/* Left image */}
        <div className="hidden lg:flex w-1/2 relative overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80"
            alt="Paris"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-navy/70" />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
            <span className="text-5xl mb-4">✈</span>
            <h2 className="font-display text-4xl font-bold text-white mb-4">
              Welcome Back to Starlings
            </h2>
            <p className="text-white/70 text-lg">
              Continue planning your next extraordinary adventure
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full max-w-md"
          >
            <div className="mb-8">
              <Link to="/" className="flex items-center gap-2 mb-8">
                <span className="text-xl">✈</span>
                <span className="font-display text-lg font-bold text-gold">Starlings</span>
              </Link>
              <h1 className="font-display text-3xl font-bold text-navy">Sign In</h1>
              <p className="text-slate mt-2">Enter your credentials to access your account</p>
            </div>

            {loginError && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm mb-6">
                <AlertCircle size={16} className="flex-shrink-0" />
                {getErrorMessage(loginError)}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              {/* Email */}
              <div>
                <label htmlFor="email" className="label-field">Email address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className={`input-field pl-10 ${errors.email ? 'border-red-400' : ''}`}
                    {...register('email')}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="label-field mb-0">Password</label>
                  <Link to="/forgot-password" className="text-xs text-gold hover:text-gold-600 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-400' : ''}`}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate hover:text-navy"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="btn-primary w-full"
                id="login-submit"
              >
                {isLoggingIn ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-sm text-slate mt-8">
              Don't have an account?{' '}
              <Link to="/register" className="text-gold font-semibold hover:text-gold-600 transition-colors">
                Create account
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </>
  )
}
