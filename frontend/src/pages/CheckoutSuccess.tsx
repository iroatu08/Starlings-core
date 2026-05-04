import { Link, useSearchParams } from 'react-router-dom'
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, BookOpen, CheckCircle2, Headphones } from 'lucide-react'
import { SeoHelmet } from '../components/shared/SeoHelmet'
import { paymentsApi } from '../api/payments.api'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=2000&q=80'
const SIDE_IMAGE =
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80'

export function CheckoutSuccess() {
  const [params] = useSearchParams()
  const ref = params.get('reference') || params.get('trxref')

  /** Confirms payment when landing with ?reference= / ?trxref= (covers redirect flows or if inline verify errored). */
  useEffect(() => {
    const reference = params.get('reference') || params.get('trxref')
    if (!reference) return
    const storageKey = `stl-checkout-verify:${reference}`
    if (sessionStorage.getItem(storageKey)) return
    sessionStorage.setItem(storageKey, '1')
    void paymentsApi.verify(reference).catch((err: unknown) => {
      sessionStorage.removeItem(storageKey)
      console.error('Checkout success: payment verify', err)
    })
  }, [params])

  return (
    <>
      <SeoHelmet title="Payment successful" description="Thank you for your booking with Starlings Hospitality." />

      <div className="min-h-screen bg-editorial-surface font-sans text-editorial-on-background antialiased">
        {/* Hero */}
        <section className="relative flex min-h-[480px] w-full items-center overflow-hidden md:min-h-[600px] lg:h-[716px]">
          <div className="absolute inset-0 z-0">
            <img
              src={HERO_IMAGE}
              alt=""
              className="h-full w-full object-cover"
            />
            <div
              className="absolute inset-0 bg-gradient-to-r from-[rgba(4,21,52,0.9)] via-[rgba(4,21,52,0.55)] to-[rgba(4,21,52,0.35)]"
              aria-hidden
            />
          </div>
          <div className="relative z-10 mx-auto w-full max-w-[1440px] px-6 pb-16 pt-28 md:px-12 md:pb-20 md:pt-32 lg:pt-36">
            <motion.div
              className="max-w-3xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <div className="mb-8 inline-flex items-center gap-3">
                <span className="h-px w-12 bg-editorial-gold" aria-hidden />
                <span className="font-sans text-sm font-medium uppercase tracking-[0.2em] text-editorial-gold">
                  Reservation confirmed
                </span>
              </div>
              <h1 className="mb-6 font-display text-4xl leading-tight tracking-tight text-white md:text-5xl lg:text-7xl">
                Thank you for choosing Starlings. Your journey begins soon.
              </h1>
              <div className="mt-10 flex flex-col gap-8 md:mt-12 md:flex-row md:items-center">
                {ref ? (
                  <>
                    <div className="flex flex-col">
                      <span className="mb-1 font-sans text-xs uppercase tracking-widest text-white/60">
                        Payment reference
                      </span>
                      <span className="break-all font-display text-xl text-white md:text-2xl">{ref}</span>
                    </div>
                    <div className="hidden h-12 w-px bg-white/20 md:block" aria-hidden />
                  </>
                ) : null}
                <div className="flex items-start gap-3 md:items-center">
                  <CheckCircle2
                    className="mt-0.5 h-7 w-7 shrink-0 text-editorial-gold"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  <p className="text-lg text-white/90">
                    A confirmation email has been sent to your inbox.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Next steps + summary */}
        <section className="relative z-20 -mt-16 w-full max-w-[1440px] px-6 pb-20 md:-mt-24 md:px-12 md:pb-24 lg:-mt-24">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
            <motion.div
              className="rounded-lg border border-editorial-outline-variant/15 bg-white p-8 shadow-[0_8px_40px_-12px_rgba(27,28,26,0.04)] md:p-12 lg:col-span-7"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 }}
            >
              <h2 className="mb-6 font-display text-2xl text-editorial-primary md:mb-8 md:text-3xl">
                Next steps
              </h2>
              <p className="mb-10 max-w-xl text-lg font-light leading-relaxed text-editorial-on-surface-variant md:mb-12">
                Your experience is being prepared by our team. You can manage your booking, update preferences,
                or add services anytime from your account — start on your{' '}
                <Link to="/dashboard" className="font-medium text-editorial-primary underline-offset-2 hover:underline">
                  dashboard
                </Link>
                .
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
                <Link
                  to="/dashboard/bookings"
                  className="group inline-flex items-center justify-center gap-2 rounded-md bg-editorial-primary px-8 py-4 text-center font-sans font-medium text-white transition-all duration-300 hover:bg-navy-600"
                >
                  View my bookings
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </Link>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center justify-center border-b-2 border-editorial-primary/10 py-4 text-center font-sans font-medium text-editorial-primary transition-all duration-300 hover:border-editorial-gold sm:px-2"
                >
                  Return to dashboard
                </Link>
                <Link
                  to="/"
                  className="inline-flex items-center justify-center py-4 text-center font-sans text-sm font-medium text-editorial-on-surface-variant underline-offset-4 transition-colors hover:text-editorial-primary hover:underline sm:px-2"
                >
                  Return home
                </Link>
              </div>
              <div className="mt-12 grid grid-cols-1 gap-8 border-t border-editorial-outline-variant/10 pt-8 sm:grid-cols-2 md:mt-16">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-editorial-surface-container-low">
                    <Headphones className="h-5 w-5 text-editorial-primary" aria-hidden />
                  </div>
                  <div>
                    <h3 className="mb-1 font-sans font-medium text-editorial-on-background">24/7 Concierge</h3>
                    <p className="text-sm text-editorial-on-surface-variant">
                      Reach us through{' '}
                      <Link to="/contact" className="font-medium text-editorial-primary hover:underline">
                        Contact
                      </Link>{' '}
                      for urgent changes or questions.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-editorial-surface-container-low">
                    <BookOpen className="h-5 w-5 text-editorial-primary" aria-hidden />
                  </div>
                  <div>
                    <h3 className="mb-1 font-sans font-medium text-editorial-on-background">Your itinerary</h3>
                    <p className="text-sm text-editorial-on-surface-variant">
                      Full booking details and receipts live in{' '}
                      <Link to="/dashboard/bookings" className="font-medium text-editorial-primary hover:underline">
                        My bookings
                      </Link>
                      .
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="flex flex-col gap-8 lg:col-span-5">
              <motion.div
                className="rounded-lg bg-editorial-surface-container-low p-6 md:p-8"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
              >
                <div className="mb-6 aspect-[4/3] w-full overflow-hidden rounded-md">
                  <img
                    src={SIDE_IMAGE}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <h3 className="mb-4 font-display text-2xl text-editorial-primary">Your Starlings booking</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-editorial-on-surface-variant">Status</span>
                    <span className="text-right font-medium text-editorial-on-background">Payment received</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-editorial-on-surface-variant">Confirmation</span>
                    <span className="text-right font-medium text-editorial-on-background">Emailed to you</span>
                  </div>
                  {ref ? (
                    <div className="flex items-start justify-between gap-4">
                      <span className="shrink-0 text-editorial-on-surface-variant">Reference</span>
                      <span className="break-all text-right font-mono text-xs font-medium text-editorial-on-background md:text-sm">
                        {ref}
                      </span>
                    </div>
                  ) : null}
                </div>
                <div className="mt-8 flex flex-col gap-1 border-t border-editorial-outline-variant/20 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <span className="font-display text-lg italic text-editorial-primary">Receipt</span>
                  <span className="font-display text-xl text-editorial-gold md:text-2xl">In your inbox</span>
                </div>
              </motion.div>

              <motion.div
                className="relative overflow-hidden rounded-lg bg-editorial-primary p-8 text-white"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.22 }}
              >
                <div className="relative z-10">
                  <span className="mb-2 block font-sans text-[10px] font-medium uppercase tracking-widest text-editorial-gold">
                    We are here for you
                  </span>
                  <h4 className="mb-2 font-display text-xl">Concierge follow-up</h4>
                  <p className="mb-4 text-sm text-white/70">
                    Our team may reach out shortly to coordinate travel details. Reply to your confirmation email or
                    message us anytime.
                  </p>
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-1 text-sm font-medium text-editorial-gold hover:underline"
                  >
                    Get in touch
                    <ArrowRight className="h-3 w-3" aria-hidden />
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
