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
const booking_traveler_entity_1 = require("./entities/booking-traveler.entity");
const payment_entity_1 = require("../payments/entities/payment.entity");
const refund_request_entity_1 = require("../payments/entities/refund-request.entity");
const cart_service_1 = require("../cart/cart.service");
const mail_service_1 = require("../mail/mail.service");
const sanitize_user_util_1 = require("../common/utils/sanitize-user.util");
const user_entity_1 = require("../users/entities/user.entity");
const pdfkit_1 = require("pdfkit");
let BookingsService = class BookingsService {
    constructor(bookingRepo, itemRepo, travelerRepo, paymentRepo, refundRequestRepo, cartService, mailService) {
        this.bookingRepo = bookingRepo;
        this.itemRepo = itemRepo;
        this.travelerRepo = travelerRepo;
        this.paymentRepo = paymentRepo;
        this.refundRequestRepo = refundRequestRepo;
        this.cartService = cartService;
        this.mailService = mailService;
    }
    assertBookingStatusTransition(current, next, payment) {
        if (current === booking_entity_1.BookingStatus.CANCELLED || current === booking_entity_1.BookingStatus.COMPLETED) {
            throw new common_1.BadRequestException(`Cannot change booking status from ${current}`);
        }
        if (next === booking_entity_1.BookingStatus.PENDING) {
            if (current === booking_entity_1.BookingStatus.CONFIRMED && payment?.status === payment_entity_1.PaymentStatus.FAILED) {
                return;
            }
            throw new common_1.BadRequestException('Booking can only be set to pending when reverting from confirmed after a failed payment');
        }
        if (next === booking_entity_1.BookingStatus.CONFIRMED) {
            if (current !== booking_entity_1.BookingStatus.PENDING) {
                throw new common_1.BadRequestException(`Cannot set status to confirmed from ${current}`);
            }
            if (!payment || payment.status !== payment_entity_1.PaymentStatus.SUCCEEDED) {
                throw new common_1.BadRequestException('Cannot confirm booking without a successful payment');
            }
            return;
        }
        if (next === booking_entity_1.BookingStatus.CANCELLED) {
            if (current !== booking_entity_1.BookingStatus.PENDING && current !== booking_entity_1.BookingStatus.CONFIRMED) {
                throw new common_1.BadRequestException(`Cannot cancel booking from ${current}`);
            }
            return;
        }
        if (next === booking_entity_1.BookingStatus.COMPLETED) {
            if (current !== booking_entity_1.BookingStatus.CONFIRMED) {
                throw new common_1.BadRequestException('Booking must be confirmed before it can be completed');
            }
            return;
        }
    }
    generateReference() {
        const ts = Date.now().toString(36).toUpperCase();
        const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `STL-${ts}-${rand}`;
    }
    validateTravelers(user, cartItems, dto) {
        const travelersInput = dto?.travelers ?? [];
        if (!travelersInput.length) {
            const fallback = this.travelerRepo.create({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone ?? null,
                isPrimary: true,
                sortOrder: 0,
            });
            return [fallback];
        }
        const totalCapacity = cartItems.reduce((sum, item) => {
            const cap = Number(item.package?.maxCapacity ?? 0);
            return cap > 0 ? sum + cap * item.quantity : sum;
        }, 0);
        if (totalCapacity > 0 && travelersInput.length > totalCapacity) {
            throw new common_1.BadRequestException(`Traveler count exceeds package capacity (${totalCapacity})`);
        }
        const primaryCount = travelersInput.filter((traveler) => traveler.isPrimary).length;
        if (primaryCount > 1) {
            throw new common_1.BadRequestException('Only one traveler can be marked as primary');
        }
        const normalizedEmailSet = new Set();
        const travelers = travelersInput.map((traveler, index) => {
            const normalizedEmail = traveler.email?.trim().toLowerCase() ?? null;
            if (normalizedEmail) {
                if (normalizedEmailSet.has(normalizedEmail)) {
                    throw new common_1.BadRequestException('Traveler emails must be unique');
                }
                normalizedEmailSet.add(normalizedEmail);
            }
            return this.travelerRepo.create({
                firstName: traveler.firstName.trim(),
                lastName: traveler.lastName.trim(),
                email: normalizedEmail,
                phone: traveler.phone?.trim() || null,
                isPrimary: traveler.isPrimary ?? index === 0,
                sortOrder: index,
            });
        });
        if (!travelers.some((traveler) => traveler.isPrimary)) {
            travelers[0].isPrimary = true;
        }
        return travelers;
    }
    async createFromCart(user, dto) {
        const cart = await this.cartService.getOrCreateCart(user.id);
        if (!cart.items || cart.items.length === 0) {
            throw new common_1.NotFoundException('Your cart is empty');
        }
        const totalAmountNgn = cart.items.reduce((sum, item) => sum + Number(item.unitPriceNgn) * item.quantity, 0);
        const destinationImageUrl = cart.items.find((item) => item.package?.destination?.heroImageUrl)?.package?.destination?.heroImageUrl ||
            null;
        const booking = this.bookingRepo.create();
        booking.userId = user.id;
        booking.referenceNumber = this.generateReference();
        booking.status = booking_entity_1.BookingStatus.PENDING;
        booking.totalAmountNgn = totalAmountNgn;
        booking.travelers = this.validateTravelers(user, cart.items, dto);
        booking.imageUrl = destinationImageUrl;
        await this.bookingRepo.save(booking);
        const bookingItems = cart.items.map(item => {
            const originalTotalNgn = item.bundleSnapshot?.originalTotalNgn ?? Number(item.unitPriceNgn);
            const customizedTotalNgn = item.bundleSnapshot?.customizedTotalNgn ?? Number(item.unitPriceNgn);
            const savingsNgn = item.bundleSnapshot
                ? Math.max(0, originalTotalNgn - customizedTotalNgn)
                : 0;
            return this.itemRepo.create({
                bookingId: booking.id,
                destinationId: item.destinationId ?? null,
                packageId: item.packageId ?? null,
                quantity: item.quantity,
                unitPriceNgn: item.unitPriceNgn,
                bundleSnapshot: item.bundleSnapshot
                    ? {
                        ...item.bundleSnapshot,
                        savingsNgn,
                        savingsUsd: Math.max(0, item.bundleSnapshot.originalTotalUsd - item.bundleSnapshot.customizedTotalUsd),
                    }
                    : null,
                originalTotalNgn,
                customizedTotalNgn,
                savingsNgn,
            });
        });
        await this.itemRepo.save(bookingItems);
        await this.cartService.clearCart(user.id);
        const fullBooking = await this.findOne(booking.id);
        await this.mailService.sendBookingInitiated(user, fullBooking);
        return fullBooking;
    }
    async findMyBookings(userId) {
        return this.bookingRepo.find({
            where: { userId },
            relations: ['items', 'items.package', 'items.destination', 'payment', 'travelers', 'refundRequests'],
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const booking = await this.bookingRepo.findOne({
            where: { id },
            relations: ['items', 'items.package', 'items.destination', 'payment', 'travelers', 'refundRequests', 'user'],
        });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        return (0, sanitize_user_util_1.sanitizeBooking)(booking);
    }
    async findOneForUser(id, userId, role) {
        const booking = await this.findOne(id);
        if (role !== user_entity_1.UserRole.ADMIN && booking.userId !== userId) {
            throw new common_1.ForbiddenException('You cannot access this booking');
        }
        return booking;
    }
    async findAll(page = 1, limit = 20, status, filters) {
        const qb = this.bookingRepo.createQueryBuilder('booking')
            .leftJoinAndSelect('booking.user', 'user')
            .leftJoinAndSelect('booking.items', 'items')
            .leftJoinAndSelect('items.package', 'package')
            .leftJoinAndSelect('items.destination', 'destination')
            .leftJoinAndSelect('booking.travelers', 'travelers')
            .leftJoinAndSelect('booking.refundRequests', 'refundRequests')
            .leftJoinAndSelect('booking.payment', 'payment');
        if (status)
            qb.where('booking.status = :status', { status });
        if (filters?.destinationId) {
            qb.andWhere('items.destinationId = :destinationId', { destinationId: filters.destinationId });
        }
        if (filters?.userId) {
            qb.andWhere('booking.userId = :userId', { userId: filters.userId });
        }
        if (filters?.from) {
            qb.andWhere('booking.createdAt >= :from', { from: filters.from });
        }
        if (filters?.to) {
            qb.andWhere('booking.createdAt <= :to', { to: filters.to });
        }
        qb.orderBy('booking.createdAt', 'DESC').skip((page - 1) * limit).take(limit);
        const [bookings, total] = await qb.getManyAndCount();
        return { bookings: bookings.map((b) => (0, sanitize_user_util_1.sanitizeBooking)(b)), total, page, limit };
    }
    async updateStatus(id, status, user) {
        const booking = await this.findOne(id);
        if (booking.status === status) {
            return booking;
        }
        const payment = await this.paymentRepo.findOne({ where: { bookingId: id } });
        this.assertBookingStatusTransition(booking.status, status, payment);
        await this.bookingRepo.update(id, { status });
        const updated = await this.findOne(id);
        await this.mailService.sendBookingStatusUpdate(updated.user, updated);
        return updated;
    }
    async requestRefund(id, user, reason) {
        const booking = await this.findOneForUser(id, user.id, user.role);
        if (booking.status !== booking_entity_1.BookingStatus.CONFIRMED) {
            throw new common_1.BadRequestException('Only confirmed bookings can request refunds');
        }
        if (!booking.payment || booking.payment.status !== payment_entity_1.PaymentStatus.SUCCEEDED) {
            throw new common_1.BadRequestException('Only paid bookings can request refunds');
        }
        const existingOpen = await this.refundRequestRepo.findOne({
            where: { bookingId: id, status: refund_request_entity_1.RefundRequestStatus.PENDING },
        });
        if (existingOpen) {
            throw new common_1.BadRequestException('A refund request for this booking is already pending');
        }
        const refundRequest = this.refundRequestRepo.create({
            bookingId: id,
            userId: user.id,
            reason: reason.trim(),
            requestedAmountNgn: booking.payment.amountNgn,
            status: refund_request_entity_1.RefundRequestStatus.PENDING,
        });
        await this.refundRequestRepo.save(refundRequest);
        await this.mailService.sendAdminAlert('refund.requested', {
            bookingId: booking.id,
            referenceNumber: booking.referenceNumber,
            userId: user.id,
            reason: refundRequest.reason,
            requestedAmountNgn: refundRequest.requestedAmountNgn,
        });
        return refundRequest;
    }
    async generateReceiptPdf(id, user) {
        const booking = await this.findOneForUser(id, user.id, user.role);
        const doc = new pdfkit_1.default({ margin: 50, size: 'A4' });
        const chunks = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        const done = new Promise((resolve) => {
            doc.on('end', () => resolve(Buffer.concat(chunks)));
        });
        doc.fontSize(20).text('Starlings Hospitality', { align: 'left' });
        doc.moveDown(0.4);
        doc.fontSize(14).text('Booking Receipt');
        doc.moveDown(0.8);
        doc.fontSize(11).text(`Reference: ${booking.referenceNumber}`);
        doc.text(`Created: ${new Date(booking.createdAt).toLocaleString()}`);
        doc.text(`Status: ${booking.status}`);
        if (booking.payment?.paystackReference) {
            doc.text(`Payment reference: ${booking.payment.paystackReference}`);
        }
        doc.moveDown(0.8);
        doc.fontSize(12).text('Travelers', { underline: true });
        const travelers = booking.travelers ?? [];
        if (!travelers.length) {
            doc.fontSize(10).text('No traveler data recorded');
        }
        else {
            travelers.forEach((traveler, index) => {
                const travelerLine = `${index + 1}. ${traveler.firstName} ${traveler.lastName}`
                    + `${traveler.isPrimary ? ' (Primary)' : ''}`
                    + ` — ${traveler.email || 'No email'}`
                    + `${traveler.phone ? ` / ${traveler.phone}` : ''}`;
                doc.fontSize(10).text(travelerLine);
            });
        }
        doc.moveDown(0.8);
        doc.fontSize(12).text('Line items', { underline: true });
        booking.items.forEach((item, index) => {
            const title = item.package?.title || item.destination?.name || 'Booking item';
            const lineTotal = Number(item.unitPriceNgn) * item.quantity;
            doc.fontSize(10).text(`${index + 1}. ${title} x${item.quantity} — NGN ${lineTotal}`);
        });
        doc.moveDown(0.8);
        doc.fontSize(12).text(`Total: NGN ${booking.totalAmountNgn}`);
        doc.end();
        const buffer = await done;
        return {
            fileName: `receipt-${booking.referenceNumber}.pdf`,
            buffer,
        };
    }
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(booking_entity_1.Booking)),
    __param(1, (0, typeorm_1.InjectRepository)(booking_item_entity_1.BookingItem)),
    __param(2, (0, typeorm_1.InjectRepository)(booking_traveler_entity_1.BookingTraveler)),
    __param(3, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __param(4, (0, typeorm_1.InjectRepository)(refund_request_entity_1.RefundRequest)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        cart_service_1.CartService,
        mail_service_1.MailService])
], BookingsService);
//# sourceMappingURL=bookings.service.js.map