import { Suspense, lazy } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { PageLoader } from '../components/shared/PageLoader'
import { AuthGuard } from '../features/auth/AuthGuard'
import { AdminGuard } from '../features/auth/AdminGuard'

// Lazy-loaded pages for code splitting
const Home = lazy(() => import('../pages/Home').then(m => ({ default: m.Home })))
const Destinations = lazy(() => import('../pages/Destinations').then(m => ({ default: m.Destinations })))
const DestinationDetail = lazy(() => import('../pages/DestinationDetail').then(m => ({ default: m.DestinationDetail })))
const Services = lazy(() => import('../pages/Services.tsx').then((m) => ({ default: m.Services })))
const GetStarted = lazy(() => import('../pages/GetStarted.tsx').then(m => ({ default: m.GetStarted })))
const Gallery = lazy(() => import('../pages/Gallery.tsx').then(m => ({ default: m.Gallery })))
const About = lazy(() => import('../pages/About.tsx').then(m => ({ default: m.About })))
const Privacy = lazy(() => import('../pages/Privacy.tsx').then(m => ({ default: m.Privacy })))
const Terms = lazy(() => import('../pages/Terms.tsx').then(m => ({ default: m.Terms })))
const Contact = lazy(() => import('../pages/Contact.tsx').then(m => ({ default: m.Contact })))
const Login = lazy(() => import('../pages/Login').then(m => ({ default: m.Login })))
const Register = lazy(() => import('../pages/Register').then(m => ({ default: m.Register })))
const VerifyEmail = lazy(() => import('../pages/VerifyEmail').then(m => ({ default: m.VerifyEmail })))
const ForgotPassword = lazy(() => import('../pages/ForgotPassword').then(m => ({ default: m.ForgotPassword })))
const ResetPassword = lazy(() => import('../pages/ResetPassword').then(m => ({ default: m.ResetPassword })))
const Checkout = lazy(() => import('../pages/Checkout.tsx').then(m => ({ default: m.Checkout })))
const CheckoutSuccess = lazy(() => import('../pages/CheckoutSuccess.tsx').then(m => ({ default: m.CheckoutSuccess })))

// Dashboard pages
const DashboardLayout = lazy(() => import('../pages/dashboard/DashboardLayout').then(m => ({ default: m.DashboardLayout })))
const DashboardHome = lazy(() => import('../pages/dashboard/DashboardHome.tsx').then(m => ({ default: m.DashboardHome })))
const MyBookings = lazy(() => import('../pages/dashboard/MyBookings.tsx').then(m => ({ default: m.MyBookings })))
const MyCart = lazy(() => import('../pages/dashboard/MyCart.tsx').then(m => ({ default: m.MyCart })))
const Profile = lazy(() => import('../pages/dashboard/Profile.tsx').then(m => ({ default: m.Profile })))
const BookingReceipt = lazy(() => import('../pages/dashboard/BookingReceipt.tsx').then(m => ({ default: m.BookingReceipt })))

// Admin pages
const AdminLayout = lazy(() => import('../pages/admin/AdminLayout').then(m => ({ default: m.AdminLayout })))
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard.tsx').then(m => ({ default: m.AdminDashboard })))
const AdminUsers = lazy(() => import('../pages/admin/AdminUsers.tsx').then(m => ({ default: m.AdminUsers })))
const AdminBookings = lazy(() => import('../pages/admin/AdminBookings.tsx').then(m => ({ default: m.AdminBookings })))
const AdminPayments = lazy(() => import('../pages/admin/AdminPayments.tsx').then(m => ({ default: m.AdminPayments })))
const AdminDestinations = lazy(() => import('../pages/admin/AdminDestinations.tsx').then(m => ({ default: m.AdminDestinations })))
const AdminGallery = lazy(() => import('../pages/admin/AdminGallery.tsx').then(m => ({ default: m.AdminGallery })))
const AdminContact = lazy(() => import('../pages/admin/AdminContact.tsx').then(m => ({ default: m.AdminContact })))
const AdminEmail = lazy(() => import('../pages/admin/AdminEmail.tsx').then(m => ({ default: m.AdminEmail })))

const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

export function AppRouter() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageTransition}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <Suspense fallback={<PageLoader />}>
          <Routes location={location}>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/destinations" element={<Destinations />} />
        <Route path="/destinations/:id" element={<DestinationDetail />} />
        <Route path="/services" element={<Services />} />
        <Route path="/get-started" element={<GetStarted />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/contact" element={<Contact />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected: Checkout */}
        <Route path="/checkout" element={<AuthGuard><Checkout /></AuthGuard>} />
        <Route path="/checkout/success" element={<AuthGuard><CheckoutSuccess /></AuthGuard>} />

        {/* Protected: User Dashboard */}
        <Route
          path="/dashboard"
          element={<AuthGuard><DashboardLayout /></AuthGuard>}
        >
          <Route index element={<DashboardHome />} />
          <Route path="bookings" element={<MyBookings />} />
          <Route path="bookings/:bookingId" element={<BookingReceipt />} />
          <Route path="cart" element={<MyCart />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Admin Panel */}
        <Route
          path="/admin"
          element={<AdminGuard><AdminLayout /></AdminGuard>}
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="destinations" element={<AdminDestinations />} />
          <Route path="gallery" element={<AdminGallery />} />
          <Route path="contact" element={<AdminContact />} />
          <Route path="email" element={<AdminEmail />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center bg-off-white">
            <div className="text-center">
              <h1 className="font-display text-6xl font-bold text-navy mb-4">404</h1>
              <p className="text-slate text-lg mb-8">This page doesn't exist</p>
              <a href="/" className="btn-primary">Go Home</a>
            </div>
          </div>
        } />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  )
}
