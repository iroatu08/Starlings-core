import { useEffect } from 'react'
import { BrowserRouter, useLocation } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { HelmetProvider } from 'react-helmet-async'
import { Navbar } from './components/shared/Navbar'
import { Footer } from './components/shared/Footer'
import { CartDrawer } from './components/shared/CartDrawer'
import { AppRouter } from './router'
import { Toaster } from './components/ui/toaster'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

function AppShell() {
  const { pathname } = useLocation()
  const hideChrome =
    pathname === '/register'
    || pathname === '/login'
    || pathname === '/forgot-password'
    || pathname === '/reset-password'

  const isAdminRoute = pathname.startsWith('/admin')
  const showPublicChrome = !hideChrome && !isAdminRoute

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname])

  return (
    <>
      {showPublicChrome && <Navbar />}
      {showPublicChrome && <CartDrawer />}
      <main>
        <AppRouter />
      </main>
      {showPublicChrome && <Footer />}
    </>
  )
}

export default function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppShell />
          <Toaster />
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </HelmetProvider>
  )
}
