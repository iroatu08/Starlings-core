import { useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { SeoHelmet } from '../components/shared/SeoHelmet';
import { useAuth } from '../features/auth/useAuth';

const registerSchema = z
  .object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Enter a valid email'),
    phone: z.string().min(10, 'Phone number must be at least 10 characters').optional().or(z.literal('')),
    password: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[A-Z]/, 'Must include an uppercase letter')
      .regex(/[0-9]/, 'Must include a number')
      .regex(/[!@#$%^&*]/, 'Must include a special character'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const res = (error as { response?: { data?: { message?: string } } }).response;
    if (res?.data?.message && typeof res.data.message === 'string') return res.data.message;
  }
  return 'Registration failed. Please try again.';
}

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=1400&h=900&fit=crop&q=80';

const underlineInput =
  'w-full bg-transparent border-0 border-b border-[#c5c6cf]/30 py-3 px-0 focus:ring-0 outline-none focus:border-[#785a00] transition-all placeholder:text-stone-300 font-display text-lg text-[#1b1c1a]';

/**
 * Single-step registration aligned with the backend `/auth/register` endpoint.
 */
export function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const { register: registerUser, isRegistering, registerError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm): Promise<void> => {
    try {
      await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        phone: data.phone || undefined,
      });
      setSuccess(true);
    } catch {
      /* handled via registerError */
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fbf9f5] p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md text-center"
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#f5f3ef]">
            <CheckCircle size={40} className="text-[#785a00]" />
          </div>
          <h1 className="mb-4 font-display text-3xl font-semibold text-[#041534]">Check your email</h1>
          <p className="mb-8 font-light leading-relaxed text-[#45464e]">
            We have sent a verification link. Open it to activate your account, then sign in to continue
            booking.
          </p>
          <Link
            to="/login"
            className="inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-lg bg-[#041534] px-8 py-4 font-medium tracking-wide text-white transition-opacity hover:opacity-95"
          >
            Go to sign in
            <ArrowRight size={18} className="text-[#785a00]" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <SeoHelmet
        title="Join Starlings | Curated travel experiences"
        description="Create your Starlings account to book curated experiences across Nigeria, Ghana, and the UK."
      />

      <main className="grid min-h-screen grid-cols-1 overflow-hidden bg-[#fbf9f5] lg:grid-cols-12">
        <section className="relative hidden flex-col justify-between overflow-hidden bg-[#041534] p-16 text-stone-50 lg:col-span-5 lg:flex">
          <Link to="/" className="z-10">
            <h1 className="mb-2 font-display text-3xl font-semibold tracking-tight text-white">Starlings</h1>
            <p className="font-sans text-sm uppercase tracking-[0.1em] opacity-60">
              Curated hospitality experiences
            </p>
          </Link>
          <div className="z-10 max-w-md">
            <h2 className="mb-8 font-display text-5xl leading-tight">
              One step to start your next experience.
            </h2>
            <div className="flex items-center space-x-4 opacity-80">
              <span className="h-px w-12 bg-[#785a00]" />
              <p className="font-sans text-sm italic">Create an account, verify email, and book.</p>
            </div>
          </div>
          <div className="absolute inset-0 z-0">
            <img
              alt="Travelers enjoying a curated experience"
              width={1400}
              height={900}
              className="h-full w-full object-cover opacity-40 mix-blend-overlay"
              src={HERO_IMAGE}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#041534] via-transparent to-[#041534]/20" />
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center bg-[#fbf9f5] p-8 md:p-16 lg:col-span-7 lg:min-h-0 lg:p-24">
          <div className="w-full max-w-xl">
            <div className="mb-12 flex items-center justify-between">
              <div>
                <span className="mb-2 block text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#785a00]">
                  Join Starlings
                </span>
                <h3 className="font-display text-4xl text-[#041534]">Create your account</h3>
              </div>
              <Link
                to="/login"
                className="shrink-0 text-xs font-medium underline underline-offset-4 opacity-60 transition-opacity hover:opacity-100"
              >
                Already a member?
              </Link>
            </div>

            <p className="mb-10 font-light leading-relaxed text-[#45464e]">
            Your Starlings account gives you one place to plan, book, and manage every
            experience. Save your preferences, track your bookings, and enjoy a more
            personalized journey.
            </p>

            {registerError && (
              <div
                className="mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                role="alert"
              >
                <AlertCircle size={16} className="flex-shrink-0" />
                {getErrorMessage(registerError)}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
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
                  placeholder="julian@example.com"
                  className={underlineInput}
                  aria-invalid={errors.email ? 'true' : 'false'}
                  {...register('email')}
                />
              </FieldGroup>

              <FieldGroup label="Phone Number (optional)" error={errors.phone?.message}>
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
                <div className="group relative">
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
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-[#45464e]/70 hover:text-[#041534]"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </FieldGroup>

              <FieldGroup label="Confirm Password" error={errors.confirmPassword?.message}>
                <div className="group relative">
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
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-[#45464e]/70 hover:text-[#041534]"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </FieldGroup>

              <button
                type="submit"
                disabled={isRegistering}
                className="group relative flex w-full items-center justify-between overflow-hidden rounded-lg bg-[#041534] py-5 px-8 text-white transition-all hover:pr-10 disabled:cursor-not-allowed disabled:opacity-50"
                id="register-submit"
              >
                <span className="font-sans font-medium tracking-wide">
                  {isRegistering ? 'Creating account…' : 'Create account'}
                </span>
                {!isRegistering && (
                  <ArrowRight
                    size={22}
                    className="translate-x-0 text-[#785a00] transition-transform group-hover:translate-x-2"
                    aria-hidden
                  />
                )}
                <div className="absolute bottom-0 left-0 h-0.5 w-full origin-left scale-x-0 bg-[#785a00] transition-transform group-hover:scale-x-100" />
              </button>
            </form>

            <footer className="mt-16">
              <p className="max-w-sm font-light leading-loose text-[#45464e]/60 text-[0.7rem]">
                By continuing, you agree to Starlings Hospitality&apos;s{' '}
                <Link className="underline" to="/terms">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link className="underline" to="/privacy">
                  Privacy Policy
                </Link>
                .
              </p>
            </footer>
          </div>
        </section>
      </main>
    </>
  );
}

type FieldGroupProps = {
  label: string;
  error?: string;
  children: ReactNode;
};

function FieldGroup({ label, error, children }: FieldGroupProps) {
  return (
    <div className="group relative">
      <label className="mb-2 block text-[0.65rem] font-bold uppercase tracking-[0.1em] text-[#45464e] transition-colors group-focus-within:text-[#785a00]">
        {label}
      </label>
      {children}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
