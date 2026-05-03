import { Booking } from './booking.entity';
import { Package } from '../../packages/entities/package.entity';
import { Destination } from '../../destinations/entities/destination.entity';
import { BundlePackageSnapshot } from '../../cart/entities/cart-item.entity';
export interface BookingBundleSnapshot {
    packagesSnapshot: BundlePackageSnapshot[];
    keptPackageIds: string[];
    removedPackageIds: string[];
    originalTotalNgn: number;
    originalTotalUsd: number;
    customizedTotalNgn: number;
    customizedTotalUsd: number;
    savingsNgn: number;
    savingsUsd: number;
}
export declare class BookingItem {
    id: string;
    bookingId: string;
    booking: Booking;
    packageId: string | null;
    package: Package | null;
    destinationId: string | null;
    destination: Destination | null;
    quantity: number;
    unitPriceNgn: number;
    bundleSnapshot: BookingBundleSnapshot | null;
    originalTotalNgn: number;
    customizedTotalNgn: number;
    savingsNgn: number;
}
