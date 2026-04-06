import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import { BookingItem } from './entities/booking-item.entity';
import { Cart } from '../cart/entities/cart.entity';
import { CartService } from '../cart/cart.service';
import { MailService } from '../mail/mail.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking) private bookingRepo: Repository<Booking>,
    @InjectRepository(BookingItem) private itemRepo: Repository<BookingItem>,
    private cartService: CartService,
    private mailService: MailService,
  ) {}

  private generateReference(): string {
    const ts = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `STL-${ts}-${rand}`;
  }

  async createFromCart(user: User) {
    const cart = await this.cartService.getOrCreateCart(user.id);
    if (!cart.items || cart.items.length === 0) {
      throw new NotFoundException('Your cart is empty');
    }

    const totalAmountNgn = cart.items.reduce(
      (sum, item) => sum + Number(item.unitPriceNgn) * item.quantity,
      0,
    );

    const booking = this.bookingRepo.create({
      userId: user.id,
      referenceNumber: this.generateReference(),
      status: BookingStatus.PENDING,
      totalAmountNgn,
    });
    await this.bookingRepo.save(booking);

    const bookingItems = cart.items.map(item =>
      this.itemRepo.create({
        bookingId: booking.id,
        packageId: item.packageId,
        quantity: item.quantity,
        unitPriceNgn: item.unitPriceNgn,
      }),
    );
    await this.itemRepo.save(bookingItems);

    await this.cartService.clearCart(user.id);

    const fullBooking = await this.findOne(booking.id);
    await this.mailService.sendBookingConfirmation(user, fullBooking);

    return fullBooking;
  }

  async findMyBookings(userId: string) {
    return this.bookingRepo.find({
      where: { userId },
      relations: ['items', 'items.package', 'payment'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const booking = await this.bookingRepo.findOne({
      where: { id },
      relations: ['items', 'items.package', 'payment', 'user'],
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async findAll(page = 1, limit = 20, status?: BookingStatus) {
    const qb = this.bookingRepo.createQueryBuilder('booking')
      .leftJoinAndSelect('booking.user', 'user')
      .leftJoinAndSelect('booking.items', 'items')
      .leftJoinAndSelect('items.package', 'package')
      .leftJoinAndSelect('booking.payment', 'payment');

    if (status) qb.where('booking.status = :status', { status });
    qb.orderBy('booking.createdAt', 'DESC').skip((page - 1) * limit).take(limit);

    const [bookings, total] = await qb.getManyAndCount();
    return { bookings, total, page, limit };
  }

  async updateStatus(id: string, status: BookingStatus, user: User) {
    const booking = await this.findOne(id);
    await this.bookingRepo.update(id, { status });
    const updated = await this.findOne(id);
    await this.mailService.sendBookingStatusUpdate(updated.user, updated);
    return updated;
  }
}
