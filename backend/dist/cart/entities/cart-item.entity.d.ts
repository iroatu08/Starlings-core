import { Cart } from './cart.entity';
import { Package } from '../../packages/entities/package.entity';
import { Destination } from '../../destinations/entities/destination.entity';
export interface BundlePackageSnapshot {
    id: string;
    name: string;
    type: string;
    description: string | null;
    priceNgn: number;
    priceUsd: number;
    isRemovable: boolean;
}
export interface CartBundleSnapshot {
    packagesSnapshot: BundlePackageSnapshot[];
    keptPackageIds: string[];
    removedPackageIds: string[];
    originalTotalNgn: number;
    originalTotalUsd: number;
    customizedTotalNgn: number;
    customizedTotalUsd: number;
}
export declare class CartItem {
    id: string;
    cartId: string;
    cart: Cart;
    packageId: string | null;
    package: Package | null;
    destinationId: string | null;
    destination: Destination | null;
    quantity: number;
    unitPriceNgn: number;
    bundleSnapshot: CartBundleSnapshot | null;
}
