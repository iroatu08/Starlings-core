"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const path_1 = require("path");
const pg_ssl_util_1 = require("../../config/pg-ssl.util");
dotenv.config({ path: (0, path_1.resolve)(__dirname, '../../../.env') });
const user_entity_1 = require("../../users/entities/user.entity");
const destination_entity_1 = require("../../destinations/entities/destination.entity");
const package_entity_1 = require("../../packages/entities/package.entity");
const gallery_entity_1 = require("../../gallery/entities/gallery.entity");
const destination_review_entity_1 = require("../../reviews/entities/destination-review.entity");
const cart_entity_1 = require("../../cart/entities/cart.entity");
const cart_item_entity_1 = require("../../cart/entities/cart-item.entity");
const booking_entity_1 = require("../../bookings/entities/booking.entity");
const booking_item_entity_1 = require("../../bookings/entities/booking-item.entity");
const booking_traveler_entity_1 = require("../../bookings/entities/booking-traveler.entity");
const payment_entity_1 = require("../../payments/entities/payment.entity");
const refund_request_entity_1 = require("../../payments/entities/refund-request.entity");
const DESTINATION_SEEDS = [
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
                type: package_entity_1.PackageType.VISA_PROCESSING,
                description: 'Priority visa processing and document support.',
                priceNgn: 60000,
                priceUsd: 75,
                isRemovable: false,
            },
            {
                name: 'Hotel Reservation',
                type: package_entity_1.PackageType.HOTEL_RESERVATION,
                description: '4-5 star accommodation booking with concierge support.',
                priceNgn: 180000,
                priceUsd: 220,
                isRemovable: true,
            },
            {
                name: 'Free Taxi at Destination',
                type: package_entity_1.PackageType.FREE_TAXI,
                description: 'City transfer package from airport to hotel.',
                priceNgn: 0,
                priceUsd: 0,
                isRemovable: false,
            },
            {
                name: 'Airport Transfer Plus',
                type: package_entity_1.PackageType.AIRPORT_TRANSFER,
                description: 'Luxury round-trip airport transfer add-on.',
                priceNgn: 40000,
                priceUsd: 50,
                isRemovable: true,
            },
            {
                name: 'Desert Fine Dining Experience',
                type: package_entity_1.PackageType.CUSTOM,
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
                type: package_entity_1.PackageType.VISA_PROCESSING,
                description: 'Assisted visa filing and priority handling.',
                priceNgn: 55000,
                priceUsd: 68,
                isRemovable: false,
            },
            {
                name: 'Hotel Reservation',
                type: package_entity_1.PackageType.HOTEL_RESERVATION,
                description: 'Business-class hotel reservation package.',
                priceNgn: 150000,
                priceUsd: 185,
                isRemovable: true,
            },
            {
                name: 'Airport Transfer',
                type: package_entity_1.PackageType.AIRPORT_TRANSFER,
                description: 'Dedicated sedan transfer from and to airport.',
                priceNgn: 35000,
                priceUsd: 43,
                isRemovable: true,
            },
            {
                name: 'Private Museum Tour',
                type: package_entity_1.PackageType.CUSTOM,
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
const AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    synchronize: true,
    ssl: (0, pg_ssl_util_1.resolvePostgresSsl)({
        databaseUrl: process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV,
        dbSsl: process.env.DB_SSL,
    }),
    entities: [
        user_entity_1.User,
        destination_entity_1.Destination,
        package_entity_1.Package,
        gallery_entity_1.GalleryImage,
        destination_review_entity_1.DestinationReview,
        cart_entity_1.Cart,
        cart_item_entity_1.CartItem,
        booking_entity_1.Booking,
        booking_item_entity_1.BookingItem,
        booking_traveler_entity_1.BookingTraveler,
        payment_entity_1.Payment,
        refund_request_entity_1.RefundRequest,
    ],
});
async function seed() {
    try {
        await AppDataSource.initialize();
        console.log('✅ Database connected');
        const userRepo = AppDataSource.getRepository(user_entity_1.User);
        const destRepo = AppDataSource.getRepository(destination_entity_1.Destination);
        const pkgRepo = AppDataSource.getRepository(package_entity_1.Package);
        const galleryRepo = AppDataSource.getRepository(gallery_entity_1.GalleryImage);
        const reviewRepo = AppDataSource.getRepository(destination_review_entity_1.DestinationReview);
        const paymentRepo = AppDataSource.getRepository(payment_entity_1.Payment);
        const bookingItemRepo = AppDataSource.getRepository(booking_item_entity_1.BookingItem);
        const bookingRepo = AppDataSource.getRepository(booking_entity_1.Booking);
        const cartItemRepo = AppDataSource.getRepository(cart_item_entity_1.CartItem);
        const cartRepo = AppDataSource.getRepository(cart_entity_1.Cart);
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
        const adminExists = await userRepo.findOne({ where: { email: 'admin@starlings.com' } });
        if (!adminExists) {
            const admin = userRepo.create({
                email: 'admin@starlings.com',
                passwordHash: await bcrypt.hash('Admin1234!', 12),
                firstName: 'Super',
                lastName: 'Admin',
                role: user_entity_1.UserRole.ADMIN,
                isVerified: true,
                isActive: true,
            });
            await userRepo.save(admin);
            console.log('✅ Admin user created: admin@starlings.com / Admin1234!');
        }
        const demoExists = await userRepo.findOne({ where: { email: 'demo@starlings.com' } });
        if (!demoExists) {
            const demo = userRepo.create({
                email: 'demo@starlings.com',
                passwordHash: await bcrypt.hash('Demo1234!', 12),
                firstName: 'Demo',
                lastName: 'User',
                role: user_entity_1.UserRole.USER,
                isVerified: true,
                isActive: true,
            });
            await userRepo.save(demo);
            console.log('✅ Demo user created: demo@starlings.com / Demo1234!');
        }
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
                includesVisa: pkg.type === package_entity_1.PackageType.VISA_PROCESSING,
                includesFlight: false,
                includesHotel: pkg.type === package_entity_1.PackageType.HOTEL_RESERVATION,
                includesActivities: pkg.type === package_entity_1.PackageType.CUSTOM,
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
            const reviewRows = [
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
    }
    catch (err) {
        console.error('❌ Seed failed:', err);
    }
    finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    }
}
seed();
//# sourceMappingURL=seed.js.map