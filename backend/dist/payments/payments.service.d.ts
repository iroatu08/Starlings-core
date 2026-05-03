import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { RefundRequest, RefundRequestStatus } from './entities/refund-request.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { User } from '../users/entities/user.entity';
import { MailService } from '../mail/mail.service';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
interface AdminPaymentsFilters {
    page?: number;
    limit?: number;
    status?: PaymentStatus;
    search?: string;
}
interface AdminRefundFilters {
    page?: number;
    limit?: number;
    status?: RefundRequestStatus;
}
export declare class PaymentsService {
    private paymentRepo;
    private refundRequestRepo;
    private bookingRepo;
    private userRepo;
    private configService;
    private mailService;
    private readonly logger;
    private paystack;
    constructor(paymentRepo: Repository<Payment>, refundRequestRepo: Repository<RefundRequest>, bookingRepo: Repository<Booking>, userRepo: Repository<User>, configService: ConfigService, mailService: MailService);
    private sendPostPaymentEmails;
    private markRefundCompletedByPaymentReference;
    initialize(user: User, dto: InitializePaymentDto): Promise<{
        authorization_url: any;
        access_code: any;
        reference: string;
    }>;
    verify(reference: string, user: User): Promise<{
        status: string;
        amount: number;
        reference: string;
        bookingId: string;
    }>;
    handleWebhook(payload: any, signature: string): Promise<{
        received: boolean;
    }>;
    getHistory(userId: string): Promise<Payment[]>;
    getAllPayments(filters?: AdminPaymentsFilters): Promise<{
        payments: Payment[];
        total: number;
        page: number;
        limit: number;
    }>;
    updateStatus(paymentId: string, status: PaymentStatus): Promise<Payment>;
    approveRefundRequest(refundRequestId: string, admin: User): Promise<RefundRequest>;
    rejectRefundRequest(refundRequestId: string, admin: User, reason: string): Promise<RefundRequest>;
    getRefundRequests(filters?: AdminRefundFilters): Promise<{
        requests: RefundRequest[];
        total: number;
        page: number;
        limit: number;
    }>;
}
export {};
