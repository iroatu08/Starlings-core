"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
const path_1 = require("path");
dotenv.config({ path: (0, path_1.resolve)(__dirname, '../../../.env') });
const user_entity_1 = require("../../users/entities/user.entity");
const destination_entity_1 = require("../../destinations/entities/destination.entity");
const package_entity_1 = require("../../packages/entities/package.entity");
const gallery_entity_1 = require("../../gallery/entities/gallery.entity");
const constants_1 = require("../../constants");
const AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    synchronize: true,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    entities: [user_entity_1.User, destination_entity_1.Destination, package_entity_1.Package, gallery_entity_1.GalleryImage],
});
async function seed() {
    try {
        await AppDataSource.initialize();
        console.log('✅ Database connected');
        const userRepo = AppDataSource.getRepository(user_entity_1.User);
        const destRepo = AppDataSource.getRepository(destination_entity_1.Destination);
        const pkgRepo = AppDataSource.getRepository(package_entity_1.Package);
        const galleryRepo = AppDataSource.getRepository(gallery_entity_1.GalleryImage);
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
        for (const destData of constants_1.DESTINATIONS) {
            const { galleryImages: seedGalleryImages, ...destFields } = destData;
            let dest = await destRepo.findOne({ where: { name: destData.name } });
            if (!dest) {
                dest = destRepo.create(destFields);
                await destRepo.save(dest);
                console.log(`✅ Destination created: ${dest.name}`);
            }
            const pkgCount = await pkgRepo.count({ where: { destinationId: dest.id } });
            if (pkgCount === 0) {
                await pkgRepo.save([
                    {
                        destinationId: dest.id,
                        title: `${dest.name} Explorer Package`,
                        description: `A comprehensive 7-day tour of ${dest.country} covering major sights, cultural experiences, and local cuisine.`,
                        includesVisa: true,
                        includesFlight: true,
                        includesHotel: true,
                        includesActivities: false,
                        priceNgn: destData.priceFromNgn,
                        priceUsd: destData.priceFromUsd,
                        durationDays: 7,
                        maxCapacity: 20,
                    },
                    {
                        destinationId: dest.id,
                        title: `${dest.name} Premium All-Inclusive`,
                        description: `Our premium 14-day all-inclusive experience in ${dest.country} — visa, flights, 5-star hotels, and curated activities.`,
                        includesVisa: true,
                        includesFlight: true,
                        includesHotel: true,
                        includesActivities: true,
                        priceNgn: Math.round(destData.priceFromNgn * 1.75),
                        priceUsd: Math.round(destData.priceFromUsd * 1.75),
                        durationDays: 14,
                        maxCapacity: 12,
                    },
                ]);
                console.log(`  ↳ 2 packages created for ${dest.name}`);
            }
            const existingGallery = await galleryRepo.find({ where: { destinationId: dest.id } });
            const hasBrokenUrls = existingGallery.some((img) => img.url?.includes('source.unsplash.com'));
            const shouldSeedGallery = seedGalleryImages?.length &&
                (existingGallery.length === 0 || hasBrokenUrls);
            if (shouldSeedGallery) {
                if (existingGallery.length > 0) {
                    await galleryRepo.delete({ destinationId: dest.id });
                }
                for (let i = 0; i < seedGalleryImages.length; i++) {
                    const g = seedGalleryImages[i];
                    await galleryRepo.save({
                        destinationId: dest.id,
                        cloudinaryPublicId: `seed/${dest.id.slice(0, 8)}-${i}`,
                        url: g.url,
                        altText: g.altText || `${dest.name} — photo ${i + 1}`,
                        width: g.width ?? 800,
                        height: g.height ?? 600,
                        isFeatured: i === 0,
                    });
                }
                console.log(`  ↳ ${seedGalleryImages.length} gallery images saved for ${dest.name}`);
            }
        }
        console.log('\n🎉 Seed complete!');
        console.log('Admin: admin@starlings.com / Admin1234!');
        console.log('Demo:  demo@starlings.com  / Demo1234!');
    }
    catch (err) {
        console.error('❌ Seed failed:', err);
    }
    finally {
        await AppDataSource.destroy();
    }
}
seed();
//# sourceMappingURL=seed.js.map