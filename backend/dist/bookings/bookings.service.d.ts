import { Repository } from 'typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import { BookingItem } from './entities/booking-item.entity';
import { CartService } from '../cart/cart.service';
import { MailService } from '../mail/mail.service';
import { User } from '../users/entities/user.entity';
export declare class BookingsService {
    private bookingRepo;
    private itemRepo;
    private cartService;
    private mailService;
    constructor(bookingRepo: Repository<Booking>, itemRepo: Repository<BookingItem>, cartService: CartService, mailService: MailService);
    private generateReference;
    createFromCart(user: User): Promise<Booking>;
    findMyBookings(userId: string): Promise<Booking[]>;
    findOne(id: string): Promise<Booking>;
    findAll(page?: number, limit?: number, status?: BookingStatus): Promise<{
        bookings: Booking[];
        total: number;
        page: number;
        limit: number;
    }>;
    updateStatus(id: string, status: BookingStatus, user: User): Promise<Booking>;
}
