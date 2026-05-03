import { useNavigate, useLocation } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../../stores/authStore'
import { authApi } from '../../api/auth.api'
import type { RegisterPayload, LoginPayload } from '../../types/auth.types'
import { readPendingBundle } from '../../utils/pending-bundle'

export function useAuth() {
  const { user, accessToken, isAuthenticated, setAuth, clearAuth } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()

  const loginMutation = useMutation({
    mutationFn: (data: LoginPayload) => authApi.login(data),
    onSuccess: (response) => {
      const { user, accessToken } = response.data.data
      setAuth(user, accessToken)
      const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname
      const pendingBundle = readPendingBundle()
      if (user.role === 'admin') navigate('/admin')
      else if (pendingBundle) navigate('/get-started', { state: { resumeBundle: true } })
      else if (from) navigate(from)
      else navigate('/dashboard')
    },
  })

  const registerMutation = useMutation({
    mutationFn: (data: RegisterPayload) => authApi.register(data),
  })

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      clearAuth()
      queryClient.clear()
      navigate('/login')
    },
  })

  return {
    user,
    accessToken,
    isAuthenticated,
    isAdmin: user?.role === 'admin',

    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,

    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,

    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  }
}
