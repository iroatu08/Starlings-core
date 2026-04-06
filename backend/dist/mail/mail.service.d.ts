import { MailerService } from '@nestjs-modules/mailer';
import { User } from '../users/entities/user.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { Payment } from '../payments/entities/payment.entity';
import { ContactSubmission } from '../contact/entities/contact-submission.entity';
export declare class MailService {
    private readonly mailerService;
    private readonly logger;
    constructor(mailerService: MailerService);
    sendWelcome(user: User): Promise<void>;
    sendVerificationEmail(user: User, token: string): Promise<void>;
    sendBookingConfirmation(user: User, booking: Booking): Promise<void>;
    sendPaymentReceipt(user: User, payment: Payment): Promise<void>;
    sendPasswordReset(user: User, token: string): Promise<void>;
    sendBookingStatusUpdate(user: User, booking: Booking): Promise<void>;
    sendContactAutoReply(submission: ContactSubmission): Promise<void>;
    sendAdminAlert(type: string, payload: any): Promise<void>;
}
