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
let CartService = class CartService {
    constructor(cartRepo, itemRepo, pkgRepo) {
        this.cartRepo = cartRepo;
        this.itemRepo = itemRepo;
        this.pkgRepo = pkgRepo;
    }
    async getOrCreateCart(userId) {
        let cart = await this.cartRepo.findOne({ where: { userId }, relations: ['items', 'items.package', 'items.package.destination'] });
        if (!cart) {
            cart = this.cartRepo.create({ userId });
            await this.cartRepo.save(cart);
            cart = await this.cartRepo.findOne({ where: { userId }, relations: ['items', 'items.package', 'items.package.destination'] });
        }
        return cart;
    }
    async addItem(userId, dto) {
        const cart = await this.getOrCreateCart(userId);
        const pkg = await this.pkgRepo.findOne({ where: { id: dto.packageId } });
        if (!pkg)
            throw new common_1.NotFoundException('Package not found');
        let item = cart.items?.find(i => i.packageId === dto.packageId);
        if (item) {
            item.quantity += (dto.quantity || 1);
            await this.itemRepo.save(item);
        }
        else {
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
    async updateItem(userId, itemId, dto) {
        const cart = await this.getOrCreateCart(userId);
        const item = cart.items?.find(i => i.id === itemId);
        if (!item)
            throw new common_1.NotFoundException('Cart item not found');
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
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], CartService);
//# sourceMappingURL=cart.service.js.map