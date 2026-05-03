import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { SeoHelmet } from '../components/shared/SeoHelmet'
import { useAuth } from '../features/auth/useAuth'
import { AuthSplitLayout } from '../components/auth/AuthSplitLayout'
import { toastApiError } from '../utils/toast-error'
import { toast } from '@/hooks/use-toast'

const LOGIN_HERO_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAZckN00VjFeeDmG0ykQpnZz6tSJIfLhke0FrwmR6gmfuRzIE28CxFMORFjCA6rROCZkSq0sjd7gbHLiM6vYgA7CA4u7FEiidvlsavYNG40aPbVL53YwBKqa0Vmw_Ak7sGD-zDAlmJNoOEDTzt21ovn2r88M9ZXtcWgzYa1ZuKRsunnJtXEnpIxOyes8M2qizbCop-QQAKgE3rZXAyZPrq1RMJ5I5QVUsJVWEfsoBl1AYpukHLwd5wCDJRTZtuvxV5sA4ptpbzhnF0T'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})
type LoginForm = z.infer<typeof loginSchema>

const inputUnderline =
  'w-full border-0 border-b bg-transparent py-3 pr-10 font-sans text-base text-[#111827] placeholder:text-gray-400 focus:ring-0 outline-none transition-colors'

function GoogleMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="20" height="20" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

function AppleMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="20" height="20" aria-hidden>
      <path
        fill="currentColor"
        d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.13 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
      />
    </svg>
  )
}

export function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const { login, isLoggingIn, loginError } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data)
      toast({
        variant: 'success',
        title: 'Login successful',
        description: 'Welcome back to Starlings',
      })
    } catch {
      /* surfaced via loginError + toast */
    }
  }

  const onSocialPlaceholder = (provider: 'Google' | 'Apple') => {
    toast({
      title: `${provider} sign-in`,
      description: 'This option will be available soon.',
    })
  }

  useEffect(() => {
    if (loginError) {
      toastApiError(loginError, { title: 'Sign in failed' })
    }
  }, [loginError])

  return (
    <>
      <SeoHelmet title="Member sign in | Starlings" description="Sign in to your Starlings Hospitality account." />

      <AuthSplitLayout
        heroImage={LOGIN_HERO_IMAGE}
        heroAlt="Dubai skyline at dusk with Burj Khalifa"
        heroContentPosition="bottom"
        rightClassName="bg-[#fbf9f5]"
        footer={
          <p className="pb-8 text-center font-sans text-sm text-[#4b5563]">
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-[#785a00] transition-colors hover:text-[#5a4300]"
            >
              Sign Up
            </Link>
          </p>
        }
        left={(
          <div className="relative w-full min-h-[min(70vh,560px)] lg:min-h-[calc(100vh-8rem)]">
            <p className="absolute left-0 top-0 font-display text-2xl italic text-white/95">Starlings</p>
            <div className="absolute bottom-0 left-0 right-0 max-w-lg space-y-5">
              <h2 className="font-display text-3xl font-semibold leading-tight text-white lg:text-[2.1rem]">
                Welcome Back to the Gilded Collection
              </h2>
              <p className="font-sans text-sm leading-relaxed text-white/88">
                Continue your journey through the world&apos;s most curated destinations.
              </p>
              <p className="pt-2 font-sans text-[0.65rem] uppercase tracking-[0.22em] text-white/70">
                The Dubai Portfolio — No. 0842
              </p>
            </div>
          </div>
        )}
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <header className="mb-10">
            <p className="font-sans text-[0.65rem] font-medium uppercase tracking-[0.22em] text-[#785a00]">
              Secure access
            </p>
            <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-[#041534] md:text-[2.25rem]">
              Member Sign In
            </h1>
            <p className="mt-3 max-w-md font-sans text-sm leading-relaxed text-[#374151]">
              Enter your credentials to manage your stays.
            </p>
          </header>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
            <div>
              <label
                htmlFor="login-email"
                className="mb-2 block font-sans text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[#041534]"
              >
                <span className="uppercase">Email address</span>
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="concierge@starlings.com"
                className={`${inputUnderline} border-b border-[#d1d5db] focus:border-[#785a00] ${errors.email ? 'border-red-400 focus:border-red-400' : ''}`}
                aria-invalid={errors.email ? 'true' : 'false'}
                {...register('email')}
              />
              {errors.email && <p className="mt-2 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <div className="mb-2 flex items-end justify-between gap-3">
                <label
                  htmlFor="login-password"
                  className="font-sans text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[#041534]"
                >
                  <span className="uppercase">Password</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="font-sans text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[#785a00] transition-opacity hover:opacity-80"
                >
                  <span className="uppercase">Forgot password?</span>
                </Link>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`${inputUnderline} border-b border-[#d1d5db] focus:border-[#785a00] ${errors.password ? 'border-red-400 focus:border-red-400' : ''}`}
                  aria-invalid={errors.password ? 'true' : 'false'}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-[#9ca3af] hover:text-[#041534]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="mt-2 text-xs text-red-600">{errors.password.message}</p>}
            </div>

            <label className="flex cursor-pointer select-none items-center gap-3">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded-sm border-[#d1d5db] accent-[#041534] focus:ring-[#785a00] focus:ring-offset-0"
              />
              <span className="font-sans text-sm text-[#4b5563]">Remember my preference</span>
            </label>

            <button
              type="submit"
              disabled={isLoggingIn}
              id="login-submit"
              className="w-full rounded-sm bg-[#041534] py-4 font-sans text-xs font-bold uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoggingIn ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center" aria-hidden>
              <div className="w-full border-t border-stone-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#fbf9f5] px-4 font-sans text-[0.65rem] uppercase tracking-[0.14em] text-[#9ca3af]">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => onSocialPlaceholder('Google')}
              className="flex items-center justify-center gap-2 rounded-sm border border-stone-200 bg-white py-3.5 font-sans text-xs font-bold uppercase tracking-[0.12em] text-[#111827] transition-colors hover:bg-stone-50"
            >
              <GoogleMark />
              Google
            </button>
            <button
              type="button"
              onClick={() => onSocialPlaceholder('Apple')}
              className="flex items-center justify-center gap-2 rounded-sm border border-stone-200 bg-white py-3.5 font-sans text-xs font-bold uppercase tracking-[0.12em] text-[#111827] transition-colors hover:bg-stone-50"
            >
              <AppleMark className="text-black" />
              Apple
            </button>
          </div>
        </motion.div>
      </AuthSplitLayout>
    </>
  )
}
