import { User } from '../../users/entities/user.entity';
import { BookingItem } from './booking-item.entity';
import { Payment } from '../../payments/entities/payment.entity';
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
    user: User;
    status: BookingStatus;
    totalAmountNgn: number;
    items: BookingItem[];
    payment: Payment;
    createdAt: Date;
}
