import { BookingsService } from './bookings.service';
import { User } from '../users/entities/user.entity';
export declare class BookingsController {
    private readonly bookingsService;
    constructor(bookingsService: BookingsService);
    createFromCart(user: User): Promise<import("./entities/booking.entity").Booking>;
    getMyBookings(user: User): Promise<import("./entities/booking.entity").Booking[]>;
    getBooking(id: string): Promise<import("./entities/booking.entity").Booking>;
}
