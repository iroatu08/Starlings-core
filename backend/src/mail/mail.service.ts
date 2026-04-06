import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '../users/entities/user.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { Payment } from '../payments/entities/payment.entity';
import { ContactSubmission } from '../contact/entities/contact-submission.entity';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly mailerService: MailerService) {}

  async sendWelcome(user: User) {
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Welcome to Starlings Hospitality!',
        template: './welcome',
        context: { firstName: user.firstName },
      });
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${user.email}`, error.stack);
    }
  }

  async sendVerificationEmail(user: User, token: string) {
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Verify your Starlings account',
        template: './verify-email',
        context: {
          firstName: user.firstName,
          verifyUrl: `${process.env.FRONTEND_URL}/verify?token=${token}`,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${user.email}`, error.stack);
    }
  }

  async sendBookingConfirmation(user: User, booking: Booking) {
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: `Booking Confirmed — Ref #${booking.referenceNumber}`,
        template: './booking-confirm',
        context: {
          firstName: user.firstName,
          referenceNumber: booking.referenceNumber,
          items: booking.items,
          totalAmount: booking.totalAmountNgn,
          createdAt: booking.createdAt,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to send booking confirmation to ${user.email}`, error.stack);
    }
  }

  async sendPaymentReceipt(user: User, payment: Payment) {
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Payment received — Starlings Hospitality',
        template: './payment-receipt',
        context: {
          firstName: user.firstName,
          reference: payment.paystackReference,
          amount: payment.amountNgn,
          paidAt: payment.paidAt,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to send payment receipt to ${user.email}`, error.stack);
    }
  }

  async sendPasswordReset(user: User, token: string) {
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Reset your Starlings password',
        template: './password-reset',
        context: {
          firstName: user.firstName,
          resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${token}`,
          expiresIn: '1 hour',
        },
      });
    } catch (error) {
      this.logger.error(`Failed to send password reset to ${user.email}`, error.stack);
    }
  }

  async sendBookingStatusUpdate(user: User, booking: Booking) {
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: `Booking Update — Ref #${booking.referenceNumber}`,
        template: './booking-status',
        context: {
          firstName: user.firstName,
          referenceNumber: booking.referenceNumber,
          status: booking.status,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to send booking status update to ${user.email}`, error.stack);
    }
  }

  async sendContactAutoReply(submission: ContactSubmission) {
    try {
      await this.mailerService.sendMail({
        to: submission.email,
        subject: 'We received your message — Starlings Hospitality',
        template: './contact-received',
        context: { name: submission.name },
      });
    } catch (error) {
      this.logger.error(`Failed to send contact auto-reply to ${submission.email}`, error.stack);
    }
  }

  async sendAdminAlert(type: string, payload: any) {
    try {
      await this.mailerService.sendMail({
        to: process.env.ADMIN_EMAIL,
        subject: `[Starlings Admin] ${type}`,
        template: './admin-alert',
        context: { type, payload: JSON.stringify(payload, null, 2) },
      });
    } catch (error) {
      this.logger.error(`Failed to send admin alert: ${type}`, error.stack);
    }
  }
}
