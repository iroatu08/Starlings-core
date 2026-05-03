import apiClient from './axios.client'
import type { RegisterPayload, LoginPayload, AuthResponse } from '../types/auth.types'

export const authApi = {
  register: (data: RegisterPayload) =>
    apiClient.post<{ data: { message: string } }>('/auth/register', data),

  login: (data: LoginPayload) =>
    apiClient.post<{ data: AuthResponse }>('/auth/login', data),

  refresh: () =>
    apiClient.post<{ data: { accessToken: string } }>('/auth/refresh'),

  logout: () =>
    apiClient.post('/auth/logout'),

  verifyEmail: (token: string) =>
    apiClient.get(`/auth/verify/${token}`),

  forgotPassword: (email: string) =>
    apiClient.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, newPassword: string) =>
    apiClient.post('/auth/reset-password', { token, newPassword }),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.patch<{ data: { message: string } }>('/auth/password', { currentPassword, newPassword }),
}
