import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../../stores/authStore'
import { authApi } from '../../api/auth.api'
import type { RegisterPayload, LoginPayload } from '../../types/auth.types'

export function useAuth() {
  const { user, accessToken, isAuthenticated, setAuth, clearAuth } = useAuthStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const loginMutation = useMutation({
    mutationFn: (data: LoginPayload) => authApi.login(data),
    onSuccess: (response) => {
      const { user, accessToken } = response.data.data
      setAuth(user, accessToken)
      navigate(user.role === 'admin' ? '/admin' : '/dashboard')
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
