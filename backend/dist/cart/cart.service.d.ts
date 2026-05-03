import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Package } from '../packages/entities/package.entity';
import { Destination } from '../destinations/entities/destination.entity';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
export declare class CartService {
    private cartRepo;
    private itemRepo;
    private pkgRepo;
    private destinationRepo;
    constructor(cartRepo: Repository<Cart>, itemRepo: Repository<CartItem>, pkgRepo: Repository<Package>, destinationRepo: Repository<Destination>);
    getOrCreateCart(userId: string): Promise<Cart>;
    private normalizeCurrency;
    private buildBundleSnapshot;
    addItem(userId: string, dto: AddCartItemDto): Promise<Cart>;
    updateItem(userId: string, itemId: string, dto: UpdateCartItemDto): Promise<Cart>;
    removeItem(userId: string, itemId: string): Promise<Cart>;
    clearCart(userId: string): Promise<Cart>;
}
