import { User } from '../../users/entities/user.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { Payment } from '../../payments/entities/payment.entity';

/** Safe subset of `User` for API responses (no secrets or auth tokens). */
export type PublicUser = Omit<
  User,
  | 'passwordHash'
  | 'refreshTokenHash'
  | 'verificationToken'
  | 'resetPasswordToken'
  | 'resetPasswordExpires'
>;

export function toPublicUser(user: User): PublicUser {
  const {
    passwordHash: _ph,
    refreshTokenHash: _rt,
    verificationToken: _vt,
    resetPasswordToken: _rpt,
    resetPasswordExpires: _rpe,
    ...rest
  } = user;
  return rest as PublicUser;
}

export function sanitizeBooking(booking: Booking): Booking {
  if (!booking?.user) return booking;
  return { ...booking, user: toPublicUser(booking.user) as User };
}

export function sanitizePayment(payment: Payment): Payment {
  if (!payment?.booking) return payment;
  return { ...payment, booking: sanitizeBooking(payment.booking) };
}
