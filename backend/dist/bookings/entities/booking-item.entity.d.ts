import { Booking } from './booking.entity';
import { Package } from '../../packages/entities/package.entity';
export declare class BookingItem {
    id: string;
    bookingId: string;
    booking: Booking;
    packageId: string;
    package: Package;
    quantity: number;
    unitPriceNgn: number;
}
