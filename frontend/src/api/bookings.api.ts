import apiClient from './axios.client'
import type { Booking } from '../types/booking.types'

export interface BookingTravelerPayload {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  isPrimary?: boolean
}

export interface CreateBookingPayload {
  travelers?: BookingTravelerPayload[]
}

export const bookingsApi = {
  createFromCart: (payload?: CreateBookingPayload) =>
    apiClient.post<{ data: Booking }>('/bookings', payload || {}),

  getMyBookings: () =>
    apiClient.get<{ data: Booking[] }>('/bookings/me'),

  getById: (id: string) =>
    apiClient.get<{ data: Booking }>(`/bookings/${id}`),

  requestRefund: (id: string, reason: string) =>
    apiClient.post<{ data: { id: string; status: string } }>(`/bookings/${id}/refund-requests`, { reason }),

  downloadReceiptPdf: (id: string) =>
    apiClient.get(`/bookings/${id}/receipt.pdf`, { responseType: 'blob' }),
}
