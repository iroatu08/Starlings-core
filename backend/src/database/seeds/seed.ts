import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

import { resolvePostgresSsl } from '../../config/pg-ssl.util';

dotenv.config({ path: resolve(__dirname, '../../../.env') });

import { User, UserRole } from '../../users/entities/user.entity';
import { Destination } from '../../destinations/entities/destination.entity';
import { Package, PackageType } from '../../packages/entities/package.entity';
import { GalleryImage } from '../../gallery/entities/gallery.entity';
import { DestinationReview } from '../../reviews/entities/destination-review.entity';
import { Cart } from '../../cart/entities/cart.entity';
import { CartItem } from '../../cart/entities/cart-item.entity';
import { Booking } from '../../bookings/entities/booking.entity';
import { BookingItem } from '../../bookings/entities/booking-item.entity';
import { BookingTraveler } from '../../bookings/entities/booking-traveler.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { RefundRequest } from '../../payments/entities/refund-request.entity';
import { EXPERIENCE_DESTINATION_SEEDS } from './experience-seeds';

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: true,
  ssl: resolvePostgresSsl({
    databaseUrl: process.env.DATABASE_URL,
    nodeEnv: process.env.NODE_ENV,
    dbSsl: process.env.DB_SSL,
  }),
  entities: [
    User,
    Destination,
    Package,
    GalleryImage,
    DestinationReview,
    Cart,
    CartItem,
    Booking,
    BookingItem,
    BookingTraveler,
    Payment,
    RefundRequest,
  ],
});


async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    const userRepo = AppDataSource.getRepository(User);
    const destRepo = AppDataSource.getRepository(Destination);
    const pkgRepo = AppDataSource.getRepository(Package);
    const reviewRepo = AppDataSource.getRepository(DestinationReview);
    const paymentRepo = AppDataSource.getRepository(Payment);
    const bookingItemRepo = AppDataSource.getRepository(BookingItem);
    const bookingRepo = AppDataSource.getRepository(Booking);
    const cartItemRepo = AppDataSource.getRepository(CartItem);
    const cartRepo = AppDataSource.getRepository(Cart);

    // ── Clear existing transactional/content data ───────────────────────────
    await AppDataSource.query(`
      TRUNCATE TABLE
        "payments",
        "refund_requests",
        "booking_travelers",
        "booking_items",
        "bookings",
        "cart_items",
        "carts",
        "destination_reviews",
        "gallery",
        "packages",
        "destinations"
      RESTART IDENTITY CASCADE
    `);
    console.log('✅ Existing destination/cart/booking data cleared');

    // ── Create admin user ──────────────────────────────────
    const adminExists = await userRepo.findOne({ where: { email: 'admin@starlings.com' } });
    if (!adminExists) {
      const admin = userRepo.create({
        email: 'admin@starlings.com',
        passwordHash: await bcrypt.hash('Admin1234!', 12),
        firstName: 'Super',
        lastName: 'Admin',
        role: UserRole.ADMIN,
        isVerified: true,
        isActive: true,
      });
      await userRepo.save(admin);
      console.log('✅ Admin user created: admin@starlings.com / Admin1234!');
    }

    // ── Create demo user ────────────────────────────────────
    const demoExists = await userRepo.findOne({ where: { email: 'demo@starlings.com' } });
    if (!demoExists) {
      const demo = userRepo.create({
        email: 'demo@starlings.com',
        passwordHash: await bcrypt.hash('Demo1234!', 12),
        firstName: 'Demo',
        lastName: 'User',
        role: UserRole.USER,
        isVerified: true,
        isActive: true,
      });
      await userRepo.save(demo);
      console.log('✅ Demo user created: demo@starlings.com / Demo1234!');
    }

    // ── Create destinations with new package model ─────────────────────────
    for (const seedDestination of EXPERIENCE_DESTINATION_SEEDS) {
      const destination = destRepo.create({
        name: seedDestination.name,
        country: seedDestination.country,
        description: seedDestination.description,
        heroImageUrl: seedDestination.heroImageUrl,
        priceFromNgn: seedDestination.priceFromNgn,
        priceFromUsd: seedDestination.priceFromUsd,
        isFeatured: seedDestination.isFeatured,
        isActive: true,
        latitude: seedDestination.latitude,
        longitude: seedDestination.longitude,
      });
      await destRepo.save(destination);
      console.log(`✅ Destination created: ${destination.name}`);

      const packageRows = seedDestination.packages.map((pkg) => pkgRepo.create({
        destinationId: destination.id,
        title: pkg.name,
        packageType: pkg.type,
        description: pkg.description,
        priceNgn: pkg.priceNgn,
        priceUsd: pkg.priceUsd,
        isRemovable: pkg.isRemovable,
        includesVisa: pkg.type === PackageType.VISA_PROCESSING,
        includesFlight: false,
        includesHotel: pkg.type === PackageType.HOTEL_RESERVATION,
        includesActivities: pkg.type === PackageType.CUSTOM,
        durationDays: 1,
        maxCapacity: 1,
      }));
      await pkgRepo.save(packageRows);
      console.log(`  ↳ ${packageRows.length} packages seeded`);

      console.log('  ↳ Gallery images: upload via Admin Gallery (Cloudinary)');

      const reviewRows = seedDestination.reviews.map((review) => ({
        authorName: review.authorName,
        rating: review.rating,
        body: review.body,
        userId: null as string | null,
      }));
      for (const review of reviewRows) {
        await reviewRepo.save({
          destinationId: destination.id,
          userId: review.userId ?? null,
          authorName: review.authorName,
          rating: review.rating,
          body: review.body,
        });
      }
      console.log(`  ↳ ${reviewRows.length} reviews seeded`);
    }

    console.log('\n🎉 Seed complete!');
    console.log('Admin: admin@starlings.com / Admin1234!');
    console.log('Demo:  demo@starlings.com  / Demo1234!');
  } catch (err) {
    console.error('❌ Seed failed:', err);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

seed();
