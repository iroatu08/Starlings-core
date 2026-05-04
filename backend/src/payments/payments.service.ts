import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import * as Paystack from 'paystack';
import { ConfigService } from '@nestjs/config';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { RefundRequest, RefundRequestStatus } from './entities/refund-request.entity';
import { Booking, BookingStatus } from '../bookings/entities/booking.entity';
import { User } from '../users/entities/user.entity';
import { MailService } from '../mail/mail.service';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
import { v4 as uuidv4 } from 'uuid';
import { sanitizePayment } from '../common/utils/sanitize-user.util';

interface AdminPaymentsFilters {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
  search?: string;
}

interface AdminRefundFilters {
  page?: number;
  limit?: number;
  status?: RefundRequestStatus;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private paystack: any;

  constructor(
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @InjectRepository(RefundRequest) private refundRequestRepo: Repository<RefundRequest>,
    @InjectRepository(Booking) private bookingRepo: Repository<Booking>,
    @InjectRepository(User) private userRepo: Repository<User>,
    private configService: ConfigService,
    private mailService: MailService,
  ) {
    this.paystack = new (Paystack as any)(configService.get('PAYSTACK_SECRET_KEY'));
  }

  private async sendPostPaymentEmails(paymentId: string, fallbackUser?: User): Promise<void> {
    const payment = await this.paymentRepo.findOne({
      where: { id: paymentId },
      relations: ['booking', 'booking.user', 'booking.items', 'booking.items.package', 'booking.items.destination', 'booking.travelers'],
    });
    if (!payment?.booking) {
      this.logger.warn(`sendPostPaymentEmails: no booking for payment ${paymentId}`);
      return;
    }

    const bookingOwner = payment.booking.user || fallbackUser;
    if (!bookingOwner) {
      this.logger.warn(
        `sendPostPaymentEmails: missing owner user for payment ${paymentId} (booking ${payment.booking.id})`,
      );
      return;
    }
    await this.mailService.sendOwnerPostPaymentSummary(bookingOwner, payment.booking, payment);
    await this.mailService.sendTravelerNotifications(payment.booking, payment, bookingOwner.email);
  }

  private async markRefundCompletedByPaymentReference(reference: string, responseData: unknown): Promise<void> {
    const payment = await this.paymentRepo.findOne({
      where: { paystackReference: reference },
      relations: ['booking'],
    });
    if (!payment) return;

    await this.paymentRepo.update(payment.id, {
      status: PaymentStatus.REFUNDED,
      paystackResponse: responseData as any,
    });
    if (payment.bookingId) {
      await this.bookingRepo.update(payment.bookingId, { status: BookingStatus.CANCELLED });
      const pendingRefund = await this.refundRequestRepo.findOne({
        where: { bookingId: payment.bookingId, status: RefundRequestStatus.APPROVED },
        order: { createdAt: 'DESC' },
      });
      if (pendingRefund) {
        await this.refundRequestRepo.update(pendingRefund.id, {
          status: RefundRequestStatus.COMPLETED,
          resolvedAt: new Date(),
        });
      }
    }
  }

  async initialize(user: User, dto: InitializePaymentDto) {
    const booking = await this.bookingRepo.findOne({
      where: { id: dto.bookingId, userId: user.id },
    });
    if (!booking) throw new NotFoundException('Booking not found');

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Only pending bookings can be paid for');
    }

    const amountKobo = Math.round(Number(booking.totalAmountNgn) * 100);
    if (dto.amount !== undefined && dto.amount !== amountKobo) {
      throw new BadRequestException('Amount does not match booking total');
    }

    const existingPayment = await this.paymentRepo.findOne({
      where: { bookingId: booking.id },
    });
    if (existingPayment?.status === PaymentStatus.SUCCEEDED) {
      throw new BadRequestException('This booking is already paid');
    }

