import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import * as Paystack from 'paystack';
import { ConfigService } from '@nestjs/config';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { Booking, BookingStatus } from '../bookings/entities/booking.entity';
import { User } from '../users/entities/user.entity';
import { MailService } from '../mail/mail.service';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private paystack: any;

  constructor(
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @InjectRepository(Booking) private bookingRepo: Repository<Booking>,
    @InjectRepository(User) private userRepo: Repository<User>,
    private configService: ConfigService,
    private mailService: MailService,
  ) {
    this.paystack = new (Paystack as any)(configService.get('PAYSTACK_SECRET_KEY'));
  }

  async initialize(user: User, dto: InitializePaymentDto) {
    const booking = await this.bookingRepo.findOne({
      where: { id: dto.bookingId, userId: user.id },
    });
    if (!booking) throw new NotFoundException('Booking not found');

    const reference = `STL-PAY-${uuidv4().split('-')[0].toUpperCase()}`;

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
      status: PaymentStatus.PENDING,
    });
    await this.paymentRepo.save(payment);

    return {
      authorization_url: response.data?.authorization_url,
      access_code: response.data?.access_code,
      reference,
    };
  }

  async verify(reference: string, user: User) {
    const response = await this.paystack.transaction.verify(reference);
    const data = response.data;

    if (!data || data.status !== 'success') {
      throw new BadRequestException('Payment verification failed');
    }

    const payment = await this.paymentRepo.findOne({
      where: { paystackReference: reference },
      relations: ['booking'],
    });
    if (!payment) throw new NotFoundException('Payment record not found');

    await this.paymentRepo.update(payment.id, {
      status: PaymentStatus.SUCCEEDED,
      channel: data.channel,
      paidAt: new Date(data.paid_at),
      paystackResponse: data,
    });

    await this.bookingRepo.update(payment.bookingId, { status: BookingStatus.CONFIRMED });

    const updatedPayment = await this.paymentRepo.findOne({ where: { id: payment.id } });
    await this.mailService.sendPaymentReceipt(user, updatedPayment);

    return { status: 'success', amount: data.amount / 100, reference, bookingId: payment.bookingId };
  }

  async handleWebhook(payload: any, signature: string) {
    const secret = this.configService.get('PAYSTACK_WEBHOOK_SECRET');
    const hash = crypto.createHmac('sha512', secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    if (hash !== signature) throw new UnauthorizedException('Invalid webhook signature');

    const event = payload.event;
    const data = payload.data;

    this.logger.log(`Paystack webhook: ${event}`);

    if (event === 'charge.success') {
      const payment = await this.paymentRepo.findOne({ where: { paystackReference: data.reference } });
      if (payment) {
        await this.paymentRepo.update(payment.id, { status: PaymentStatus.SUCCEEDED, paidAt: new Date(), paystackResponse: data });
        await this.bookingRepo.update(payment.bookingId, { status: BookingStatus.CONFIRMED });
        const user = await this.userRepo.findOne({ where: { id: payment.userId } });
        if (user) await this.mailService.sendPaymentReceipt(user, payment);
      }
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

  async getAllPayments(page = 1, limit = 20) {
    const [payments, total] = await this.paymentRepo.findAndCount({
      relations: ['booking', 'booking.user'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { payments, total, page, limit };
  }
}
