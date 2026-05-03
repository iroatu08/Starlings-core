
export type PaymentChannel = 'card' | 'bank_transfer' | 'ussd' | 'mobile_money'

export interface Payment {
  id: string
  bookingId: string
  paystackReference: string
  paystackAccessCode?: string
  amountNgn: number
  currency: string
  channel?: PaymentChannel
  status: PaymentStatus
  paidAt?: string
  createdAt: string
}

export interface InitializePaymentResponse {
  authorization_url: string
  access_code: string
  reference: string
}

export enum PaymentStatus {
  PENDING = 'pending',
  REFUND_PENDING = 'refund_pending',
  REFUNDED = 'refunded',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}