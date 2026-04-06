import 'reflect-metadata';
import { config } from 'dotenv';
import { resolve, join } from 'path';
import { DataSource } from 'typeorm';
import { User } from './users/entities/user.entity';
import { Destination } from './destinations/entities/destination.entity';
import { Package } from './packages/entities/package.entity';
import { Cart } from './cart/entities/cart.entity';
import { CartItem } from './cart/entities/cart-item.entity';
import { Booking } from './bookings/entities/booking.entity';
import { BookingItem } from './bookings/entities/booking-item.entity';
import { Payment } from './payments/entities/payment.entity';
import { GalleryImage } from './gallery/entities/gallery.entity';
import { ContactSubmission } from './contact/entities/contact-submission.entity';

config({ path: resolve(__dirname, '../.env') });

const migrationExtension = __filename.endsWith('.ts') ? 'ts' : 'js';

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
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
  migrations: [join(__dirname, 'database', 'migrations', `*.${migrationExtension}`)],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
});

export default AppDataSource;
