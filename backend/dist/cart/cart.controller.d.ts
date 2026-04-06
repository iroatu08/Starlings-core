import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { User } from '../users/entities/user.entity';
export declare class CartController {
    private readonly cartService;
    constructor(cartService: CartService);
    getCart(user: User): Promise<import("./entities/cart.entity").Cart>;
    addItem(user: User, dto: AddCartItemDto): Promise<import("./entities/cart.entity").Cart>;
    updateItem(user: User, id: string, dto: UpdateCartItemDto): Promise<import("./entities/cart.entity").Cart>;
    removeItem(user: User, id: string): Promise<import("./entities/cart.entity").Cart>;
    clearCart(user: User): Promise<import("./entities/cart.entity").Cart>;
}
