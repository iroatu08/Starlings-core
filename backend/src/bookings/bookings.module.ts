import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { Booking } from './entities/booking.entity';
import { BookingItem } from './entities/booking-item.entity';
import { BookingTraveler } from './entities/booking-traveler.entity';
import { Payment } from '../payments/entities/payment.entity';
import { RefundRequest } from '../payments/entities/refund-request.entity';
import { CartModule } from '../cart/cart.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, BookingItem, BookingTraveler, Payment, RefundRequest]), CartModule, MailModule],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
