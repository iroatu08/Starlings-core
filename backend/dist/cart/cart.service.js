"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const cart_entity_1 = require("./entities/cart.entity");
const cart_item_entity_1 = require("./entities/cart-item.entity");
const package_entity_1 = require("../packages/entities/package.entity");
const destination_entity_1 = require("../destinations/entities/destination.entity");
let CartService = class CartService {
    constructor(cartRepo, itemRepo, pkgRepo, destinationRepo) {
        this.cartRepo = cartRepo;
        this.itemRepo = itemRepo;
        this.pkgRepo = pkgRepo;
        this.destinationRepo = destinationRepo;
    }
    async getOrCreateCart(userId) {
        let cart = await this.cartRepo.findOne({ where: { userId }, relations: ['items', 'items.package', 'items.package.destination', 'items.destination'] });
        if (!cart) {
            cart = this.cartRepo.create({ userId });
            await this.cartRepo.save(cart);
            cart = await this.cartRepo.findOne({ where: { userId }, relations: ['items', 'items.package', 'items.package.destination', 'items.destination'] });
        }
        return cart;
    }
    normalizeCurrency(value) {
        return Number(value.toFixed(2));
    }
    async buildBundleSnapshot(destinationId, keptPackageIds, removedPackageIds) {
        const destination = await this.destinationRepo.findOne({
            where: { id: destinationId, isActive: true },
            relations: ['packages'],
        });
        if (!destination)
            throw new common_1.NotFoundException('Destination not found or inactive');
        if (destination.packages.length === 0)
            throw new common_1.BadRequestException('Destination has no packages');
        const packageIdSet = new Set(destination.packages.map((pkg) => pkg.id));
        const checkedIds = [...keptPackageIds, ...removedPackageIds];
        const allBelongToDestination = checkedIds.every((id) => packageIdSet.has(id));
        if (!allBelongToDestination) {
            throw new common_1.BadRequestException('All selected package ids must belong to this destination');
        }
        const hasDuplicateIds = new Set(checkedIds).size !== checkedIds.length;
        if (hasDuplicateIds) {
            throw new common_1.BadRequestException('Package ids cannot be duplicated across kept and removed');
        }
        const completeSelection = checkedIds.length === destination.packages.length;
        if (!completeSelection) {
            throw new common_1.BadRequestException('keptPackageIds and removedPackageIds must cover all destination packages');
        }
        const nonRemovablePackages = destination.packages.filter((pkg) => !pkg.isRemovable);
        const missingRequiredPackage = nonRemovablePackages.find((pkg) => !keptPackageIds.includes(pkg.id));
        if (missingRequiredPackage) {
            throw new common_1.BadRequestException(`Package "${missingRequiredPackage.title}" is required and cannot be removed`);
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
    async addItem(userId, dto) {
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
        if (!dto.packageId)
            throw new common_1.BadRequestException('packageId or destinationId is required');
        const pkg = await this.pkgRepo.findOne({ where: { id: dto.packageId } });
        if (!pkg)
            throw new common_1.NotFoundException('Package not found');
        let item = cart.items?.find((entry) => entry.packageId === dto.packageId && !entry.destinationId);
        if (item) {
            item.quantity += (dto.quantity || 1);
            await this.itemRepo.save(item);
        }
        else {
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
    async updateItem(userId, itemId, dto) {
        const cart = await this.getOrCreateCart(userId);
        const item = cart.items?.find(i => i.id === itemId);
        if (!item)
            throw new common_1.NotFoundException('Cart item not found');
        if (item.destinationId) {
            if (!dto.keptPackageIds || !dto.removedPackageIds) {
                throw new common_1.BadRequestException('keptPackageIds and removedPackageIds are required for bundle cart items');
            }
            const snapshot = await this.buildBundleSnapshot(item.destinationId, dto.keptPackageIds, dto.removedPackageIds);
            await this.itemRepo.update(itemId, {
                quantity: 1,
                unitPriceNgn: snapshot.customizedTotalNgn,
                bundleSnapshot: snapshot,
            });
            return this.getOrCreateCart(userId);
        }
        if (!dto.quantity)
            throw new common_1.BadRequestException('quantity is required');
        await this.itemRepo.update(itemId, { quantity: dto.quantity });
        return this.getOrCreateCart(userId);
    }
    async removeItem(userId, itemId) {
        const cart = await this.getOrCreateCart(userId);
        const item = cart.items?.find(i => i.id === itemId);
        if (!item)
            throw new common_1.NotFoundException('Cart item not found');
        await this.itemRepo.delete(itemId);
        return this.getOrCreateCart(userId);
    }
    async clearCart(userId) {
        const cart = await this.getOrCreateCart(userId);
        await this.itemRepo.delete({ cartId: cart.id });
        return this.getOrCreateCart(userId);
    }
};
exports.CartService = CartService;
exports.CartService = CartService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cart_entity_1.Cart)),
    __param(1, (0, typeorm_1.InjectRepository)(cart_item_entity_1.CartItem)),
    __param(2, (0, typeorm_1.InjectRepository)(package_entity_1.Package)),
    __param(3, (0, typeorm_1.InjectRepository)(destination_entity_1.Destination)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], CartService);
//# sourceMappingURL=cart.service.js.map