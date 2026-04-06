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
const booking_entity_1 = require("../bookings/entities/booking.entity");
const user_entity_1 = require("../users/entities/user.entity");
const mail_service_1 = require("../mail/mail.service");
const uuid_1 = require("uuid");
let PaymentsService = PaymentsService_1 = class PaymentsService {
    constructor(paymentRepo, bookingRepo, userRepo, configService, mailService) {
        this.paymentRepo = paymentRepo;
        this.bookingRepo = bookingRepo;
        this.userRepo = userRepo;
        this.configService = configService;
        this.mailService = mailService;
        this.logger = new common_1.Logger(PaymentsService_1.name);
        this.paystack = new Paystack(configService.get('PAYSTACK_SECRET_KEY'));
    }
    async initialize(user, dto) {
        const booking = await this.bookingRepo.findOne({
            where: { id: dto.bookingId, userId: user.id },
        });
        if (!booking)
            throw new common_1.NotFoundException('Booking not found');
        const reference = `STL-PAY-${(0, uuid_1.v4)().split('-')[0].toUpperCase()}`;
        const response = await this.paystack.transaction.initialize({
            email: dto.email,
            amount: dto.amount,
            currency: dto.currency || 'NGN',
            reference,
            callback_url: dto.callbackUrl || `${this.configService.get('FRONTEND_URL')}/checkout/success`,
            metadata: { bookingId: dto.bookingId, userId: user.id },
        });
        const payment = this.paymentRepo.create({
            bookingId: dto.bookingId,
            userId: user.id,
            paystackReference: reference,
            paystackAccessCode: response.data?.access_code,
            amountNgn: dto.amount / 100,
            currency: dto.currency || 'NGN',
            status: payment_entity_1.PaymentStatus.PENDING,
        });
        await this.paymentRepo.save(payment);
        return {
            authorization_url: response.data?.authorization_url,
            access_code: response.data?.access_code,
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
        const updatedPayment = await this.paymentRepo.findOne({ where: { id: payment.id } });
        await this.mailService.sendPaymentReceipt(user, updatedPayment);
        return { status: 'success', amount: data.amount / 100, reference, bookingId: payment.bookingId };
    }
    async handleWebhook(payload, signature) {
        const secret = this.configService.get('PAYSTACK_WEBHOOK_SECRET');
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
            if (payment) {
                await this.paymentRepo.update(payment.id, { status: payment_entity_1.PaymentStatus.SUCCEEDED, paidAt: new Date(), paystackResponse: data });
                await this.bookingRepo.update(payment.bookingId, { status: booking_entity_1.BookingStatus.CONFIRMED });
                const user = await this.userRepo.findOne({ where: { id: payment.userId } });
                if (user)
                    await this.mailService.sendPaymentReceipt(user, payment);
            }
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
    async getAllPayments(page = 1, limit = 20) {
        const [payments, total] = await this.paymentRepo.findAndCount({
            relations: ['booking', 'booking.user'],
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return { payments, total, page, limit };
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = PaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __param(1, (0, typeorm_1.InjectRepository)(booking_entity_1.Booking)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService,
        mail_service_1.MailService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map