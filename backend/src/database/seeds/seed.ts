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

interface SeedPackage {
  name: string;
  type: PackageType;
  description: string;
  priceNgn: number;
  priceUsd: number;
  isRemovable: boolean;
}

interface SeedDestination {
  name: string;
  country: string;
  description: string;
  heroImageUrl: string;
  priceFromNgn: number;
  priceFromUsd: number;
  isFeatured: boolean;
  latitude: number;
  longitude: number;
  packages: SeedPackage[];
  galleryImages: Array<{ url: string; altText: string }>;
}

const DESTINATION_SEEDS: SeedDestination[] = [
  {
    name: 'Dubai Signature Escape',
    country: 'UAE',
    description: 'A premium Dubai itinerary with curated hospitality services for luxury travelers.',
    heroImageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1400&q=80',
    priceFromNgn: 320000,
    priceFromUsd: 390,
    isFeatured: true,
    latitude: 25.2048,
    longitude: 55.2708,
    packages: [
      {
        name: 'Visa Processing',
        type: PackageType.VISA_PROCESSING,
        description: 'Priority visa processing and document support.',
        priceNgn: 60000,
        priceUsd: 75,
        isRemovable: false,
      },
      {
        name: 'Hotel Reservation',
        type: PackageType.HOTEL_RESERVATION,
        description: '4-5 star accommodation booking with concierge support.',
        priceNgn: 180000,
        priceUsd: 220,
        isRemovable: true,
      },
      {
        name: 'Free Taxi at Destination',
        type: PackageType.FREE_TAXI,
        description: 'City transfer package from airport to hotel.',
        priceNgn: 0,
        priceUsd: 0,
        isRemovable: false,
      },
      {
        name: 'Airport Transfer Plus',
        type: PackageType.AIRPORT_TRANSFER,
        description: 'Luxury round-trip airport transfer add-on.',
        priceNgn: 40000,
        priceUsd: 50,
        isRemovable: true,
      },
      {
        name: 'Desert Fine Dining Experience',
        type: PackageType.CUSTOM,
        description: 'Private evening safari with gourmet dining.',
        priceNgn: 120000,
        priceUsd: 145,
        isRemovable: true,
      },
    ],
    galleryImages: [
      { url: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1200&q=80', altText: 'Dubai skyline at dusk' },
      { url: 'https://images.unsplash.com/photo-1578922794704-7bdd46f70f5d?w=1200&q=80', altText: 'Dubai luxury resort pool' },
      { url: 'https://images.unsplash.com/photo-1546412414-8035e1776c9a?w=1200&q=80', altText: 'Desert luxury camp setup' },
    ],
  },
  {
    name: 'Abu Dhabi Prestige Journey',
    country: 'UAE',
    description: 'A refined Abu Dhabi experience balancing culture, comfort, and convenience.',
    heroImageUrl: 'https://images.unsplash.com/photo-1551041777-96e37b2c7ea4?w=1400&q=80',
    priceFromNgn: 280000,
    priceFromUsd: 340,
    isFeatured: false,
    latitude: 24.4539,
    longitude: 54.3773,
    packages: [
      {
        name: 'Visa Processing',
        type: PackageType.VISA_PROCESSING,
        description: 'Assisted visa filing and priority handling.',
        priceNgn: 55000,
        priceUsd: 68,
        isRemovable: false,
      },
      {
        name: 'Hotel Reservation',
        type: PackageType.HOTEL_RESERVATION,
        description: 'Business-class hotel reservation package.',
        priceNgn: 150000,
        priceUsd: 185,
        isRemovable: true,
      },
      {
        name: 'Airport Transfer',
        type: PackageType.AIRPORT_TRANSFER,
        description: 'Dedicated sedan transfer from and to airport.',
        priceNgn: 35000,
        priceUsd: 43,
        isRemovable: true,
      },
      {
        name: 'Private Museum Tour',
        type: PackageType.CUSTOM,
        description: 'Guided access to major cultural sites.',
        priceNgn: 90000,
        priceUsd: 110,
        isRemovable: true,
      },
    ],
    galleryImages: [
      { url: 'https://images.unsplash.com/photo-1580643909375-a07d2f5f4f15?w=1200&q=80', altText: 'Abu Dhabi grand mosque exterior' },
      { url: 'https://images.unsplash.com/photo-1601569198575-1f77f8fecefc?w=1200&q=80', altText: 'Luxury hotel lobby in Abu Dhabi' },
    ],
  },
];

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
    const galleryRepo = AppDataSource.getRepository(GalleryImage);
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
    const demoUser = await userRepo.findOne({ where: { email: 'demo@starlings.com' } });
    for (const seedDestination of DESTINATION_SEEDS) {
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

      for (let i = 0; i < seedDestination.galleryImages.length; i += 1) {
        const image = seedDestination.galleryImages[i];
        await galleryRepo.save({
          destinationId: destination.id,
          cloudinaryPublicId: `seed/${destination.id.slice(0, 8)}-${i}`,
          url: image.url,
          altText: image.altText,
          width: 1200,
          height: 800,
          isFeatured: i === 0,
        });
      }
      console.log(`  ↳ ${seedDestination.galleryImages.length} gallery images seeded`);

      const reviewRows: Array<{ authorName: string; rating: number; body: string; userId?: string | null }> = [
        {
          authorName: 'Amaka O.',
          rating: 5,
          body: `The ${seedDestination.name} plan was polished end-to-end and easy to customize.`,
          userId: null,
        },
        {
          authorName: 'James T.',
          rating: 4,
          body: `Loved that we could remove optional package items before checkout.`,
          userId: null,
        },
      ];
      if (demoUser) {
        reviewRows.push({
          authorName: 'Demo U.',
          rating: 5,
          body: `Great transparency on original vs customized pricing for ${seedDestination.name}.`,
          userId: demoUser.id,
        });
      }
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
