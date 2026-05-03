import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { KeyRound } from 'lucide-react'
import { SeoHelmet } from '../../components/shared/SeoHelmet'
import { useAuthStore } from '../../stores/authStore'
import { usersApi } from '../../api/users.api'
import { bookingsApi } from '../../api/bookings.api'
import { authApi } from '../../api/auth.api'
import { useCart } from '../../features/cart/useCart'
import type { BookingStatus } from '../../types/booking.types'
import { useNavigate } from 'react-router-dom'

const STATUS_STYLES: Record<BookingStatus, string> = {
  pending: 'bg-[#fdce5d] text-[#745700]',
  confirmed: 'bg-[#041534] text-white',
  cancelled: 'bg-[#e4e2de] text-[#45464e]',
  completed: 'bg-[#d9e2ff] text-[#384668]',
}

const QUOTE_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD3TR20N4KP6jhuo4EI6kBvUSRJCoITnk9khOnTxt2xVaCVcyNIEgnN0Pl_0eE-GDBn9ahEtTSscawInCJxzi-2X0WuEHyrB_KXxYP4NvHtxv8_6KyyiDQwCnzmuCuIjGy2EtthDX47B4TmShLySmZmAgEkYmadusx59U5SZcdyH799VRicE_UB_FxV53T-0-hpGUzobXqnkSqfwdjzA_DJ64dNbB8K_r7ay87ugKwIC6Bbt7WhjE7pukUqLXPVXekkJN9KlcSVM1y1'

type ProfileForm = {
  firstName: string
  lastName: string
  phone: string
  address: string
  preferences: string
}

type ChangePasswordForm = {
  currentPassword: string
  newPassword: string
}

