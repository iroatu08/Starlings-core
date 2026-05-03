import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import PDFDocument from 'pdfkit';
import { User } from '../users/entities/user.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { Payment } from '../payments/entities/payment.entity';
import { BookingTraveler } from '../bookings/entities/booking-traveler.entity';
import { ContactSubmission } from '../contact/entities/contact-submission.entity';
import { MailTemplateRenderer } from './mail-template.renderer';
import { RESEND_CLIENT } from './mail.constants';
import { buildDestinationGroupsForEmail, buildDestinationsSummary } from './utils/booking-email-groups.util';

interface MailAttachment {
  filename: string;
  content: Buffer;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly mailFrom: string;

  constructor(
    private readonly config: ConfigService,
    private readonly renderer: MailTemplateRenderer,
    @Inject(RESEND_CLIENT) private readonly resend: Resend,
  ) {
    this.mailFrom = this.config.getOrThrow<string>('MAIL_FROM');
  }

  private async sendWithResend(to: string, subject: string, html: string, attachments?: MailAttachment[]): Promise<void> {
    const { error } = await this.resend.emails.send({
      from: this.mailFrom,
      to,
      subject,
      html,
      attachments: attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
      })),
    });
    if (error) {
      throw new Error(error.message);
    }
  }

  private async sendTemplate(
    to: string,
    subject: string,
    templateRef: string,
    context: Record<string, unknown>,
    attachments?: MailAttachment[],
  ): Promise<void> {
    const html = await this.renderer.render(templateRef, context);
    await this.sendWithResend(to, subject, html, attachments);
  }

  private async buildOwnerReceiptPdf(user: User, booking: Booking, payment: Payment): Promise<Buffer> {
    const doc = new PDFDocument({ margin: 42, size: 'A4' });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk as Buffer));
    const done = new Promise<Buffer>((resolve) => doc.on('end', () => resolve(Buffer.concat(chunks))));

    doc.fontSize(20).text('Starlings Hospitality');
    doc.moveDown(0.5);
    doc.fontSize(14).text('Payment confirmation receipt');
    doc.moveDown(0.8);
    doc.fontSize(11).text(`Owner: ${user.firstName} ${user.lastName}`);
    doc.text(`Owner email: ${user.email}`);
    doc.text(`Booking reference: ${booking.referenceNumber}`);
    doc.text(`Payment reference: ${payment.paystackReference}`);
    doc.text(`Paid at: ${payment.paidAt}`);
    doc.moveDown(0.8);
    doc.fontSize(12).text('Travelers', { underline: true });
    (booking.travelers ?? []).forEach((traveler, index) => {
      doc.fontSize(10).text(
        `${index + 1}. ${traveler.firstName} ${traveler.lastName} (${traveler.email || 'No email'})`,
      );
    });
    doc.moveDown(0.8);
    doc.fontSize(12).text('Items', { underline: true });
    const pdfGroups = buildDestinationGroupsForEmail(booking.items ?? []);
    pdfGroups.forEach((group, groupIndex) => {
      doc.moveDown(0.4);
      doc
        .fontSize(11)
        .text(
          `${groupIndex + 1}. ${group.destinationName}${group.country ? ` · ${group.country}` : ''}`,
        );
      doc.fontSize(10);
      group.lines.forEach((line, lineIndex) => {
        doc.text(
          `   ${lineIndex + 1}. ${line.title} ×${line.quantity} — NGN ${line.lineTotalNgn}`,
        );
      });
      doc.fontSize(9).text(`   Subtotal: NGN ${group.subtotalNgn}`);
    });
    doc.moveDown(0.8);
    doc.fontSize(12).text(`Total paid: NGN ${booking.totalAmountNgn}`);
    doc.end();
    return done;
  }

  async sendWelcome(user: User) {
    try {
      await this.sendTemplate(user.email, 'Welcome to Starlings Hospitality!', 'welcome', {
        firstName: user.firstName,
      });
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to send welcome email to ${user.email}`, err.stack);
    }
  }

  async sendVerificationEmail(user: User, token: string) {
    try {
      await this.sendTemplate(user.email, 'Verify your Starlings account', 'verify-email', {
        firstName: user.firstName,
        verifyUrl: `${process.env.FRONTEND_URL}/verify?token=${token}`,
      });
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to send verification email to ${user.email}`, err.stack);
    }
  }

  async sendBookingConfirmation(user: User, booking: Booking) {
    try {
      const destinationGroups = buildDestinationGroupsForEmail(booking.items ?? []);
      await this.sendTemplate(
        user.email,
        `Booking Confirmed — Ref #${booking.referenceNumber}`,
        'booking-confirm',
        {
          firstName: user.firstName,
          referenceNumber: booking.referenceNumber,
          items: booking.items,
          destinationGroups,
          destinationsSummary: buildDestinationsSummary(destinationGroups),
          totalAmount: booking.totalAmountNgn,
          createdAt: booking.createdAt,
        },
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to send booking confirmation to ${user.email}`, err.stack);
    }
  }

  async sendBookingInitiated(user: User, booking: Booking) {
    try {
      await this.sendTemplate(
        user.email,
        `Booking created — Ref #${booking.referenceNumber}`,
        'booking-status',
        {
          firstName: user.firstName,
          referenceNumber: booking.referenceNumber,
          status: 'pending_payment',
        },
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to send booking initiated email to ${user.email}`, err.stack);
    }
  }

  async sendPaymentReceipt(user: User, payment: Payment) {
    try {
      await this.sendTemplate(user.email, 'Payment received — Starlings Hospitality', 'payment-receipt', {
        firstName: user.firstName,
        reference: payment.paystackReference,
        amount: payment.amountNgn,
        paidAt: payment.paidAt,
      });
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to send payment receipt to ${user.email}`, err.stack);
    }
  }

  async sendOwnerPostPaymentSummary(user: User, booking: Booking, payment: Payment) {
    try {
      const travelers = (booking.travelers ?? []) as BookingTraveler[];
      const pdfAttachment = await this.buildOwnerReceiptPdf(user, booking, payment);
      const destinationGroups = buildDestinationGroupsForEmail(booking.items ?? []);
      await this.sendTemplate(
        user.email,
        `Payment confirmed — Ref #${booking.referenceNumber}`,
        'booking-owner-paid',
        {
          ownerFirstName: user.firstName,
          ownerLastName: user.lastName,
          ownerEmail: user.email,
          ownerPhone: user.phone ?? '',
          bookingReference: booking.referenceNumber,
          paystackReference: payment.paystackReference,
          paidAt: payment.paidAt,
          amountNgn: Number(payment.amountNgn),
          bookingCreatedAt: booking.createdAt,
          travelers: travelers.map((traveler) => ({
            firstName: traveler.firstName,
            lastName: traveler.lastName,
            email: traveler.email || '—',
            phone: traveler.phone || '—',
            isPrimary: traveler.isPrimary,
          })),
          items: booking.items ?? [],
          destinationGroups,
          destinationsSummary: buildDestinationsSummary(destinationGroups),
          totalAmountNgn: Number(booking.totalAmountNgn),
        },
        [
          {
            filename: `receipt-${booking.referenceNumber}.pdf`,
            content: pdfAttachment,
          },
        ],
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to send owner payment summary to ${user.email}`, err.stack);
    }
  }

  async sendTravelerNotifications(booking: Booking, payment: Payment, ownerEmail: string) {
    const travelers = (booking.travelers ?? []) as BookingTraveler[];
    const destinationGroups = buildDestinationGroupsForEmail(booking.items ?? []);
    const destinationsSummary = buildDestinationsSummary(destinationGroups);
    for (const traveler of travelers) {
      const to = traveler.email?.trim().toLowerCase();
      if (!to || to === ownerEmail.trim().toLowerCase()) continue;
      try {
        await this.sendTemplate(
          to,
          `Your Starlings booking details — Ref #${booking.referenceNumber}`,
          'traveler-booking-notice',
          {
            firstName: traveler.firstName,
            lastName: traveler.lastName,
            bookingReference: booking.referenceNumber,
            paystackReference: payment.paystackReference,
            paidAt: payment.paidAt,
            totalAmountNgn: Number(booking.totalAmountNgn),
            itemCount: booking.items?.length ?? 0,
            destinationsSummary,
            isPrimary: traveler.isPrimary,
          },
        );
      } catch (error) {
        const err = error as Error;
        this.logger.error(`Failed to send traveler notice to ${to}`, err.stack);
      }
    }
  }

  async sendPasswordReset(user: User, token: string) {
    try {
      await this.sendTemplate(user.email, 'Reset your Starlings password', 'password-reset', {
        firstName: user.firstName,
        resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${token}`,
        expiresIn: '1 hour',
      });
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to send password reset to ${user.email}`, err.stack);
    }
  }

  async sendBookingStatusUpdate(user: User, booking: Booking) {
    try {
      await this.sendTemplate(
        user.email,
        `Booking Update — Ref #${booking.referenceNumber}`,
        'booking-status',
        {
          firstName: user.firstName,
          referenceNumber: booking.referenceNumber,
          status: booking.status,
        },
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to send booking status update to ${user.email}`, err.stack);
    }
  }

  async sendContactAutoReply(submission: ContactSubmission) {
    try {
      await this.sendTemplate(
        submission.email,
        'We received your message — Starlings Hospitality',
        'contact-received',
        { name: submission.name },
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to send contact auto-reply to ${submission.email}`, err.stack);
    }
  }

  async sendHtmlEmail(to: string, subject: string, html: string) {
    try {
      await this.sendWithResend(to, subject, html);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to send HTML email to ${to}`, err.stack);
      throw error;
    }
  }

  async sendAdminAlert(type: string, payload: Record<string, unknown>) {
    try {
      const adminEmail = this.config.getOrThrow<string>('ADMIN_EMAIL');
      await this.sendTemplate(adminEmail, `[Starlings Admin] ${type}`, 'admin-alert', {
        type,
        payload: JSON.stringify(payload, null, 2),
      });
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Failed to send admin alert: ${type}`, err.stack);
    }
  }
}
