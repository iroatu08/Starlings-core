import { Repository } from 'typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import { BookingItem } from './entities/booking-item.entity';
import { BookingTraveler } from './entities/booking-traveler.entity';
import { Payment } from '../payments/entities/payment.entity';
import { RefundRequest } from '../payments/entities/refund-request.entity';
import { CartService } from '../cart/cart.service';
import { MailService } from '../mail/mail.service';
import { User, UserRole } from '../users/entities/user.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
export declare class BookingsService {
    private bookingRepo;
    private itemRepo;
    private travelerRepo;
    private paymentRepo;
    private refundRequestRepo;
    private cartService;
    private mailService;
    constructor(bookingRepo: Repository<Booking>, itemRepo: Repository<BookingItem>, travelerRepo: Repository<BookingTraveler>, paymentRepo: Repository<Payment>, refundRequestRepo: Repository<RefundRequest>, cartService: CartService, mailService: MailService);
    private assertBookingStatusTransition;
    private generateReference;
    private validateTravelers;
    createFromCart(user: User, dto?: CreateBookingDto): Promise<Booking>;
    findMyBookings(userId: string): Promise<Booking[]>;
    findOne(id: string): Promise<Booking>;
    findOneForUser(id: string, userId: string, role: UserRole): Promise<Booking>;
    findAll(page?: number, limit?: number, status?: BookingStatus, filters?: {
        destinationId?: string;
        userId?: string;
        from?: string;
        to?: string;
    }): Promise<{
        bookings: Booking[];
        total: number;
        page: number;
        limit: number;
    }>;
    updateStatus(id: string, status: BookingStatus, user: User): Promise<Booking>;
    requestRefund(id: string, user: User, reason: string): Promise<RefundRequest>;
    generateReceiptPdf(id: string, user: User): Promise<{
        fileName: string;
        buffer: Buffer;
    }>;
}
