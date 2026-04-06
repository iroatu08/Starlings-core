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
var MailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const mailer_1 = require("@nestjs-modules/mailer");
let MailService = MailService_1 = class MailService {
    constructor(mailerService) {
        this.mailerService = mailerService;
        this.logger = new common_1.Logger(MailService_1.name);
    }
    async sendWelcome(user) {
        try {
            await this.mailerService.sendMail({
                to: user.email,
                subject: 'Welcome to Starlings Hospitality!',
                template: './welcome',
                context: { firstName: user.firstName },
            });
        }
        catch (error) {
            this.logger.error(`Failed to send welcome email to ${user.email}`, error.stack);
        }
    }
    async sendVerificationEmail(user, token) {
        try {
            await this.mailerService.sendMail({
                to: user.email,
                subject: 'Verify your Starlings account',
                template: './verify-email',
                context: {
                    firstName: user.firstName,
                    verifyUrl: `${process.env.FRONTEND_URL}/verify?token=${token}`,
                },
            });
        }
        catch (error) {
            this.logger.error(`Failed to send verification email to ${user.email}`, error.stack);
        }
    }
    async sendBookingConfirmation(user, booking) {
        try {
            await this.mailerService.sendMail({
                to: user.email,
                subject: `Booking Confirmed — Ref #${booking.referenceNumber}`,
                template: './booking-confirm',
                context: {
                    firstName: user.firstName,
                    referenceNumber: booking.referenceNumber,
                    items: booking.items,
                    totalAmount: booking.totalAmountNgn,
                    createdAt: booking.createdAt,
                },
            });
        }
        catch (error) {
            this.logger.error(`Failed to send booking confirmation to ${user.email}`, error.stack);
        }
    }
    async sendPaymentReceipt(user, payment) {
        try {
            await this.mailerService.sendMail({
                to: user.email,
                subject: 'Payment received — Starlings Hospitality',
                template: './payment-receipt',
                context: {
                    firstName: user.firstName,
                    reference: payment.paystackReference,
                    amount: payment.amountNgn,
                    paidAt: payment.paidAt,
                },
            });
        }
        catch (error) {
            this.logger.error(`Failed to send payment receipt to ${user.email}`, error.stack);
        }
    }
    async sendPasswordReset(user, token) {
        try {
            await this.mailerService.sendMail({
                to: user.email,
                subject: 'Reset your Starlings password',
                template: './password-reset',
                context: {
                    firstName: user.firstName,
                    resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${token}`,
                    expiresIn: '1 hour',
                },
            });
        }
        catch (error) {
            this.logger.error(`Failed to send password reset to ${user.email}`, error.stack);
        }
    }
    async sendBookingStatusUpdate(user, booking) {
        try {
            await this.mailerService.sendMail({
                to: user.email,
                subject: `Booking Update — Ref #${booking.referenceNumber}`,
                template: './booking-status',
                context: {
                    firstName: user.firstName,
                    referenceNumber: booking.referenceNumber,
                    status: booking.status,
                },
            });
        }
        catch (error) {
            this.logger.error(`Failed to send booking status update to ${user.email}`, error.stack);
        }
    }
    async sendContactAutoReply(submission) {
        try {
            await this.mailerService.sendMail({
                to: submission.email,
                subject: 'We received your message — Starlings Hospitality',
                template: './contact-received',
                context: { name: submission.name },
            });
        }
        catch (error) {
            this.logger.error(`Failed to send contact auto-reply to ${submission.email}`, error.stack);
        }
    }
    async sendAdminAlert(type, payload) {
        try {
            await this.mailerService.sendMail({
                to: process.env.ADMIN_EMAIL,
                subject: `[Starlings Admin] ${type}`,
                template: './admin-alert',
                context: { type, payload: JSON.stringify(payload, null, 2) },
            });
        }
        catch (error) {
            this.logger.error(`Failed to send admin alert: ${type}`, error.stack);
        }
    }
};
exports.MailService = MailService;
exports.MailService = MailService = MailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mailer_1.MailerService])
], MailService);
//# sourceMappingURL=mail.service.js.map