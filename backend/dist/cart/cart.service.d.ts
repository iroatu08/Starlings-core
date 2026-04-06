import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Package } from '../packages/entities/package.entity';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
export declare class CartService {
    private cartRepo;
    private itemRepo;
    private pkgRepo;
    constructor(cartRepo: Repository<Cart>, itemRepo: Repository<CartItem>, pkgRepo: Repository<Package>);
    getOrCreateCart(userId: string): Promise<Cart>;
    addItem(userId: string, dto: AddCartItemDto): Promise<Cart>;
    updateItem(userId: string, itemId: string, dto: UpdateCartItemDto): Promise<Cart>;
    removeItem(userId: string, itemId: string): Promise<Cart>;
    clearCart(userId: string): Promise<Cart>;
}
