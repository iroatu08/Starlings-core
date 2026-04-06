import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { Destination } from '../destinations/entities/destination.entity';
import { Package } from '../packages/entities/package.entity';
import { Cart } from '../cart/entities/cart.entity';
import { CartItem } from '../cart/entities/cart-item.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { BookingItem } from '../bookings/entities/booking-item.entity';
import { Payment } from '../payments/entities/payment.entity';
import { GalleryImage } from '../gallery/entities/gallery.entity';
import { ContactSubmission } from '../contact/entities/contact-submission.entity';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  url: configService.get<string>('DATABASE_URL'),
  entities: [
    User,
    Destination,
    Package,
    Cart,
    CartItem,
    Booking,
    BookingItem,
    Payment,
    GalleryImage,
    ContactSubmission,
  ],
  synchronize: configService.get<string>('NODE_ENV') === 'development',
  logging: configService.get<string>('NODE_ENV') === 'development',
  ssl: configService.get<string>('NODE_ENV') === 'production'
    ? { rejectUnauthorized: false }
    : false,
});