export function Profile() {
  const user = useAuthStore((s) => s.user)
  const updateUserStore = useAuthStore((s) => s.updateUser)
  const queryClient = useQueryClient()
  const { cart } = useCart()
  const navigate = useNavigate()
  const { data: me, isLoading: isMeLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => usersApi.getMe().then((r) => r.data.data),
    initialData: user ?? undefined,
  })

  const { data: bookings = [], isLoading: isBookingsLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => bookingsApi.getMyBookings().then((r) => r.data.data),
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
  })

  const { register, handleSubmit, reset } = useForm<ProfileForm>({
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      address: '',
      preferences: '',
    },
  })

  useEffect(() => {
    if (me) {
      reset({
        firstName: me.firstName,
        lastName: me.lastName,
        phone: me.phone || '',
        address: me.address || '',
        preferences: me.preferences || '',
      })
    }
  }, [me, reset])

  const profileMutation = useMutation({
    mutationFn: (data: ProfileForm) => usersApi.updateMe(data),
    onSuccess: (res) => {
      updateUserStore(res.data.data)
      queryClient.setQueryData(['me'], res.data.data)
    },
  })
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<ChangePasswordForm>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
    },
  })
  const passwordMutation = useMutation({
    mutationFn: (payload: ChangePasswordForm) =>
      authApi.changePassword(payload.currentPassword, payload.newPassword),
    onSuccess: () => {
      resetPasswordForm()
    },
  })

  const recentBookings = bookings.slice(0, 3)
  const cartItems = cart?.items ?? []
  const displayName = me ? `${me.firstName} ${me.lastName}`.trim() : 'Member'

  return (
    <>
      <SeoHelmet title="Profile" description="Your Starlings Hospitality profile." />

      <div className="space-y-12">
        <header className="mb-2">
          <h1 className="mb-4 font-display text-5xl text-[#041534] md:text-6xl">Welcome back, {displayName}</h1>
          <p className="max-w-2xl text-lg leading-relaxed text-[#45464e]">
            Your curated escape to Dubai awaits. Manage your bespoke itineraries, upcoming arrivals, and personalized
            preferences from your private concierge dashboard.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          <section className="rounded-xl bg-white p-8 shadow-[0_8px_40px_rgba(27,28,26,0.04)] lg:col-span-8">
            <div className="mb-10 flex items-end justify-between">
              <div>
                <h2 className="mb-2 font-display text-3xl text-[#041534]"> Recent Bookings</h2>
                <div className="h-0.5 w-12 bg-[#785a00]" />
              </div>
              <Link
                to="/dashboard/bookings"
                className="border-b-2 border-[#c5c6cf]/30 pb-1 text-xs font-medium uppercase tracking-widest text-[#785a00] transition-all hover:border-[#785a00]"
              >
                View All History
              </Link>
            </div>

            <div className="space-y-6">
              {isBookingsLoading ? (
                <>
                  <div className="h-28 rounded-lg shimmer-bg" />
                  <div className="h-28 rounded-lg shimmer-bg" />
                  <div className="h-28 rounded-lg shimmer-bg" />
                </>
              ) : recentBookings.length === 0 ? (
                <p className="text-sm text-[#45464e]">No bookings yet.</p>
              ) : (
                recentBookings.map((booking) => {
                  const firstItem = booking.items[0]
                  const imageUrl = booking.imageUrl || 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&q=80'
                  return (
                    <div
                      key={booking.id}
                      className="group flex flex-col gap-6 rounded-lg p-4 transition-colors hover:bg-[#f5f3ef] md:flex-row"
                    >
                      <div className="h-28 w-full flex-shrink-0 overflow-hidden rounded md:h-24 md:w-24">
                        <img
                          src={imageUrl}
                          alt={firstItem?.package?.title || 'Booking'}
                          className="h-full w-full object-cover grayscale-[30%] transition-all duration-500 group-hover:grayscale-0"
                        />
                      </div>
                      <div className="flex flex-grow flex-col justify-between">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="mb-1 block text-[10px] uppercase tracking-[0.2em] text-[#75777f]">
                              {firstItem?.package?.title || 'Curated Package'}
                            </span>
                            <h3 className="font-display text-xl text-[#041534]">
                              {firstItem?.package?.destination?.name || booking.referenceNumber}
                            </h3>
                          </div>
                          <span
                            className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${STATUS_STYLES[booking.status]}`}
                          >
                            {booking.status}
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-x-8 gap-y-2 text-sm text-[#45464e]">
                          <span>{new Date(booking.createdAt).toLocaleDateString()}</span>
                          <span className="font-mono text-xs uppercase">Ref: {booking.referenceNumber}</span>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </section>

          <div className="space-y-8 lg:col-span-4">
            <section className="relative overflow-hidden rounded-xl bg-[#041534] p-8 text-white">
              <div className="relative z-10">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="font-display text-2xl">My Cart</h2>
                  <span className="rounded bg-[#fdce5d] px-2 py-0.5 text-[10px] font-bold text-[#745700]">
                    {cartItems.length} ITEM{cartItems.length === 1 ? '' : 'S'}
                  </span>
                </div>
                <div className="mb-8 space-y-4">
                  {cartItems.length === 0 ? (
                    <p className="text-sm text-white/75">Your cart is empty.</p>
                  ) : (
                    cartItems.slice(0, 2).map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded bg-white/10">
                          <span className="text-lg">✦</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{item.package?.title || item.destination?.name || 'Destination bundle'}</p>
                          <p className="text-xs text-[#8392b7]">
                            {item.package?.destination?.name || item.destination?.name || 'Curated Experience'}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>


                <button
                  type="button"
          
                  onClick={() => cartItems.length === 0 ? navigate('/destinations') : navigate('/checkout')}
                  className="block w-full bg-[#fbf9f5] py-4 text-center text-xs font-bold uppercase tracking-widest text-[#041534] transition-colors hover:bg-[#fdce5d]"
                >
                 {cartItems.length === 0 ? 'Add items to cart' : 'Complete Booking'}
                </button>
                {cartItems.length === 0 && <p className="text-xs text-white/75 mt-2 text-center">Add some amazing travel packages to your cart to complete your booking.</p>}
              </div>
              <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-[#785a00] opacity-20 blur-3xl" />
            </section>

            <section className="rounded-xl border border-[#c5c6cf]/20 bg-[#f5f3ef] p-8">
              <h2 className="mb-6 font-display text-2xl text-[#041534]">Concierge Profile</h2>
              {isMeLoading && !me ? (
                <div className="h-32 rounded-xl shimmer-bg" />
              ) : (
                <form onSubmit={handleSubmit((data) => profileMutation.mutate(data))} className="space-y-5">
                  <div className="space-y-1">
                    <label htmlFor="fn" className="text-[10px] font-bold uppercase tracking-widest text-[#75777f]">
                      First Name
                    </label>
                    <input
                      id="fn"
                      className="w-full border-b border-[#c5c6cf]/40 bg-transparent py-2 text-lg outline-none transition-all focus:border-[#785a00]"
                      {...register('firstName', { required: true })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="ln" className="text-[10px] font-bold uppercase tracking-widest text-[#75777f]">
                      Last Name
                    </label>
                    <input
                      id="ln"
                      className="w-full border-b border-[#c5c6cf]/40 bg-transparent py-2 text-lg outline-none transition-all focus:border-[#785a00]"
                      {...register('lastName', { required: true })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label
                      htmlFor="email-ro"
                      className="text-[10px] font-bold uppercase tracking-widest text-[#75777f]"
                    >
                      Email Address
                    </label>
                    <input
                      id="email-ro"
                      readOnly
                      className="w-full border-b border-[#c5c6cf]/40 bg-transparent py-2 text-[#45464e] outline-none"
                      value={me?.email ?? ''}
                    />
                  </div>
                 
                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={profileMutation.isPending}
                      className="text-xs font-medium uppercase tracking-widest text-[#785a00] underline underline-offset-8 decoration-2 decoration-[#c5c6cf]/30 transition-all hover:decoration-[#785a00]"
                    >
                      {profileMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                  {profileMutation.isSuccess && <p className="text-sm text-green-700">Profile updated.</p>}
                </form>
              )}
            </section>

            <section className="flex flex-col items-center rounded-xl border-2 border-dashed border-[#c5c6cf]/30 bg-[#eae8e4]/40 p-8 text-center">
              <KeyRound size={34} className="mb-4 text-[#041534]" />
              <h3 className="mb-2 font-display text-xl text-[#041534]">Security &amp; Access</h3>
              <p className="mb-6 text-sm text-[#45464e]">
                Regularly update your credentials to ensure your travel data remains private.
              </p>
              <form
                onSubmit={handlePasswordSubmit((payload) => passwordMutation.mutate(payload))}
                className="w-full max-w-sm space-y-3 text-left"
              >
                <div>
                  <input
                    type="password"
                    placeholder="Current password"
                    className="w-full rounded-sm border border-[#c5c6cf]/60 bg-white px-3 py-2 text-sm outline-none focus:border-[#785a00]"
                    {...registerPassword('currentPassword', { required: true })}
                  />
                </div>
                <div>
                  <input
                    type="password"
                    placeholder="New password"
                    className="w-full rounded-sm border border-[#c5c6cf]/60 bg-white px-3 py-2 text-sm outline-none focus:border-[#785a00]"
                    {...registerPassword('newPassword', { required: true, minLength: 8 })}
                  />
                  {passwordErrors.newPassword && (
                    <p className="mt-1 text-xs text-red-600">New password must be at least 8 characters.</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={passwordMutation.isPending}
                  className="w-full border border-[#041534] px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-[#041534] transition-all hover:bg-[#041534] hover:text-white disabled:opacity-60"
                >
                  {passwordMutation.isPending ? 'Updating…' : 'Change Password'}
                </button>
              </form>
              {passwordMutation.isSuccess && (
                <p className="mt-3 text-xs text-green-700">Password updated successfully.</p>
              )}
              {passwordMutation.isError && (
                <p className="mt-3 text-xs text-red-600">
                  Could not update password. Please verify your current password.
                </p>
              )}
            </section>
          </div>
        </div>

        <section className="mt-8 grid items-center gap-16 md:grid-cols-2">
          <div className="order-2 md:order-1">
            <img
              src={QUOTE_IMAGE}
              alt="Luxury concierge desk"
              className="h-[400px] w-full rounded-xl object-cover shadow-[0_8px_40px_rgba(27,28,26,0.04)]"
            />
          </div>
          <div className="order-1 space-y-8 md:order-2">
            <span className="text-6xl text-[#785a00]/30">&rdquo;</span>
            <p className="font-display text-3xl italic leading-snug text-[#041534]">
              Luxury is not a destination, but a state of being where every need is met before it is even felt.
            </p>
            <div className="flex items-center gap-4">
              <div className="h-[1px] w-12 bg-[#785a00]" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#75777f]">The Starlings Philosophy</span>
            </div>
          </div>
        </section>


      </div>
    </>
  )
}
