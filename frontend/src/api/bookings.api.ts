import apiClient from './axios.client'
import type { Booking } from '../types/booking.types'

export const bookingsApi = {
  createFromCart: () =>
    apiClient.post<{ data: Booking }>('/bookings'),

  getMyBookings: () =>
    apiClient.get<{ data: Booking[] }>('/bookings/me'),

  getById: (id: string) =>
    apiClient.get<{ data: Booking }>(`/bookings/${id}`),
}
