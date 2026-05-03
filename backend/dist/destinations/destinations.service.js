"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DestinationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const destination_entity_1 = require("./entities/destination.entity");
const package_entity_1 = require("../packages/entities/package.entity");
const booking_item_entity_1 = require("../bookings/entities/booking-item.entity");
const booking_entity_1 = require("../bookings/entities/booking.entity");
let DestinationsService = class DestinationsService {
    constructor(repo, packageRepo, bookingItemRepo) {
        this.repo = repo;
        this.packageRepo = packageRepo;
        this.bookingItemRepo = bookingItemRepo;
    }
    findAll(filters = {}) {
        const qb = this.repo.createQueryBuilder('dest').leftJoinAndSelect('dest.packages', 'packages');
        qb.andWhere('dest.isActive = :isActive', { isActive: true });
        if (filters.country)
            qb.andWhere('dest.country = :country', { country: filters.country });
        if (filters.featured !== undefined)
            qb.andWhere('dest.isFeatured = :featured', { featured: filters.featured });
        if (filters.minPriceNgn !== undefined)
            qb.andWhere('dest.priceFromNgn >= :minPriceNgn', { minPriceNgn: filters.minPriceNgn });
        if (filters.maxPriceNgn !== undefined)
            qb.andWhere('dest.priceFromNgn <= :maxPriceNgn', { maxPriceNgn: filters.maxPriceNgn });
        return qb.orderBy('dest.createdAt', 'DESC').getMany();
    }
    async findAllAdmin() {
        const destinations = await this.repo.find({ relations: ['packages'], order: { createdAt: 'DESC' } });
        const counts = await this.bookingItemRepo
            .createQueryBuilder('item')
            .select('item.destinationId', 'destinationId')
            .addSelect('COUNT(DISTINCT item.bookingId)', 'bookingCount')
            .where('item.destinationId IS NOT NULL')
            .groupBy('item.destinationId')
            .getRawMany();
        const countMap = new Map(counts.map((row) => [row.destinationId, Number(row.bookingCount)]));
        return destinations.map((destination) => ({
            ...destination,
            bookingCount: countMap.get(destination.id) ?? 0,
        }));
    }
    async findOne(id, options = {}) {
        const dest = await this.repo.findOne({
            where: { id },
            relations: ['packages', 'galleryImages'],
        });
        if (!dest || (!options.includeInactive && !dest.isActive))
            throw new common_1.NotFoundException('Destination not found');
        const totalPriceNgn = dest.packages.reduce((sum, pkg) => sum + Number(pkg.priceNgn), 0);
        const totalPriceUsd = dest.packages.reduce((sum, pkg) => sum + Number(pkg.priceUsd), 0);
        return { ...dest, totalPriceNgn, totalPriceUsd };
    }
    async findOneAdmin(id) {
        const destination = await this.findOne(id, { includeInactive: true });
        const bookings = await this.bookingItemRepo.find({
            where: { destinationId: id },
            relations: ['booking', 'booking.user'],
            order: { booking: { createdAt: 'DESC' } },
        });
        return { ...destination, bookings };
    }
    async create(dto) {
        return this.repo.manager.transaction(async (manager) => {
            const destinationRepo = manager.getRepository(destination_entity_1.Destination);
            const packageRepo = manager.getRepository(package_entity_1.Package);
            const destination = destinationRepo.create({
                name: dto.name,
                country: dto.country,
                description: dto.description,
                heroImageUrl: dto.heroImageUrl,
                priceFromNgn: dto.priceFromNgn,
                priceFromUsd: dto.priceFromUsd,
                isFeatured: dto.isFeatured ?? false,
                isActive: true,
                latitude: dto.latitude,
                longitude: dto.longitude,
            });
            const createdDestination = await destinationRepo.save(destination);
            const packages = dto.packages.map((pkgDto) => packageRepo.create({
                destinationId: createdDestination.id,
                title: pkgDto.name,
                packageType: pkgDto.type,
                description: pkgDto.description,
                isRemovable: pkgDto.isRemovable ?? true,
                includesVisa: pkgDto.includesVisa ?? false,
                includesFlight: pkgDto.includesFlight ?? false,
                includesHotel: pkgDto.includesHotel ?? false,
                includesActivities: pkgDto.includesActivities ?? false,
                priceNgn: pkgDto.priceNgn,
                priceUsd: pkgDto.priceUsd,
                durationDays: pkgDto.durationDays ?? 1,
                maxCapacity: pkgDto.maxCapacity ?? 20,
            }));
            await packageRepo.save(packages);
            return destinationRepo.findOne({ where: { id: createdDestination.id }, relations: ['packages', 'galleryImages'] });
        });
    }
    async update(id, dto) {
        await this.findOne(id, { includeInactive: true });
        await this.repo.update(id, dto);
        return this.findOne(id, { includeInactive: true });
    }
    async remove(id) {
        await this.findOne(id, { includeInactive: true });
        await this.repo.update(id, { isActive: false });
        return { message: 'Destination deactivated' };
    }
    async addPackage(id, dto) {
        await this.findOne(id, { includeInactive: true });
        const pkg = this.packageRepo.create({
            destinationId: id,
            title: dto.name,
            packageType: dto.type,
            description: dto.description,
            isRemovable: dto.isRemovable ?? true,
            includesVisa: dto.includesVisa ?? false,
            includesFlight: dto.includesFlight ?? false,
            includesHotel: dto.includesHotel ?? false,
            includesActivities: dto.includesActivities ?? false,
            priceNgn: dto.priceNgn,
            priceUsd: dto.priceUsd,
            durationDays: dto.durationDays ?? 1,
            maxCapacity: dto.maxCapacity ?? 20,
        });
        return this.packageRepo.save(pkg);
    }
    async updatePackage(destinationId, packageId, dto) {
        await this.findOne(destinationId, { includeInactive: true });
        const pkg = await this.packageRepo.findOne({ where: { id: packageId, destinationId } });
        if (!pkg)
            throw new common_1.NotFoundException('Package not found');
        await this.packageRepo.update(packageId, {
            title: dto.name,
            packageType: dto.type,
            description: dto.description,
            isRemovable: dto.isRemovable,
            priceNgn: dto.priceNgn,
            priceUsd: dto.priceUsd,
            includesVisa: dto.includesVisa,
            includesFlight: dto.includesFlight,
            includesHotel: dto.includesHotel,
            includesActivities: dto.includesActivities,
            durationDays: dto.durationDays,
            maxCapacity: dto.maxCapacity,
        });
        return this.packageRepo.findOne({ where: { id: packageId } });
    }
    async removePackage(destinationId, packageId) {
        await this.findOne(destinationId, { includeInactive: true });
        const pkg = await this.packageRepo.findOne({ where: { id: packageId, destinationId } });
        if (!pkg)
            throw new common_1.NotFoundException('Package not found');
        const bookingItems = await this.bookingItemRepo.find({
            where: { destinationId, booking: { status: (0, typeorm_2.In)([booking_entity_1.BookingStatus.CONFIRMED, booking_entity_1.BookingStatus.COMPLETED]) } },
            relations: ['booking'],
        });
        const usedByConfirmedBooking = bookingItems.some((item) => {
            if (item.packageId === packageId)
                return true;
            const snapshot = item.bundleSnapshot;
            if (!snapshot)
                return false;
            const inKept = snapshot.keptPackageIds?.includes(packageId);
            const inSnapshot = snapshot.packagesSnapshot?.some((entry) => entry.id === packageId);
            return Boolean(inKept || inSnapshot);
        });
        if (usedByConfirmedBooking) {
            throw new common_1.ConflictException('Cannot remove package because confirmed bookings include this package');
        }
        await this.packageRepo.delete(packageId);
        return { message: 'Package deleted' };
    }
};
exports.DestinationsService = DestinationsService;
exports.DestinationsService = DestinationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(destination_entity_1.Destination)),
    __param(1, (0, typeorm_1.InjectRepository)(package_entity_1.Package)),
    __param(2, (0, typeorm_1.InjectRepository)(booking_item_entity_1.BookingItem)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], DestinationsService);
//# sourceMappingURL=destinations.service.js.map