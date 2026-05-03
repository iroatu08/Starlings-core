import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Destination } from './entities/destination.entity';
import { CreateDestinationDto } from './dto/create-destination.dto';
import { UpdateDestinationDto } from './dto/update-destination.dto';
import { Package } from '../packages/entities/package.entity';
import { BookingItem } from '../bookings/entities/booking-item.entity';
import { BookingStatus } from '../bookings/entities/booking.entity';
import { CreatePackageDto } from '../packages/dto/create-package.dto';

@Injectable()
export class DestinationsService {
  constructor(
    @InjectRepository(Destination) private repo: Repository<Destination>,
    @InjectRepository(Package) private packageRepo: Repository<Package>,
    @InjectRepository(BookingItem) private bookingItemRepo: Repository<BookingItem>,
  ) {}

  // find all destinations
  findAll(filters: { country?: string; featured?: boolean; minPriceNgn?: number; maxPriceNgn?: number } = {}) {
    const qb = this.repo.createQueryBuilder('dest').leftJoinAndSelect('dest.packages', 'packages');
    qb.andWhere('dest.isActive = :isActive', { isActive: true });
    if (filters.country) qb.andWhere('dest.country = :country', { country: filters.country });
    if (filters.featured !== undefined) qb.andWhere('dest.isFeatured = :featured', { featured: filters.featured });
    if (filters.minPriceNgn !== undefined) qb.andWhere('dest.priceFromNgn >= :minPriceNgn', { minPriceNgn: filters.minPriceNgn });
    if (filters.maxPriceNgn !== undefined) qb.andWhere('dest.priceFromNgn <= :maxPriceNgn', { maxPriceNgn: filters.maxPriceNgn });
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
      .getRawMany<{ destinationId: string; bookingCount: string }>();
    const countMap = new Map(counts.map((row) => [row.destinationId, Number(row.bookingCount)]));
    return destinations.map((destination) => ({
      ...destination,
      bookingCount: countMap.get(destination.id) ?? 0,
    }));
  }

  // find one destination by id
  async findOne(id: string, options: { includeInactive?: boolean } = {}) {
    const dest = await this.repo.findOne({
      where: { id },
      relations: ['packages', 'galleryImages'],
    });
    if (!dest || (!options.includeInactive && !dest.isActive)) throw new NotFoundException('Destination not found');
    const totalPriceNgn = dest.packages.reduce((sum, pkg) => sum + Number(pkg.priceNgn), 0);
    const totalPriceUsd = dest.packages.reduce((sum, pkg) => sum + Number(pkg.priceUsd), 0);
    return { ...dest, totalPriceNgn, totalPriceUsd };
  }

  async findOneAdmin(id: string) {
    const destination = await this.findOne(id, { includeInactive: true });
    const bookings = await this.bookingItemRepo.find({
      where: { destinationId: id },
      relations: ['booking', 'booking.user'],
      order: { booking: { createdAt: 'DESC' } },
    });
    return { ...destination, bookings };
  }

  // create a destination
  async create(dto: CreateDestinationDto) {
    return this.repo.manager.transaction(async (manager) => {
      const destinationRepo = manager.getRepository(Destination);
      const packageRepo = manager.getRepository(Package);
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

      const packages = dto.packages.map((pkgDto: CreatePackageDto) =>
        packageRepo.create({
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
        }),
      );
      await packageRepo.save(packages);
      return destinationRepo.findOne({ where: { id: createdDestination.id }, relations: ['packages', 'galleryImages'] });
    });
  }

  // update a destination
  async update(id: string, dto: UpdateDestinationDto) {
    await this.findOne(id, { includeInactive: true });
    await this.repo.update(id, dto);
    return this.findOne(id, { includeInactive: true });
  }

  // delete a destination
  async remove(id: string) {
    await this.findOne(id, { includeInactive: true });
    await this.repo.update(id, { isActive: false });
    return { message: 'Destination deactivated' };
  }

  async addPackage(id: string, dto: CreatePackageDto) {
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

  async updatePackage(destinationId: string, packageId: string, dto: Partial<CreatePackageDto>) {
    await this.findOne(destinationId, { includeInactive: true });
    const pkg = await this.packageRepo.findOne({ where: { id: packageId, destinationId } });
    if (!pkg) throw new NotFoundException('Package not found');
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

  async removePackage(destinationId: string, packageId: string) {
    await this.findOne(destinationId, { includeInactive: true });
    const pkg = await this.packageRepo.findOne({ where: { id: packageId, destinationId } });
    if (!pkg) throw new NotFoundException('Package not found');

    const bookingItems = await this.bookingItemRepo.find({
      where: { destinationId, booking: { status: In([BookingStatus.CONFIRMED, BookingStatus.COMPLETED]) } },
      relations: ['booking'],
    });

    const usedByConfirmedBooking = bookingItems.some((item) => {
      if (item.packageId === packageId) return true;
      const snapshot = item.bundleSnapshot;
      if (!snapshot) return false;
      const inKept = snapshot.keptPackageIds?.includes(packageId);
      const inSnapshot = snapshot.packagesSnapshot?.some((entry) => entry.id === packageId);
      return Boolean(inKept || inSnapshot);
    });
    if (usedByConfirmedBooking) {
      throw new ConflictException('Cannot remove package because confirmed bookings include this package');
    }

    await this.packageRepo.delete(packageId);
    return { message: 'Package deleted' };
  }
}
