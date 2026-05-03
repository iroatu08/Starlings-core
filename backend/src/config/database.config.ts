import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { Destination } from '../destinations/entities/destination.entity';
import { Package } from '../packages/entities/package.entity';
import { Cart } from '../cart/entities/cart.entity';
import { CartItem } from '../cart/entities/cart-item.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { BookingItem } from '../bookings/entities/booking-item.entity';
import { BookingTraveler } from '../bookings/entities/booking-traveler.entity';
import { Payment } from '../payments/entities/payment.entity';
import { RefundRequest } from '../payments/entities/refund-request.entity';
import { GalleryImage } from '../gallery/entities/gallery.entity';
import { ContactSubmission } from '../contact/entities/contact-submission.entity';
import { NewsletterSubscriber } from '../newsletter/entities/newsletter-subscriber.entity';
import { DestinationReview } from '../reviews/entities/destination-review.entity';

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
    BookingTraveler,
    Payment,
    RefundRequest,
    GalleryImage,
    ContactSubmission,
    NewsletterSubscriber,
    DestinationReview,
  ],
  synchronize: configService.get<string>('NODE_ENV') === 'development',
  logging: configService.get<string>('NODE_ENV') === 'development',
  ssl: configService.get<string>('NODE_ENV') === 'production'
    ? { rejectUnauthorized: false }
    : false,
});
