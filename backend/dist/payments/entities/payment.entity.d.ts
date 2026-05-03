import { Booking } from '../../bookings/entities/booking.entity';
export declare enum PaymentStatus {
    PENDING = "pending",
    REFUND_PENDING = "refund_pending",
    REFUNDED = "refunded",
    SUCCEEDED = "succeeded",
    FAILED = "failed"
}
export declare enum PaymentChannel {
    CARD = "card",
    BANK_TRANSFER = "bank_transfer",
    USSD = "ussd",
    MOBILE_MONEY = "mobile_money"
}
export declare class Payment {
    id: string;
    bookingId: string;
    booking: Booking;
    paystackReference: string;
    paystackAccessCode: string;
    amountNgn: number;
    currency: string;
    channel: PaymentChannel;
    status: PaymentStatus;
    paystackResponse: any;
    paidAt: Date;
    userId: string;
    createdAt: Date;
}
