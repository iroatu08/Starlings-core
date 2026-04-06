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
exports.BookingsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const booking_entity_1 = require("./entities/booking.entity");
const booking_item_entity_1 = require("./entities/booking-item.entity");
const cart_service_1 = require("../cart/cart.service");
const mail_service_1 = require("../mail/mail.service");
let BookingsService = class BookingsService {
    constructor(bookingRepo, itemRepo, cartService, mailService) {
        this.bookingRepo = bookingRepo;
        this.itemRepo = itemRepo;
        this.cartService = cartService;
        this.mailService = mailService;
    }
    generateReference() {
        const ts = Date.now().toString(36).toUpperCase();
        const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `STL-${ts}-${rand}`;
    }
    async createFromCart(user) {
        const cart = await this.cartService.getOrCreateCart(user.id);
        if (!cart.items || cart.items.length === 0) {
            throw new common_1.NotFoundException('Your cart is empty');
        }
        const totalAmountNgn = cart.items.reduce((sum, item) => sum + Number(item.unitPriceNgn) * item.quantity, 0);
        const booking = this.bookingRepo.create({
            userId: user.id,
            referenceNumber: this.generateReference(),
            status: booking_entity_1.BookingStatus.PENDING,
            totalAmountNgn,
        });
        await this.bookingRepo.save(booking);
        const bookingItems = cart.items.map(item => this.itemRepo.create({
            bookingId: booking.id,
            packageId: item.packageId,
            quantity: item.quantity,
            unitPriceNgn: item.unitPriceNgn,
        }));
        await this.itemRepo.save(bookingItems);
        await this.cartService.clearCart(user.id);
        const fullBooking = await this.findOne(booking.id);
        await this.mailService.sendBookingConfirmation(user, fullBooking);
        return fullBooking;
    }
    async findMyBookings(userId) {
        return this.bookingRepo.find({
            where: { userId },
            relations: ['items', 'items.package', 'payment'],
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const booking = await this.bookingRepo.findOne({
            where: { id },
            relations: ['items', 'items.package', 'payment', 'user'],
        });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        return booking;
    }
    async findAll(page = 1, limit = 20, status) {
        const qb = this.bookingRepo.createQueryBuilder('booking')
            .leftJoinAndSelect('booking.user', 'user')
            .leftJoinAndSelect('booking.items', 'items')
            .leftJoinAndSelect('items.package', 'package')
            .leftJoinAndSelect('booking.payment', 'payment');
        if (status)
            qb.where('booking.status = :status', { status });
        qb.orderBy('booking.createdAt', 'DESC').skip((page - 1) * limit).take(limit);
        const [bookings, total] = await qb.getManyAndCount();
        return { bookings, total, page, limit };
    }
    async updateStatus(id, status, user) {
        const booking = await this.findOne(id);
        await this.bookingRepo.update(id, { status });
        const updated = await this.findOne(id);
        await this.mailService.sendBookingStatusUpdate(updated.user, updated);
        return updated;
    }
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(booking_entity_1.Booking)),
    __param(1, (0, typeorm_1.InjectRepository)(booking_item_entity_1.BookingItem)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        cart_service_1.CartService,
        mail_service_1.MailService])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map