    const reference = `STL-PAY-${uuidv4().split('-')[0].toUpperCase()}`;

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
        status: PaymentStatus.PENDING,
      });
    } else {
      const payment = this.paymentRepo.create({
        bookingId: dto.bookingId,
        userId: user.id,
        paystackReference: reference,
        paystackAccessCode: accessCode,
        amountNgn,
        currency,
        status: PaymentStatus.PENDING,
      });
      await this.paymentRepo.save(payment);
    }

    return {
      authorization_url: response.data?.authorization_url,
      access_code: accessCode,
      reference,
    };
  }

  async verify(reference: string, user: User) {
    const payment = await this.paymentRepo.findOne({
      where: { paystackReference: reference },
      relations: ['booking'],
    });
    if (!payment) throw new NotFoundException('Payment record not found');
    if (payment.userId !== user.id) {
      throw new ForbiddenException('This payment does not belong to the current user');
    }

    if (payment.status === PaymentStatus.SUCCEEDED) {
      this.logger.log(`verify: payment already succeeded for ${reference}, skipping Paystack and emails`);
      return {
        status: 'success',
        amount: Number(payment.amountNgn),
        reference,
        bookingId: payment.bookingId,
        alreadyProcessed: true,
      };
    }

    const response = await this.paystack.transaction.verify(reference);
    const data = response.data;

    if (!data || data.status !== 'success') {
      throw new BadRequestException('Payment verification failed');
    }

    await this.paymentRepo.update(payment.id, {
      status: PaymentStatus.SUCCEEDED,
      channel: data.channel,
      paidAt: new Date(data.paid_at),
      paystackResponse: data,
    });

    await this.bookingRepo.update(payment.bookingId, { status: BookingStatus.CONFIRMED });
    await this.sendPostPaymentEmails(payment.id, user);

    return {
      status: 'success',
      amount: data.amount / 100,
      reference,
      bookingId: payment.bookingId,
      alreadyProcessed: false,
    };
  }

  // this is the webhook endpoint for paystack
  async handleWebhook(payload: any, signature: string) {
    const secret = this.configService.get('PAYSTACK_WEBHOOK_SECRET');
    if (!secret) {
      throw new UnauthorizedException('Webhook secret is not configured');
    }
    const hash = crypto.createHmac('sha512', secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    if (hash !== signature) throw new UnauthorizedException('Invalid webhook signature');

    const event = payload.event;
    const data = payload.data;

    this.logger.log(`Paystack webhook: ${event}`);

    if (event === 'charge.success') {
      const payment = await this.paymentRepo.findOne({ where: { paystackReference: data.reference } });
      if (payment && payment.status !== PaymentStatus.SUCCEEDED) {
        await this.paymentRepo.update(payment.id, { status: PaymentStatus.SUCCEEDED, paidAt: new Date(), paystackResponse: data });
        await this.bookingRepo.update(payment.bookingId, { status: BookingStatus.CONFIRMED });
        const user = await this.userRepo.findOne({ where: { id: payment.userId } });
        await this.sendPostPaymentEmails(payment.id, user || undefined);
      }
    } else if (event === 'refund.processed' || event === 'charge.refund') {
      await this.markRefundCompletedByPaymentReference(data.reference, data);
    } else if (event === 'charge.dispute.create') {
      await this.mailService.sendAdminAlert('charge.dispute', data);
    }

    return { received: true };
  }

  async getHistory(userId: string) {
    return this.paymentRepo.find({
      where: { userId },
      relations: ['booking'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAllPayments(filters: AdminPaymentsFilters = {}) {
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
      queryBuilder.andWhere(
        `(
          payment.paystackReference ILIKE :search
          OR booking.referenceNumber ILIKE :search
          OR user.email ILIKE :search
          OR user.firstName ILIKE :search
          OR user.lastName ILIKE :search
          OR pkg.title ILIKE :search
          OR destination.name ILIKE :search
        )`,
        { search: likeSearch },
      );
    }

    const [payments, total] = await queryBuilder.getManyAndCount();
    return {
      payments: payments.map((p) => sanitizePayment(p)),
      total,
      page,
      limit,
    };
  }

  async updateStatus(paymentId: string, status: PaymentStatus) {
    const payment = await this.paymentRepo.findOne({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException('Payment not found');

    const paidAt = status === PaymentStatus.SUCCEEDED ? payment.paidAt ?? new Date() : null;
    await this.paymentRepo.update(paymentId, { status, paidAt });

    if (payment.bookingId) {
      if (status === PaymentStatus.SUCCEEDED) {
        await this.bookingRepo.update(payment.bookingId, { status: BookingStatus.CONFIRMED });
      } else if (status === PaymentStatus.REFUNDED) {
        await this.bookingRepo.update(payment.bookingId, { status: BookingStatus.CANCELLED });
      } else if (status === PaymentStatus.REFUND_PENDING) {
        await this.bookingRepo.update(payment.bookingId, { status: BookingStatus.CONFIRMED });
      } else if (status === PaymentStatus.FAILED) {
        await this.bookingRepo.update(payment.bookingId, { status: BookingStatus.PENDING });
      }
    }

    return this.paymentRepo.findOne({
      where: { id: paymentId },
      relations: ['booking', 'booking.user', 'booking.items', 'booking.items.package', 'booking.items.package.destination'],
    });
  }

  async approveRefundRequest(refundRequestId: string, admin: User) {
    const refund = await this.refundRequestRepo.findOne({
      where: { id: refundRequestId },
      relations: ['booking'],
    });
    if (!refund) throw new NotFoundException('Refund request not found');
    if (refund.status !== RefundRequestStatus.PENDING) {
      throw new BadRequestException('Only pending refund requests can be approved');
    }

    const payment = await this.paymentRepo.findOne({
      where: { bookingId: refund.bookingId },
      order: { createdAt: 'DESC' },
    });
    if (!payment || payment.status !== PaymentStatus.SUCCEEDED) {
      throw new BadRequestException('Booking has no successful payment to refund');
    }

    await this.refundRequestRepo.update(refund.id, {
      status: RefundRequestStatus.APPROVED,
      adminId: admin.id,
      resolvedAt: new Date(),
    });
    await this.paymentRepo.update(payment.id, { status: PaymentStatus.REFUND_PENDING });

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
    } catch (error) {
      await this.refundRequestRepo.update(refund.id, {
        status: RefundRequestStatus.FAILED,
        failureReason: (error as Error).message,
      });
      await this.paymentRepo.update(payment.id, { status: PaymentStatus.SUCCEEDED });
      throw new BadRequestException('Paystack refund failed to initialize');
    }
  }

  async rejectRefundRequest(refundRequestId: string, admin: User, reason: string) {
    const refund = await this.refundRequestRepo.findOne({ where: { id: refundRequestId } });
    if (!refund) throw new NotFoundException('Refund request not found');
    if (refund.status !== RefundRequestStatus.PENDING) {
      throw new BadRequestException('Only pending refund requests can be rejected');
    }
    await this.refundRequestRepo.update(refund.id, {
      status: RefundRequestStatus.REJECTED,
      adminId: admin.id,
      resolvedAt: new Date(),
      failureReason: reason.trim(),
    });
    return this.refundRequestRepo.findOne({ where: { id: refund.id }, relations: ['booking', 'user'] });
  }

  async getRefundRequests(filters: AdminRefundFilters = {}) {
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
}
