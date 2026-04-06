import { Cart } from './cart.entity';
import { Package } from '../../packages/entities/package.entity';
export declare class CartItem {
    id: string;
    cartId: string;
    cart: Cart;
    packageId: string;
    package: Package;
    quantity: number;
    unitPriceNgn: number;
}
