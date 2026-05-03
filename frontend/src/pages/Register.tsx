  import { useState, type ReactNode } from 'react'
  import { useForm } from 'react-hook-form'
  import { zodResolver } from '@hookform/resolvers/zod'
  import { z } from 'zod'
  import { motion } from 'framer-motion'
  import { Link } from 'react-router-dom'
  import { Eye, EyeOff, AlertCircle, CheckCircle, ArrowRight, UtensilsCrossed, ShieldCheck } from 'lucide-react'
  import { SeoHelmet } from '../components/shared/SeoHelmet'
  import { useAuth } from '../features/auth/useAuth'

  const registerSchema = z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Enter a valid email'),
    phone: z.string().min(10, 'Phone number must be at least 10 characters').optional(),
    password: z.string()
      .min(8, 'At least 8 characters')
      .regex(/[A-Z]/, 'Must include an uppercase letter')
      .regex(/[0-9]/, 'Must include a number')
      .regex(/[!@#$%^&*]/, 'Must include a special character'),
    confirmPassword: z.string(),
    address: z.string().optional(),
    preferences: z.string().optional(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

  type RegisterForm = z.infer<typeof registerSchema>

  function getErrorMessage(error: unknown): string {
    if (error && typeof error === 'object' && 'response' in error) {
      const res = (error as { response?: { data?: { message?: string } } }).response
      if (res?.data?.message && typeof res.data.message === 'string') return res.data.message
    }
    return 'Registration failed. Please try again.'
  }

  const HERO_IMAGE =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDK92EoYvqpPO9oNe_SR30qQh9Im8aMlKlriRxx56Sbk4SU41UclK5dB1dwxSCHUzM7riSKpl_fcNna2r3FrXncXMkPA5Cf89Nb_X4y279g_XgSGuvEyuAlZJjiOKrzAGfXY6AbFDz_lyr4gqS4q3a0ZkAbKaZdfAwONh1U1GVEy13JzqNnF_Fw-8NyKlC0_M7zAvNjTZXXOP8_YM3QOoQ8O67rWUspAcSwOXrVotwljo5fBRvyNZ_SZh603i5xZYtNq7-CKX7fyGXy'

const underlineInput =
  'w-full bg-transparent border-0 border-b border-[#c5c6cf]/30 py-3 px-0 focus:ring-0 outline-none focus:border-[#785a00] transition-all placeholder:text-stone-300 font-display text-lg text-[#1b1c1a]'

  export function Register() {
    const [step, setStep] = useState<1 | 2>(1)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [success, setSuccess] = useState(false)
    const { register: registerUser, isRegistering, registerError } = useAuth()

    const { register, handleSubmit, trigger, formState: { errors } } = useForm<RegisterForm>({
      resolver: zodResolver(registerSchema),
    })

    const goNext = async () => {
      const ok = await trigger(['firstName', 'lastName', 'email', 'phone', 'password', 'confirmPassword'])
      if (ok) setStep(2)
    }

    const onSubmit = async (data: RegisterForm) => {
      try {
        await registerUser({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
          phone: data.phone,
          address: data.address,
          preferences: data.preferences,
        })
        setSuccess(true)
      } catch {
        /* handled via registerError */
      }
    }

    if (success) {
      return (
      <div className="min-h-screen bg-[#fbf9f5] flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md"
          >
          <div className="w-20 h-20 rounded-full bg-[#f5f3ef] flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-[#785a00]" />
            </div>
          <h1 className="font-display text-3xl font-semibold text-[#041534] mb-4">Check your email</h1>
          <p className="text-[#45464e] font-light leading-relaxed mb-8">
              We have sent a verification link. Open it to activate your account, then sign in to continue.
            </p>
            <Link
              to="/login"
            className="inline-flex w-full max-w-xs items-center justify-center gap-2 bg-[#041534] text-white py-4 px-8 rounded-lg font-medium tracking-wide hover:opacity-95 transition-opacity"
            >
              Go to sign in
            <ArrowRight size={18} className="text-[#785a00]" />
            </Link>
          </motion.div>
        </div>
      )
    }

    return (
      <>
        <SeoHelmet
          title="Join Starlings | Elevated Hospitality"
          description="Join our inner circle for exclusive access to Dubai's most prestigious residences and bespoke services."
        />

        <main className="min-h-screen grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-[#fbf9f5]">
          {/* Left: Editorial Brand Panel */}
          <section className="hidden lg:flex lg:col-span-5 relative flex-col justify-between p-16 overflow-hidden bg-[#041534] text-stone-50">
            <Link to="/" className="z-10">
              <h1 className="font-display text-3xl font-semibold tracking-tight mb-2 text-white">Starlings</h1>
              <p className="font-sans text-sm tracking-[0.1em] opacity-60 uppercase">The Art of Dubai Hospitality</p>
            </Link>
            <div className="z-10 max-w-md">
              <h2 className="font-display text-5xl leading-tight mb-8">
                Begin your journey with the digital concierge.
              </h2>
              <div className="flex items-center space-x-4 opacity-80">
                <span className="h-px w-12 bg-[#785a00]" />
                <p className="font-sans text-sm italic">Curated experiences, seamless transitions.</p>
              </div>
            </div>
            <div className="absolute inset-0 z-0">
              <img
                alt="Luxury hotel interior"
                className="w-full h-full object-cover opacity-40 mix-blend-overlay"
                src={HERO_IMAGE}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#041534] via-transparent to-[#041534]/20" />
            </div>
          </section>

          {/* Right: Sign Up Multi-Step Flow */}
          <section className="lg:col-span-7 flex items-center justify-center p-8 md:p-16 lg:p-24 bg-[#fbf9f5] min-h-screen lg:min-h-0">
            <div className="w-full max-w-xl">
              <nav aria-label="Progress" className="mb-16 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-8 sm:gap-12">
                  <StepIndicator
                    stepLabel="Step 01"
                    title="Account"
                    active={step === 1}
                    faded={false}
                  />
                  <StepIndicator
                    stepLabel="Step 02"
                    title="Preferences"
                    active={step === 2}
                    faded={step !== 2}
                  />
                  <div className="opacity-30">
                    <span className="block text-[0.65rem] font-bold tracking-[0.2em] uppercase text-[#45464e] mb-2">
                      Step 03
                    </span>
                    <span className="block text-sm font-medium text-[#45464e]">Verification</span>
                  </div>
                </div>
                <Link
                  to="/login"
                  className="text-xs font-medium underline underline-offset-4 opacity-60 hover:opacity-100 transition-opacity shrink-0 text-[#1b1c1a]"
                >
                  Already a member?
                </Link>
              </nav>

              <div className="space-y-12">
                <header>
                  <h3 className="font-display text-4xl text-[#041534] mb-4">
                    {step === 1 ? 'Create your account' : 'Your preferences'}
                  </h3>
                  <p className="text-[#45464e] leading-relaxed font-light">
                    {step === 1
                      ? "Join our inner circle for exclusive access to Dubai's most prestigious residences and bespoke services."
                      : 'Tell us how we can tailor your stay—optional details help your concierge prepare.'}
                  </p>
                </header>

                {registerError && (
                  <div
                    className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
                    role="alert"
                  >
                    <AlertCircle size={16} className="flex-shrink-0" />
                    {getErrorMessage(registerError)}
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
                  {step === 1 && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FieldGroup label="First Name" error={errors.firstName?.message}>
                          <input
                            id="firstName"
                            type="text"
                            placeholder="Julian"
                            className={underlineInput}
                            aria-invalid={errors.firstName ? 'true' : 'false'}
                            {...register('firstName')}
                          />
                        </FieldGroup>
                        <FieldGroup label="Last Name" error={errors.lastName?.message}>
                          <input
                            id="lastName"
                            type="text"
                            placeholder="St. James"
                            className={underlineInput}
                            aria-invalid={errors.lastName ? 'true' : 'false'}
                            {...register('lastName')}
                          />
                        </FieldGroup>
                      </div>
                      <FieldGroup label="Email Address" error={errors.email?.message}>
                        <input
                          id="reg-email"
                          type="email"
                          placeholder="julian@prestige.com"
                          className={underlineInput}
                          aria-invalid={errors.email ? 'true' : 'false'}
                          {...register('email')}
                        />
                      </FieldGroup>
                      {/* ad phone number */}
                      <FieldGroup label="Phone Number" error={errors.phone?.message}>
                        <input
                          id="phone"
                          type="tel"
                          placeholder="+234 50 000 0000"
                          className={underlineInput}
                          aria-invalid={errors.phone ? 'true' : 'false'}
                          {...register('phone')}
                        />
                      </FieldGroup>
                      <FieldGroup label="Create Password" error={errors.password?.message}>
                        <div className="relative group">
                          <input
                            id="reg-password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            className={`${underlineInput} pr-10`}
                            aria-invalid={errors.password ? 'true' : 'false'}
                            {...register('password')}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-0 top-1/2 -translate-y-1/2 text-[#45464e]/70 hover:text-[#041534] p-1"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </FieldGroup>
                      <FieldGroup label="Confirm Password" error={errors.confirmPassword?.message}>
                        <div className="relative group">
                          <input
                            id="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            className={`${underlineInput} pr-10`}
                            aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                            {...register('confirmPassword')}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-0 top-1/2 -translate-y-1/2 text-[#45464e]/70 hover:text-[#041534] p-1"
                            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                          >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </FieldGroup>
                      <div className="pt-8">
                        <button
                          type="button"
                          onClick={goNext}
                          className="w-full group relative flex items-center justify-between bg-[#041534] text-white py-5 px-8 rounded-lg overflow-hidden transition-all hover:pr-10"
                        >
                          <span className="font-sans font-medium tracking-wide">Continue to Preferences</span>
                          <ArrowRight
                            size={22}
                            className="text-[#785a00] translate-x-0 group-hover:translate-x-2 transition-transform"
                            aria-hidden
                          />
                          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#785a00] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                        </button>
                      </div>
                    </>
                  )}

                  {step === 2 && (
                    <>
                      <FieldGroup label="Phone (optional)" error={errors.phone?.message}>
                        <input
                          id="phone"
                          type="tel"
                          placeholder="+234 50 000 0000"
                          className={underlineInput}
                          {...register('phone')}
                        />
                      </FieldGroup>
                      <FieldGroup label="Address (optional)">
                        <textarea
                          id="address"
                          rows={3}
                          placeholder="City, country"
                          className={`${underlineInput} resize-y min-h-[5rem]`}
                          {...register('address')}
                        />
                      </FieldGroup>
                      <FieldGroup label="Travel preferences (optional)">
                        <textarea
                          id="preferences"
                          rows={3}
                          placeholder="Budget style, cabin class, interests…"
                          className={`${underlineInput} resize-y min-h-[5rem]`}
                          {...register('preferences')}
                        />
                      </FieldGroup>
                      <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="flex-1 border-2 border-[#c5c6cf]/40 text-[#041534] py-4 px-6 rounded-lg font-medium hover:bg-[#f5f3ef] transition-colors"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={isRegistering}
                          className="flex-1 group relative flex items-center justify-center gap-2 bg-[#041534] text-white py-4 px-6 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          id="register-submit"
                        >
                          {isRegistering ? 'Creating account…' : 'Create account'}
                          {!isRegistering && (
                            <ArrowRight size={20} className="text-[#785a00]" aria-hidden />
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </form>

                {/* Preview of next steps */}
                <div className="pt-12 grid grid-cols-2 gap-4">
                  <div
                    className={`p-6 bg-[#f5f3ef] rounded-xl flex flex-col justify-between h-40 border border-transparent transition-all ${
                      step === 2 ? 'opacity-90 grayscale-0' : 'opacity-40 grayscale'
                    }`}
                  >
                    <UtensilsCrossed className="text-[#041534] w-9 h-9" strokeWidth={1.25} />
                    <div>
                      <h4 className="text-xs font-bold tracking-widest uppercase mb-1 text-[#45464e]">
                        Coming Next
                      </h4>
                      <p className="text-sm font-display text-[#041534]">Curate your tastes</p>
                    </div>
                  </div>
                  <div className="p-6 bg-[#f5f3ef] rounded-xl flex flex-col justify-between h-40 opacity-40 grayscale">
                    <ShieldCheck className="text-[#041534] w-9 h-9" strokeWidth={1.25} />
                    <div>
                      <h4 className="text-xs font-bold tracking-widest uppercase mb-1 text-[#45464e]">
                        Coming Final
                      </h4>
                      <p className="text-sm font-display text-[#041534]">Secure Identity</p>
                    </div>
                  </div>
                </div>
              </div>

              <footer className="mt-24">
                <p className="text-[0.7rem] leading-loose text-[#45464e]/60 font-light max-w-sm">
                  By continuing, you agree to Starlings Hospitality&apos;s{' '}
                  <Link className="underline" to="/terms">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link className="underline" to="/privacy">
                    Privacy Policy
                  </Link>
                  . We value your privacy as much as your comfort.
                </p>
              </footer>
            </div>
          </section>
        </main>
      </>
    )
  }

  type StepIndicatorProps = {
    stepLabel: string
    title: string
    active: boolean
    /** Upcoming steps are faded; completed + current stay full opacity */
    faded: boolean
  }

  function StepIndicator({ stepLabel, title, active, faded }: StepIndicatorProps) {
    return (
      <div className={`relative ${faded ? 'opacity-30' : ''}`}>
        <span
          className={`block text-[0.65rem] font-bold tracking-[0.2em] uppercase mb-2 ${
            active ? 'text-[#785a00]' : 'text-[#45464e]'
          }`}
        >
          {stepLabel}
        </span>
        <span
          className={`block text-sm font-medium ${
            active ? 'text-[#041534]' : 'text-[#45464e]'
          }`}
        >
          {title}
        </span>
        {active && (
          <div className="absolute -bottom-4 left-0 w-8 h-0.5 bg-[#785a00]" aria-hidden />
        )}
      </div>
    )
  }

  type FieldGroupProps = {
    label: string
    error?: string
    children: ReactNode
  }

  function FieldGroup({ label, error, children }: FieldGroupProps) {
    return (
      <div className="relative group">
        <label className="block text-[0.65rem] font-bold tracking-[0.1em] uppercase text-[#45464e] mb-2 group-focus-within:text-[#785a00] transition-colors">
          {label}
        </label>
        {children}
        {error && <p className="text-red-600 text-xs mt-2">{error}</p>}
      </div>
    )
  }
