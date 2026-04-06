import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { UsersModule } from '../users/users.module';
import { BookingsModule } from '../bookings/bookings.module';
import { PaymentsModule } from '../payments/payments.module';
import { DestinationsModule } from '../destinations/destinations.module';
import { PackagesModule } from '../packages/packages.module';
import { GalleryModule } from '../gallery/gallery.module';
import { ContactModule } from '../contact/contact.module';

@Module({
  imports: [
    UsersModule,
    BookingsModule,
    PaymentsModule,
    DestinationsModule,
    PackagesModule,
    GalleryModule,
    ContactModule,
  ],
  controllers: [AdminController],
})
export class AdminModule {}
