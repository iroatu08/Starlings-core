import { User } from '../../users/entities/user.entity';
import { BookingItem } from './booking-item.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { BookingTraveler } from './booking-traveler.entity';
import { RefundRequest } from '../../payments/entities/refund-request.entity';
export declare enum BookingStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    CANCELLED = "cancelled",
    COMPLETED = "completed"
}
export declare class Booking {
    id: string;
    referenceNumber: string;
    userId: string;
    imageUrl: string;
    user: User;
    status: BookingStatus;
    totalAmountNgn: number;
    items: BookingItem[];
    travelers: BookingTraveler[];
    payment: Payment;
    refundRequests: RefundRequest[];
    createdAt: Date;
}
