import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem, CartBundleSnapshot } from './entities/cart-item.entity';
import { Package } from '../packages/entities/package.entity';
import { Destination } from '../destinations/entities/destination.entity';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart) private cartRepo: Repository<Cart>,
    @InjectRepository(CartItem) private itemRepo: Repository<CartItem>,
    @InjectRepository(Package) private pkgRepo: Repository<Package>,
    @InjectRepository(Destination) private destinationRepo: Repository<Destination>,
  ) {}

  async getOrCreateCart(userId: string): Promise<Cart> {
    let cart = await this.cartRepo.findOne({ where: { userId }, relations: ['items', 'items.package', 'items.package.destination', 'items.destination'] });
    if (!cart) {
      cart = this.cartRepo.create({ userId });
      await this.cartRepo.save(cart);
      cart = await this.cartRepo.findOne({ where: { userId }, relations: ['items', 'items.package', 'items.package.destination', 'items.destination'] });
    }
    return cart;
  }

  private normalizeCurrency(value: number): number {
    return Number(value.toFixed(2));
  }

  private async buildBundleSnapshot(
    destinationId: string,
    keptPackageIds: string[],
    removedPackageIds: string[],
  ): Promise<CartBundleSnapshot> {
    const destination = await this.destinationRepo.findOne({
      where: { id: destinationId, isActive: true },
      relations: ['packages'],
    });
    if (!destination) throw new NotFoundException('Destination not found or inactive');
    if (destination.packages.length === 0) throw new BadRequestException('Destination has no packages');

    const packageIdSet = new Set(destination.packages.map((pkg) => pkg.id));
    const checkedIds = [...keptPackageIds, ...removedPackageIds];
    const allBelongToDestination = checkedIds.every((id) => packageIdSet.has(id));
    if (!allBelongToDestination) {
      throw new BadRequestException('All selected package ids must belong to this destination');
    }

    const hasDuplicateIds = new Set(checkedIds).size !== checkedIds.length;
    if (hasDuplicateIds) {
      throw new BadRequestException('Package ids cannot be duplicated across kept and removed');
    }

    const completeSelection = checkedIds.length === destination.packages.length;
    if (!completeSelection) {
      throw new BadRequestException('keptPackageIds and removedPackageIds must cover all destination packages');
    }

    const nonRemovablePackages = destination.packages.filter((pkg) => !pkg.isRemovable);
    const missingRequiredPackage = nonRemovablePackages.find((pkg) => !keptPackageIds.includes(pkg.id));
    if (missingRequiredPackage) {
      throw new BadRequestException(`Package "${missingRequiredPackage.title}" is required and cannot be removed`);
    }

    const originalTotalNgn = destination.packages.reduce((sum, pkg) => sum + Number(pkg.priceNgn), 0);
    const originalTotalUsd = destination.packages.reduce((sum, pkg) => sum + Number(pkg.priceUsd), 0);
    const keptPackages = destination.packages.filter((pkg) => keptPackageIds.includes(pkg.id));
    const customizedTotalNgn = keptPackages.reduce((sum, pkg) => sum + Number(pkg.priceNgn), 0);
    const customizedTotalUsd = keptPackages.reduce((sum, pkg) => sum + Number(pkg.priceUsd), 0);

    return {
      packagesSnapshot: destination.packages.map((pkg) => ({
        id: pkg.id,
        name: pkg.title,
        type: pkg.packageType,
        description: pkg.description ?? null,
        priceNgn: this.normalizeCurrency(Number(pkg.priceNgn)),
        priceUsd: this.normalizeCurrency(Number(pkg.priceUsd)),
        isRemovable: pkg.isRemovable,
      })),
      keptPackageIds,
      removedPackageIds,
      originalTotalNgn: this.normalizeCurrency(originalTotalNgn),
      originalTotalUsd: this.normalizeCurrency(originalTotalUsd),
      customizedTotalNgn: this.normalizeCurrency(customizedTotalNgn),
      customizedTotalUsd: this.normalizeCurrency(customizedTotalUsd),
    };
  }

  async addItem(userId: string, dto: AddCartItemDto) {
    const cart = await this.getOrCreateCart(userId);

    if (dto.destinationId) {
      const keptPackageIds = dto.keptPackageIds ?? [];
      const removedPackageIds = dto.removedPackageIds ?? [];
      const snapshot = await this.buildBundleSnapshot(dto.destinationId, keptPackageIds, removedPackageIds);
      const item = this.itemRepo.create({
        cartId: cart.id,
        destinationId: dto.destinationId,
        packageId: null,
        quantity: 1,
        unitPriceNgn: snapshot.customizedTotalNgn,
        bundleSnapshot: snapshot,
      });
      await this.itemRepo.save(item);
      return this.getOrCreateCart(userId);
    }

    if (!dto.packageId) throw new BadRequestException('packageId or destinationId is required');
    const pkg = await this.pkgRepo.findOne({ where: { id: dto.packageId } });
    if (!pkg) throw new NotFoundException('Package not found');

    let item = cart.items?.find((entry) => entry.packageId === dto.packageId && !entry.destinationId);
    if (item) {
      item.quantity += (dto.quantity || 1);
      await this.itemRepo.save(item);
    } else {
      const createdItem = this.itemRepo.create({
        cartId: cart.id,
        packageId: dto.packageId,
        destinationId: null,
        quantity: dto.quantity || 1,
        unitPriceNgn: pkg.priceNgn,
        bundleSnapshot: null,
      });
      await this.itemRepo.save(createdItem);
    }
    return this.getOrCreateCart(userId);
  }

  async updateItem(userId: string, itemId: string, dto: UpdateCartItemDto) {
    const cart = await this.getOrCreateCart(userId);
    const item = cart.items?.find(i => i.id === itemId);
    if (!item) throw new NotFoundException('Cart item not found');
    if (item.destinationId) {
      if (!dto.keptPackageIds || !dto.removedPackageIds) {
        throw new BadRequestException('keptPackageIds and removedPackageIds are required for bundle cart items');
      }
      const snapshot = await this.buildBundleSnapshot(item.destinationId, dto.keptPackageIds, dto.removedPackageIds);
      await this.itemRepo.update(itemId, {
        quantity: 1,
        unitPriceNgn: snapshot.customizedTotalNgn,
        bundleSnapshot: snapshot,
      });
      return this.getOrCreateCart(userId);
    }

    if (!dto.quantity) throw new BadRequestException('quantity is required');
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
