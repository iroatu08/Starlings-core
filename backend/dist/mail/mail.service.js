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
var MailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const resend_1 = require("resend");
const pdfkit_1 = require("pdfkit");
const mail_template_renderer_1 = require("./mail-template.renderer");
const mail_constants_1 = require("./mail.constants");
const booking_email_groups_util_1 = require("./utils/booking-email-groups.util");
let MailService = MailService_1 = class MailService {
    constructor(config, renderer, resend) {
        this.config = config;
        this.renderer = renderer;
        this.resend = resend;
        this.logger = new common_1.Logger(MailService_1.name);
        this.mailFrom = this.config.getOrThrow('MAIL_FROM');
    }
    async sendWithResend(to, subject, html, attachments) {
        const { error } = await this.resend.emails.send({
            from: this.mailFrom,
            to,
            subject,
            html,
            attachments: attachments?.map((attachment) => ({
                filename: attachment.filename,
                content: attachment.content,
            })),
        });
        if (error) {
            throw new Error(error.message);
        }
    }
    async sendTemplate(to, subject, templateRef, context, attachments) {
        const html = await this.renderer.render(templateRef, context);
        await this.sendWithResend(to, subject, html, attachments);
    }
    async buildOwnerReceiptPdf(user, booking, payment) {
        const doc = new pdfkit_1.default({ margin: 42, size: 'A4' });
        const chunks = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        const done = new Promise((resolve) => doc.on('end', () => resolve(Buffer.concat(chunks))));
        doc.fontSize(20).text('Starlings Hospitality');
        doc.moveDown(0.5);
        doc.fontSize(14).text('Payment confirmation receipt');
        doc.moveDown(0.8);
        doc.fontSize(11).text(`Owner: ${user.firstName} ${user.lastName}`);
        doc.text(`Owner email: ${user.email}`);
        doc.text(`Booking reference: ${booking.referenceNumber}`);
        doc.text(`Payment reference: ${payment.paystackReference}`);
        doc.text(`Paid at: ${payment.paidAt}`);
        doc.moveDown(0.8);
        doc.fontSize(12).text('Travelers', { underline: true });
        (booking.travelers ?? []).forEach((traveler, index) => {
            doc.fontSize(10).text(`${index + 1}. ${traveler.firstName} ${traveler.lastName} (${traveler.email || 'No email'})`);
        });
        doc.moveDown(0.8);
        doc.fontSize(12).text('Items', { underline: true });
        const pdfGroups = (0, booking_email_groups_util_1.buildDestinationGroupsForEmail)(booking.items ?? []);
        pdfGroups.forEach((group, groupIndex) => {
            doc.moveDown(0.4);
            doc
                .fontSize(11)
                .text(`${groupIndex + 1}. ${group.destinationName}${group.country ? ` · ${group.country}` : ''}`);
            doc.fontSize(10);
            group.lines.forEach((line, lineIndex) => {
                doc.text(`   ${lineIndex + 1}. ${line.title} ×${line.quantity} — NGN ${line.lineTotalNgn}`);
            });
            doc.fontSize(9).text(`   Subtotal: NGN ${group.subtotalNgn}`);
        });
        doc.moveDown(0.8);
        doc.fontSize(12).text(`Total paid: NGN ${booking.totalAmountNgn}`);
        doc.end();
        return done;
    }
    async sendWelcome(user) {
        try {
            await this.sendTemplate(user.email, 'Welcome to Starlings Hospitality!', 'welcome', {
                firstName: user.firstName,
            });
        }
        catch (error) {
            const err = error;
            this.logger.error(`Failed to send welcome email to ${user.email}`, err.stack);
        }
    }
    async sendVerificationEmail(user, token) {
        try {
            await this.sendTemplate(user.email, 'Verify your Starlings account', 'verify-email', {
                firstName: user.firstName,
                verifyUrl: `${process.env.FRONTEND_URL}/verify?token=${token}`,
            });
        }
        catch (error) {
            const err = error;
            this.logger.error(`Failed to send verification email to ${user.email}`, err.stack);
        }
    }
    async sendBookingConfirmation(user, booking) {
        try {
            const destinationGroups = (0, booking_email_groups_util_1.buildDestinationGroupsForEmail)(booking.items ?? []);
            await this.sendTemplate(user.email, `Booking Confirmed — Ref #${booking.referenceNumber}`, 'booking-confirm', {
                firstName: user.firstName,
                referenceNumber: booking.referenceNumber,
                items: booking.items,
                destinationGroups,
                destinationsSummary: (0, booking_email_groups_util_1.buildDestinationsSummary)(destinationGroups),
                totalAmount: booking.totalAmountNgn,
                createdAt: booking.createdAt,
            });
        }
        catch (error) {
            const err = error;
            this.logger.error(`Failed to send booking confirmation to ${user.email}`, err.stack);
        }
    }
    async sendBookingInitiated(user, booking) {
        try {
            await this.sendTemplate(user.email, `Booking created — Ref #${booking.referenceNumber}`, 'booking-status', {
                firstName: user.firstName,
                referenceNumber: booking.referenceNumber,
                status: 'pending_payment',
            });
        }
        catch (error) {
            const err = error;
            this.logger.error(`Failed to send booking initiated email to ${user.email}`, err.stack);
        }
    }
    async sendPaymentReceipt(user, payment) {
        try {
            await this.sendTemplate(user.email, 'Payment received — Starlings Hospitality', 'payment-receipt', {
                firstName: user.firstName,
                reference: payment.paystackReference,
                amount: payment.amountNgn,
                paidAt: payment.paidAt,
            });
        }
        catch (error) {
            const err = error;
            this.logger.error(`Failed to send payment receipt to ${user.email}`, err.stack);
        }
    }
    async sendOwnerPostPaymentSummary(user, booking, payment) {
        try {
            const travelers = (booking.travelers ?? []);
            const pdfAttachment = await this.buildOwnerReceiptPdf(user, booking, payment);
            const destinationGroups = (0, booking_email_groups_util_1.buildDestinationGroupsForEmail)(booking.items ?? []);
            await this.sendTemplate(user.email, `Payment confirmed — Ref #${booking.referenceNumber}`, 'booking-owner-paid', {
                ownerFirstName: user.firstName,
                ownerLastName: user.lastName,
                ownerEmail: user.email,
                ownerPhone: user.phone ?? '',
                bookingReference: booking.referenceNumber,
                paystackReference: payment.paystackReference,
                paidAt: payment.paidAt,
                amountNgn: Number(payment.amountNgn),
                bookingCreatedAt: booking.createdAt,
                travelers: travelers.map((traveler) => ({
                    firstName: traveler.firstName,
                    lastName: traveler.lastName,
                    email: traveler.email || '—',
                    phone: traveler.phone || '—',
                    isPrimary: traveler.isPrimary,
                })),
                items: booking.items ?? [],
                destinationGroups,
                destinationsSummary: (0, booking_email_groups_util_1.buildDestinationsSummary)(destinationGroups),
                totalAmountNgn: Number(booking.totalAmountNgn),
            }, [
                {
                    filename: `receipt-${booking.referenceNumber}.pdf`,
                    content: pdfAttachment,
                },
            ]);
        }
        catch (error) {
            const err = error;
            this.logger.error(`Failed to send owner payment summary to ${user.email}`, err.stack);
        }
    }
    async sendTravelerNotifications(booking, payment, ownerEmail) {
        const travelers = (booking.travelers ?? []);
        const destinationGroups = (0, booking_email_groups_util_1.buildDestinationGroupsForEmail)(booking.items ?? []);
        const destinationsSummary = (0, booking_email_groups_util_1.buildDestinationsSummary)(destinationGroups);
        for (const traveler of travelers) {
            const to = traveler.email?.trim().toLowerCase();
            if (!to || to === ownerEmail.trim().toLowerCase())
                continue;
            try {
                await this.sendTemplate(to, `Your Starlings booking details — Ref #${booking.referenceNumber}`, 'traveler-booking-notice', {
                    firstName: traveler.firstName,
                    lastName: traveler.lastName,
                    bookingReference: booking.referenceNumber,
                    paystackReference: payment.paystackReference,
                    paidAt: payment.paidAt,
                    totalAmountNgn: Number(booking.totalAmountNgn),
                    itemCount: booking.items?.length ?? 0,
                    destinationsSummary,
                    isPrimary: traveler.isPrimary,
                });
            }
            catch (error) {
                const err = error;
                this.logger.error(`Failed to send traveler notice to ${to}`, err.stack);
            }
        }
    }
    async sendPasswordReset(user, token) {
        try {
            await this.sendTemplate(user.email, 'Reset your Starlings password', 'password-reset', {
                firstName: user.firstName,
                resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${token}`,
                expiresIn: '1 hour',
            });
        }
        catch (error) {
            const err = error;
            this.logger.error(`Failed to send password reset to ${user.email}`, err.stack);
        }
    }
    async sendBookingStatusUpdate(user, booking) {
        try {
            await this.sendTemplate(user.email, `Booking Update — Ref #${booking.referenceNumber}`, 'booking-status', {
                firstName: user.firstName,
                referenceNumber: booking.referenceNumber,
                status: booking.status,
            });
        }
        catch (error) {
            const err = error;
            this.logger.error(`Failed to send booking status update to ${user.email}`, err.stack);
        }
    }
    async sendContactAutoReply(submission) {
        try {
            await this.sendTemplate(submission.email, 'We received your message — Starlings Hospitality', 'contact-received', { name: submission.name });
        }
        catch (error) {
            const err = error;
            this.logger.error(`Failed to send contact auto-reply to ${submission.email}`, err.stack);
        }
    }
    async sendHtmlEmail(to, subject, html) {
        try {
            await this.sendWithResend(to, subject, html);
        }
        catch (error) {
            const err = error;
            this.logger.error(`Failed to send HTML email to ${to}`, err.stack);
            throw error;
        }
    }
    async sendAdminAlert(type, payload) {
        try {
            const adminEmail = this.config.getOrThrow('ADMIN_EMAIL');
            await this.sendTemplate(adminEmail, `[Starlings Admin] ${type}`, 'admin-alert', {
                type,
                payload: JSON.stringify(payload, null, 2),
            });
        }
        catch (error) {
            const err = error;
            this.logger.error(`Failed to send admin alert: ${type}`, err.stack);
        }
    }
};
exports.MailService = MailService;
exports.MailService = MailService = MailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)(mail_constants_1.RESEND_CLIENT)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        mail_template_renderer_1.MailTemplateRenderer,
        resend_1.Resend])
], MailService);
//# sourceMappingURL=mail.service.js.map