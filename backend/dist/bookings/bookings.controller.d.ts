import { Response } from 'express';
import { BookingsService } from './bookings.service';
import { User } from '../users/entities/user.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { RequestRefundDto } from './dto/request-refund.dto';
export declare class BookingsController {
    private readonly bookingsService;
    constructor(bookingsService: BookingsService);
    createFromCart(user: User, dto: CreateBookingDto): Promise<import("./entities/booking.entity").Booking>;
    getMyBookings(user: User): Promise<import("./entities/booking.entity").Booking[]>;
    getBooking(id: string, user: User): Promise<import("./entities/booking.entity").Booking>;
    requestRefund(id: string, user: User, dto: RequestRefundDto): Promise<import("../payments/entities/refund-request.entity").RefundRequest>;
    downloadReceiptPdf(id: string, user: User, res: Response): Promise<void>;
}
