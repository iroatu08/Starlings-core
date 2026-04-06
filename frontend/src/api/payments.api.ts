import apiClient from './axios.client'
import type { InitializePaymentResponse } from '../types/payment.types'

export const paymentsApi = {
  initialize: (data: {
    bookingId: string
    email: string
    amount: number
    currency?: string
    callbackUrl?: string
  }) =>
    apiClient.post<{ data: InitializePaymentResponse }>('/payments/initialize', data),

  verify: (reference: string) =>
    apiClient.get(`/payments/verify/${reference}`),

  getHistory: () =>
    apiClient.get('/payments/history'),
}
