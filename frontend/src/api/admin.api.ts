import apiClient from './axios.client'
import type { Booking } from '../types/booking.types'
import type { RefundRequest, RefundRequestStatus } from '../types/booking.types'
import type { Destination } from '../types/destination.types'
import type { Package } from '../types/destination.types'
import type { User } from '../types/auth.types'
import type { GalleryImage } from '../types/destination.types'
import { PaymentStatus } from '../types/payment.types'
import type { AxiosProgressEvent } from 'axios'

export interface AdminStats {
  totalBookings: number
  totalUsers: number
  revenueNgn: number
  recentBookings: Booking[]
}

export interface AdminUsersResponse {
  users: User[]
  total: number
  page: number
  limit: number
}

export interface AdminBookingsResponse {
  bookings: Booking[]
  total: number
  page: number
  limit: number
}

export interface AdminPaymentRow {
  id: string
  paystackReference: string
  amountNgn: number
  status: PaymentStatus
  createdAt: string
  paidAt?: string
  booking?: Booking
}

export interface AdminPaymentsResponse {
  payments: AdminPaymentRow[]
  total: number
  page: number
  limit: number
}

export interface AdminRefundRequestsResponse {
  requests: RefundRequest[]
  total: number
  page: number
  limit: number
}

export const adminApi = {
  getStats: () => apiClient.get<{ data: AdminStats }>('/admin/stats'),

  getUsers: (params?: { page?: number; limit?: number; search?: string }) =>
    apiClient.get<{ data: AdminUsersResponse }>('/admin/users', { params }),

  patchUser: (id: string, body: Partial<{ isActive: boolean; role: string }>) =>
    apiClient.patch<{ data: User }>(`/admin/users/${id}`, body),

  getBookings: (params?: { page?: number; limit?: number; status?: string; destinationId?: string; userId?: string; from?: string; to?: string }) =>
    apiClient.get<{ data: AdminBookingsResponse }>('/admin/bookings', { params }),

  getBookingById: (id: string) =>
    apiClient.get<{ data: Booking }>(`/admin/bookings/${id}`),

  patchBookingStatus: (id: string, status: string) =>
    apiClient.patch(`/admin/bookings/${id}/status`, { status }),

  getPayments: (params?: { page?: number; limit?: number; status?: PaymentStatus; search?: string }) =>
    apiClient.get<{ data: AdminPaymentsResponse }>('/admin/payments', { params }),

  patchPaymentStatus: (id: string, status: PaymentStatus) =>
    apiClient.patch(`/admin/payments/${id}/status`, { status }),

  getRefundRequests: (params?: { page?: number; limit?: number; status?: RefundRequestStatus }) =>
    apiClient.get<{ data: AdminRefundRequestsResponse }>('/admin/refund-requests', { params }),

  approveRefundRequest: (id: string) =>
    apiClient.patch(`/admin/refund-requests/${id}/approve`, {}),

  rejectRefundRequest: (id: string, reason: string) =>
    apiClient.patch(`/admin/refund-requests/${id}/reject`, { reason }),

  createDestination: (body: Record<string, unknown>) =>
    apiClient.post<{ data: Destination }>('/admin/destinations', body),

  patchDestination: (id: string, body: Partial<Destination>) =>
    apiClient.patch<{ data: Destination }>(`/admin/destinations/${id}`, body),

  deleteDestination: (id: string) => apiClient.delete(`/admin/destinations/${id}`),

  createPackage: (destinationId: string, body: Partial<Package> & Record<string, unknown>) =>
    apiClient.post<{ data: Package }>(`/admin/destinations/${destinationId}/packages`, body),

  patchPackage: (destinationId: string, id: string, body: Partial<Package>) =>
    apiClient.patch<{ data: Package }>(`/admin/destinations/${destinationId}/packages/${id}`, body),

  deletePackage: (destinationId: string, id: string) => apiClient.delete(`/admin/destinations/${destinationId}/packages/${id}`),

  uploadGallery: (
    formData: FormData,
    onUploadProgress?: (event: AxiosProgressEvent) => void,
  ) =>
    apiClient.post<{ data: GalleryImage }>('/admin/gallery/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    }),

  deleteGalleryImage: (id: string) => apiClient.delete(`/admin/gallery/${id}`),

  getContactSubmissions: (params?: { page?: number; limit?: number }) =>
    apiClient.get<{ data: { submissions: unknown[]; total: number; page: number; limit: number } }>(
      '/admin/contact',
      { params }
    ),

  markContactRead: (id: string) => apiClient.patch(`/admin/contact/${id}/read`, {}),

  sendEmail: (body: {
    toEmail?: string
    userId?: string
    broadcastToAll?: boolean
    subject: string
    htmlBody: string
  }) => apiClient.post<{ data: { message: string } }>('/admin/email/send', body),
}
