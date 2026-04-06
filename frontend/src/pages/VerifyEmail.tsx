import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle } from 'lucide-react'
import { authApi } from '../api/auth.api'
import { SeoHelmet } from '../components/shared/SeoHelmet'

export function VerifyEmail() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    if (!token) { setStatus('error'); return }
    authApi.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'))
  }, [token])

  return (
    <>
      <SeoHelmet title="Verify Email" />
      <div className="min-h-screen bg-off-white flex items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
          {status === 'loading' && (
            <div className="animate-float text-5xl mb-6">✉️</div>
          )}
          {status === 'success' && (
            <>
              <CheckCircle size={64} className="text-green-500 mx-auto mb-6" />
              <h1 className="font-display text-3xl font-bold text-navy mb-4">Email Verified!</h1>
              <p className="text-slate mb-8">Your account is now active. You can sign in and start booking.</p>
              <Link to="/login" className="btn-primary">Sign In Now</Link>
            </>
          )}
          {status === 'error' && (
            <>
              <XCircle size={64} className="text-red-500 mx-auto mb-6" />
              <h1 className="font-display text-3xl font-bold text-navy mb-4">Verification Failed</h1>
              <p className="text-slate mb-8">This link may have expired or is invalid. Please request a new verification email.</p>
              <Link to="/login" className="btn-primary">Go to Login</Link>
            </>
          )}
        </motion.div>
      </div>
    </>
  )
}
