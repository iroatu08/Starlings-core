import apiClient from './axios.client'
import type { User } from '../types/auth.types'

export const usersApi = {
  getMe: () =>
    apiClient.get<{ data: User }>('/users/me'),

  updateMe: (data: Partial<Pick<User, 'firstName' | 'lastName' | 'phone' | 'address' | 'preferences'>>) =>
    apiClient.patch<{ data: User }>('/users/me', data),
}
