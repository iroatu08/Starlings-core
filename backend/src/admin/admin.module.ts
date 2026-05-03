import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UsersModule } from '../users/users.module';
import { BookingsModule } from '../bookings/bookings.module';
import { PaymentsModule } from '../payments/payments.module';
import { DestinationsModule } from '../destinations/destinations.module';
import { PackagesModule } from '../packages/packages.module';
import { GalleryModule } from '../gallery/gallery.module';
import { ContactModule } from '../contact/contact.module';
import { MailModule } from '../mail/mail.module';
import { Booking } from '../bookings/entities/booking.entity';
import { Payment } from '../payments/entities/payment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, Payment]),
    UsersModule,
    BookingsModule,
    PaymentsModule,
    DestinationsModule,
    PackagesModule,
    GalleryModule,
    ContactModule,
    MailModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
