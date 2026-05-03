import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import { BookingItem } from './entities/booking-item.entity';
import { BookingTraveler } from './entities/booking-traveler.entity';
import { Payment, PaymentStatus } from '../payments/entities/payment.entity';
import { RefundRequest, RefundRequestStatus } from '../payments/entities/refund-request.entity';
import { CartService } from '../cart/cart.service';
import { MailService } from '../mail/mail.service';
import { sanitizeBooking } from '../common/utils/sanitize-user.util';
import { User, UserRole } from '../users/entities/user.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import PDFDocument from 'pdfkit';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking) private bookingRepo: Repository<Booking>,
    @InjectRepository(BookingItem) private itemRepo: Repository<BookingItem>,
    @InjectRepository(BookingTraveler) private travelerRepo: Repository<BookingTraveler>,
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @InjectRepository(RefundRequest) private refundRequestRepo: Repository<RefundRequest>,
    private cartService: CartService,
    private mailService: MailService,
  ) {}

  private assertBookingStatusTransition(
    current: BookingStatus,
    next: BookingStatus,
    payment: Payment | null,
  ): void {
    if (current === BookingStatus.CANCELLED || current === BookingStatus.COMPLETED) {
      throw new BadRequestException(`Cannot change booking status from ${current}`);
    }

    if (next === BookingStatus.PENDING) {
      if (current === BookingStatus.CONFIRMED && payment?.status === PaymentStatus.FAILED) {
        return;
      }
      throw new BadRequestException(
        'Booking can only be set to pending when reverting from confirmed after a failed payment',
      );
    }

    if (next === BookingStatus.CONFIRMED) {
      if (current !== BookingStatus.PENDING) {
        throw new BadRequestException(`Cannot set status to confirmed from ${current}`);
      }
      if (!payment || payment.status !== PaymentStatus.SUCCEEDED) {
        throw new BadRequestException('Cannot confirm booking without a successful payment');
      }
      return;
    }

    if (next === BookingStatus.CANCELLED) {
      if (current !== BookingStatus.PENDING && current !== BookingStatus.CONFIRMED) {
        throw new BadRequestException(`Cannot cancel booking from ${current}`);
      }
      return;
    }

    if (next === BookingStatus.COMPLETED) {
      if (current !== BookingStatus.CONFIRMED) {
        throw new BadRequestException('Booking must be confirmed before it can be completed');
      }
      return;
    }
  }

  // generate a reference number for a booking
  private generateReference(): string {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `STL-${ts}-${rand}`;
  }

  private validateTravelers(
    user: User,
    cartItems: Array<{ quantity: number; package?: { maxCapacity?: number } | null }>,
    dto?: CreateBookingDto,
  ): BookingTraveler[] {
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
      throw new BadRequestException(`Traveler count exceeds package capacity (${totalCapacity})`);
    }

    const primaryCount = travelersInput.filter((traveler) => traveler.isPrimary).length;
    if (primaryCount > 1) {
      throw new BadRequestException('Only one traveler can be marked as primary');
    }

    const normalizedEmailSet = new Set<string>();
    const travelers = travelersInput.map((traveler, index) => {
      const normalizedEmail = traveler.email?.trim().toLowerCase() ?? null;
      if (normalizedEmail) {
        if (normalizedEmailSet.has(normalizedEmail)) {
          throw new BadRequestException('Traveler emails must be unique');
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


  // create a booking from a cart
  async createFromCart(user: User, dto?: CreateBookingDto) {
    const cart = await this.cartService.getOrCreateCart(user.id);
    if (!cart.items || cart.items.length === 0) {
      throw new NotFoundException('Your cart is empty');
    }

    const totalAmountNgn = cart.items.reduce(
      (sum, item) => sum + Number(item.unitPriceNgn) * item.quantity,
      0,
    );

    const destinationImageUrl =
      cart.items.find((item) => item.package?.destination?.heroImageUrl)?.package?.destination?.heroImageUrl ||
      null;

    const booking = this.bookingRepo.create();
    booking.userId = user.id;
    booking.referenceNumber = this.generateReference();
    booking.status = BookingStatus.PENDING;
    booking.totalAmountNgn = totalAmountNgn;
    booking.travelers = this.validateTravelers(user, cart.items, dto);
    (booking as Booking & { imageUrl?: string | null }).imageUrl = destinationImageUrl;
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

  // find all bookings for a user
  async findMyBookings(userId: string) {
    return this.bookingRepo.find({
      where: { userId },
      relations: ['items', 'items.package', 'items.destination', 'payment', 'travelers', 'refundRequests'],
      order: { createdAt: 'DESC' },
    });
  }

  // find one booking by id
  async findOne(id: string) {
    const booking = await this.bookingRepo.findOne({
      where: { id },
      relations: ['items', 'items.package', 'items.destination', 'payment', 'travelers', 'refundRequests', 'user'],
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return sanitizeBooking(booking);
  }

  // find one booking by id for a user
  async findOneForUser(id: string, userId: string, role: UserRole) {
    const booking = await this.findOne(id);
    if (role !== UserRole.ADMIN && booking.userId !== userId) {
      throw new ForbiddenException('You cannot access this booking');
    }
    return booking;
  }

  // find all bookings
  async findAll(
    page = 1,
    limit = 20,
    status?: BookingStatus,
    filters?: { destinationId?: string; userId?: string; from?: string; to?: string },
  ) {
    const qb = this.bookingRepo.createQueryBuilder('booking')
      .leftJoinAndSelect('booking.user', 'user')
      .leftJoinAndSelect('booking.items', 'items')
      .leftJoinAndSelect('items.package', 'package')
      .leftJoinAndSelect('items.destination', 'destination')
      .leftJoinAndSelect('booking.travelers', 'travelers')
      .leftJoinAndSelect('booking.refundRequests', 'refundRequests')
      .leftJoinAndSelect('booking.payment', 'payment');

    if (status) qb.where('booking.status = :status', { status });
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
    return { bookings: bookings.map((b) => sanitizeBooking(b)), total, page, limit };
  }

  // update the status of a booking
  async updateStatus(id: string, status: BookingStatus, user: User) {
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

  async requestRefund(id: string, user: User, reason: string) {
    const booking = await this.findOneForUser(id, user.id, user.role);
    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException('Only confirmed bookings can request refunds');
    }
    if (!booking.payment || booking.payment.status !== PaymentStatus.SUCCEEDED) {
      throw new BadRequestException('Only paid bookings can request refunds');
    }

    const existingOpen = await this.refundRequestRepo.findOne({
      where: { bookingId: id, status: RefundRequestStatus.PENDING },
    });
    if (existingOpen) {
      throw new BadRequestException('A refund request for this booking is already pending');
    }

    const refundRequest = this.refundRequestRepo.create({
      bookingId: id,
      userId: user.id,
      reason: reason.trim(),
      requestedAmountNgn: booking.payment.amountNgn,
      status: RefundRequestStatus.PENDING,
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

  async generateReceiptPdf(id: string, user: User): Promise<{ fileName: string; buffer: Buffer }> {
    const booking = await this.findOneForUser(id, user.id, user.role);

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk as Buffer));
    const done = new Promise<Buffer>((resolve) => {
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
    } else {
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
}
