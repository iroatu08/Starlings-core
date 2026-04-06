import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Package } from '../packages/entities/package.entity';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private cartRepo: Repository<Cart>,
    @InjectRepository(CartItem) private itemRepo: Repository<CartItem>,
    @InjectRepository(Package) private pkgRepo: Repository<Package>,
  ) {}

  async getOrCreateCart(userId: string): Promise<Cart> {
    let cart = await this.cartRepo.findOne({ where: { userId }, relations: ['items', 'items.package', 'items.package.destination'] });
    if (!cart) {
      cart = this.cartRepo.create({ userId });
      await this.cartRepo.save(cart);
      cart = await this.cartRepo.findOne({ where: { userId }, relations: ['items', 'items.package', 'items.package.destination'] });
    }
    return cart;
  }

  async addItem(userId: string, dto: AddCartItemDto) {
    const cart = await this.getOrCreateCart(userId);
    const pkg = await this.pkgRepo.findOne({ where: { id: dto.packageId } });
    if (!pkg) throw new NotFoundException('Package not found');

    let item = cart.items?.find(i => i.packageId === dto.packageId);
    if (item) {
      item.quantity += (dto.quantity || 1);
      await this.itemRepo.save(item);
    } else {
      item = this.itemRepo.create({
        cartId: cart.id,
        packageId: dto.packageId,
        quantity: dto.quantity || 1,
        unitPriceNgn: pkg.priceNgn,
      });
      await this.itemRepo.save(item);
    }
    return this.getOrCreateCart(userId);
  }

  async updateItem(userId: string, itemId: string, dto: UpdateCartItemDto) {
    const cart = await this.getOrCreateCart(userId);
    const item = cart.items?.find(i => i.id === itemId);
    if (!item) throw new NotFoundException('Cart item not found');
    await this.itemRepo.update(itemId, { quantity: dto.quantity });
    return this.getOrCreateCart(userId);
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await this.getOrCreateCart(userId);
    const item = cart.items?.find(i => i.id === itemId);
    if (!item) throw new NotFoundException('Cart item not found');
    await this.itemRepo.delete(itemId);
    return this.getOrCreateCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    await this.itemRepo.delete({ cartId: cart.id });
    return this.getOrCreateCart(userId);
  }
}
