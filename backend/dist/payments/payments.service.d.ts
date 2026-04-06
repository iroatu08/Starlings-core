import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Payment } from './entities/payment.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { User } from '../users/entities/user.entity';
import { MailService } from '../mail/mail.service';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
export declare class PaymentsService {
    private paymentRepo;
    private bookingRepo;
    private userRepo;
    private configService;
    private mailService;
    private readonly logger;
    private paystack;
    constructor(paymentRepo: Repository<Payment>, bookingRepo: Repository<Booking>, userRepo: Repository<User>, configService: ConfigService, mailService: MailService);
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
    getAllPayments(page?: number, limit?: number): Promise<{
        payments: Payment[];
        total: number;
        page: number;
        limit: number;
    }>;
}
