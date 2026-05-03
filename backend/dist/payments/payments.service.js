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
var PaymentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto = require("crypto");
const Paystack = require("paystack");
const config_1 = require("@nestjs/config");
const payment_entity_1 = require("./entities/payment.entity");
const refund_request_entity_1 = require("./entities/refund-request.entity");
const booking_entity_1 = require("../bookings/entities/booking.entity");
const user_entity_1 = require("../users/entities/user.entity");
const mail_service_1 = require("../mail/mail.service");
const uuid_1 = require("uuid");
const sanitize_user_util_1 = require("../common/utils/sanitize-user.util");
let PaymentsService = PaymentsService_1 = class PaymentsService {
    constructor(paymentRepo, refundRequestRepo, bookingRepo, userRepo, configService, mailService) {
        this.paymentRepo = paymentRepo;
        this.refundRequestRepo = refundRequestRepo;
        this.bookingRepo = bookingRepo;
        this.userRepo = userRepo;
        this.configService = configService;
        this.mailService = mailService;
        this.logger = new common_1.Logger(PaymentsService_1.name);
        this.paystack = new Paystack(configService.get('PAYSTACK_SECRET_KEY'));
    }
    async sendPostPaymentEmails(paymentId, fallbackUser) {
        const payment = await this.paymentRepo.findOne({
            where: { id: paymentId },
            relations: ['booking', 'booking.user', 'booking.items', 'booking.items.package', 'booking.items.destination', 'booking.travelers'],
        });
        if (!payment?.booking)
            return;
        const bookingOwner = payment.booking.user || fallbackUser;
        if (!bookingOwner)
            return;
        await this.mailService.sendOwnerPostPaymentSummary(bookingOwner, payment.booking, payment);
        await this.mailService.sendTravelerNotifications(payment.booking, payment, bookingOwner.email);
    }
    async markRefundCompletedByPaymentReference(reference, responseData) {
        const payment = await this.paymentRepo.findOne({
            where: { paystackReference: reference },
            relations: ['booking'],
        });
        if (!payment)
            return;
        await this.paymentRepo.update(payment.id, {
            status: payment_entity_1.PaymentStatus.REFUNDED,
            paystackResponse: responseData,
        });
        if (payment.bookingId) {
            await this.bookingRepo.update(payment.bookingId, { status: booking_entity_1.BookingStatus.CANCELLED });
            const pendingRefund = await this.refundRequestRepo.findOne({
                where: { bookingId: payment.bookingId, status: refund_request_entity_1.RefundRequestStatus.APPROVED },
                order: { createdAt: 'DESC' },
            });
            if (pendingRefund) {
                await this.refundRequestRepo.update(pendingRefund.id, {
                    status: refund_request_entity_1.RefundRequestStatus.COMPLETED,
                    resolvedAt: new Date(),
                });
            }
        }
    }
    async initialize(user, dto) {
        const booking = await this.bookingRepo.findOne({
            where: { id: dto.bookingId, userId: user.id },
        });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        if (booking.status !== booking_entity_1.BookingStatus.PENDING) {
            throw new common_1.BadRequestException('Only pending bookings can be paid for');
        }
        const amountKobo = Math.round(Number(booking.totalAmountNgn) * 100);
        if (dto.amount !== undefined && dto.amount !== amountKobo) {
            throw new common_1.BadRequestException('Amount does not match booking total');
        }
        const existingPayment = await this.paymentRepo.findOne({
            where: { bookingId: booking.id },
        });
        if (existingPayment?.status === payment_entity_1.PaymentStatus.SUCCEEDED) {
            throw new common_1.BadRequestException('This booking is already paid');
        }
        const reference = `STL-PAY-${(0, uuid_1.v4)().split('-')[0].toUpperCase()}`;
        const response = await this.paystack.transaction.initialize({
            email: dto.email,
            amount: amountKobo,
            currency: dto.currency || 'NGN',
            reference,
            callback_url: dto.callbackUrl || `${this.configService.get('FRONTEND_URL')}/checkout/success`,
            metadata: { bookingId: dto.bookingId, userId: user.id },
        });
        const accessCode = response.data?.access_code;
        const amountNgn = amountKobo / 100;
        const currency = dto.currency || 'NGN';
        if (existingPayment) {
            await this.paymentRepo.update(existingPayment.id, {
                paystackReference: reference,
                paystackAccessCode: accessCode,
                amountNgn,
                currency,
                status: payment_entity_1.PaymentStatus.PENDING,
            });
        }
        else {
            const payment = this.paymentRepo.create({
                bookingId: dto.bookingId,
                userId: user.id,
                paystackReference: reference,
                paystackAccessCode: accessCode,
                amountNgn,
                currency,
                status: payment_entity_1.PaymentStatus.PENDING,
            });
            await this.paymentRepo.save(payment);
        }
        return {
            authorization_url: response.data?.authorization_url,
            access_code: accessCode,
            reference,
        };
    }
    async verify(reference, user) {
        const response = await this.paystack.transaction.verify(reference);
        const data = response.data;
        if (!data || data.status !== 'success') {
            throw new common_1.BadRequestException('Payment verification failed');
        }
        const payment = await this.paymentRepo.findOne({
            where: { paystackReference: reference },
            relations: ['booking'],
        });
        if (!payment)
            throw new common_1.NotFoundException('Payment record not found');
        await this.paymentRepo.update(payment.id, {
            status: payment_entity_1.PaymentStatus.SUCCEEDED,
            channel: data.channel,
            paidAt: new Date(data.paid_at),
            paystackResponse: data,
        });
        await this.bookingRepo.update(payment.bookingId, { status: booking_entity_1.BookingStatus.CONFIRMED });
        await this.sendPostPaymentEmails(payment.id, user);
        return { status: 'success', amount: data.amount / 100, reference, bookingId: payment.bookingId };
    }
    async handleWebhook(payload, signature) {
        const secret = this.configService.get('PAYSTACK_WEBHOOK_SECRET');
        if (!secret) {
            throw new common_1.UnauthorizedException('Webhook secret is not configured');
        }
        const hash = crypto.createHmac('sha512', secret)
            .update(JSON.stringify(payload))
            .digest('hex');
        if (hash !== signature)
            throw new common_1.UnauthorizedException('Invalid webhook signature');
        const event = payload.event;
        const data = payload.data;
        this.logger.log(`Paystack webhook: ${event}`);
        if (event === 'charge.success') {
            const payment = await this.paymentRepo.findOne({ where: { paystackReference: data.reference } });
            if (payment && payment.status !== payment_entity_1.PaymentStatus.SUCCEEDED) {
                await this.paymentRepo.update(payment.id, { status: payment_entity_1.PaymentStatus.SUCCEEDED, paidAt: new Date(), paystackResponse: data });
                await this.bookingRepo.update(payment.bookingId, { status: booking_entity_1.BookingStatus.CONFIRMED });
                const user = await this.userRepo.findOne({ where: { id: payment.userId } });
                await this.sendPostPaymentEmails(payment.id, user || undefined);
            }
        }
        else if (event === 'refund.processed' || event === 'charge.refund') {
            await this.markRefundCompletedByPaymentReference(data.reference, data);
        }
        else if (event === 'charge.dispute.create') {
            await this.mailService.sendAdminAlert('charge.dispute', data);
        }
        return { received: true };
    }
    async getHistory(userId) {
        return this.paymentRepo.find({
            where: { userId },
            relations: ['booking'],
            order: { createdAt: 'DESC' },
        });
    }
    async getAllPayments(filters = {}) {
        const page = Number.isFinite(filters.page) ? Number(filters.page) : 1;
        const limit = Number.isFinite(filters.limit) ? Number(filters.limit) : 20;
        const queryBuilder = this.paymentRepo
            .createQueryBuilder('payment')
            .leftJoinAndSelect('payment.booking', 'booking')
            .leftJoinAndSelect('booking.user', 'user')
            .leftJoinAndSelect('booking.items', 'items')
            .leftJoinAndSelect('items.package', 'pkg')
            .leftJoinAndSelect('pkg.destination', 'destination')
            .orderBy('payment.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);
        if (filters.status) {
            queryBuilder.andWhere('payment.status = :status', { status: filters.status });
        }
        const search = filters.search?.trim();
        if (search) {
            const likeSearch = `%${search}%`;
            queryBuilder.andWhere(`(
          payment.paystackReference ILIKE :search
          OR booking.referenceNumber ILIKE :search
          OR user.email ILIKE :search
          OR user.firstName ILIKE :search
          OR user.lastName ILIKE :search
          OR pkg.title ILIKE :search
          OR destination.name ILIKE :search
        )`, { search: likeSearch });
        }
        const [payments, total] = await queryBuilder.getManyAndCount();
        return {
            payments: payments.map((p) => (0, sanitize_user_util_1.sanitizePayment)(p)),
            total,
            page,
            limit,
        };
    }
    async updateStatus(paymentId, status) {
        const payment = await this.paymentRepo.findOne({ where: { id: paymentId } });
        if (!payment)
            throw new common_1.NotFoundException('Payment not found');
        const paidAt = status === payment_entity_1.PaymentStatus.SUCCEEDED ? payment.paidAt ?? new Date() : null;
        await this.paymentRepo.update(paymentId, { status, paidAt });
        if (payment.bookingId) {
            if (status === payment_entity_1.PaymentStatus.SUCCEEDED) {
                await this.bookingRepo.update(payment.bookingId, { status: booking_entity_1.BookingStatus.CONFIRMED });
            }
            else if (status === payment_entity_1.PaymentStatus.REFUNDED) {
                await this.bookingRepo.update(payment.bookingId, { status: booking_entity_1.BookingStatus.CANCELLED });
            }
            else if (status === payment_entity_1.PaymentStatus.REFUND_PENDING) {
                await this.bookingRepo.update(payment.bookingId, { status: booking_entity_1.BookingStatus.CONFIRMED });
            }
            else if (status === payment_entity_1.PaymentStatus.FAILED) {
                await this.bookingRepo.update(payment.bookingId, { status: booking_entity_1.BookingStatus.PENDING });
            }
        }
        return this.paymentRepo.findOne({
            where: { id: paymentId },
            relations: ['booking', 'booking.user', 'booking.items', 'booking.items.package', 'booking.items.package.destination'],
        });
    }
    async approveRefundRequest(refundRequestId, admin) {
        const refund = await this.refundRequestRepo.findOne({
            where: { id: refundRequestId },
            relations: ['booking'],
        });
        if (!refund)
            throw new common_1.NotFoundException('Refund request not found');
        if (refund.status !== refund_request_entity_1.RefundRequestStatus.PENDING) {
            throw new common_1.BadRequestException('Only pending refund requests can be approved');
        }
        const payment = await this.paymentRepo.findOne({
            where: { bookingId: refund.bookingId },
            order: { createdAt: 'DESC' },
        });
        if (!payment || payment.status !== payment_entity_1.PaymentStatus.SUCCEEDED) {
            throw new common_1.BadRequestException('Booking has no successful payment to refund');
        }
        await this.refundRequestRepo.update(refund.id, {
            status: refund_request_entity_1.RefundRequestStatus.APPROVED,
            adminId: admin.id,
            resolvedAt: new Date(),
        });
        await this.paymentRepo.update(payment.id, { status: payment_entity_1.PaymentStatus.REFUND_PENDING });
        try {
            const paystackRefund = await this.paystack.refund.create({
                transaction: payment.paystackReference,
                amount: Math.round(Number(refund.requestedAmountNgn) * 100),
            });
            const refundReference = paystackRefund?.data?.reference || paystackRefund?.data?.refund_reference || null;
            await this.refundRequestRepo.update(refund.id, {
                paystackRefundReference: refundReference,
            });
            return this.refundRequestRepo.findOne({ where: { id: refund.id }, relations: ['booking', 'user'] });
        }
        catch (error) {
            await this.refundRequestRepo.update(refund.id, {
                status: refund_request_entity_1.RefundRequestStatus.FAILED,
                failureReason: error.message,
            });
            await this.paymentRepo.update(payment.id, { status: payment_entity_1.PaymentStatus.SUCCEEDED });
            throw new common_1.BadRequestException('Paystack refund failed to initialize');
        }
    }
    async rejectRefundRequest(refundRequestId, admin, reason) {
        const refund = await this.refundRequestRepo.findOne({ where: { id: refundRequestId } });
        if (!refund)
            throw new common_1.NotFoundException('Refund request not found');
        if (refund.status !== refund_request_entity_1.RefundRequestStatus.PENDING) {
            throw new common_1.BadRequestException('Only pending refund requests can be rejected');
        }
        await this.refundRequestRepo.update(refund.id, {
            status: refund_request_entity_1.RefundRequestStatus.REJECTED,
            adminId: admin.id,
            resolvedAt: new Date(),
            failureReason: reason.trim(),
        });
        return this.refundRequestRepo.findOne({ where: { id: refund.id }, relations: ['booking', 'user'] });
    }
    async getRefundRequests(filters = {}) {
        const page = Number.isFinite(filters.page) ? Number(filters.page) : 1;
        const limit = Number.isFinite(filters.limit) ? Number(filters.limit) : 20;
        const qb = this.refundRequestRepo
            .createQueryBuilder('refund')
            .leftJoinAndSelect('refund.booking', 'booking')
            .leftJoinAndSelect('refund.user', 'user')
            .orderBy('refund.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);
        if (filters.status) {
            qb.andWhere('refund.status = :status', { status: filters.status });
        }
        const [requests, total] = await qb.getManyAndCount();
        return { requests, total, page, limit };
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __param(1, (0, typeorm_1.InjectRepository)(refund_request_entity_1.RefundRequest)),
    __param(2, (0, typeorm_1.InjectRepository)(booking_entity_1.Booking)),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService,
        mail_service_1.MailService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map