import { Repository } from 'typeorm';
import { Destination } from './entities/destination.entity';
import { CreateDestinationDto } from './dto/create-destination.dto';
import { UpdateDestinationDto } from './dto/update-destination.dto';
import { Package } from '../packages/entities/package.entity';
import { BookingItem } from '../bookings/entities/booking-item.entity';
import { CreatePackageDto } from '../packages/dto/create-package.dto';
export declare class DestinationsService {
    private repo;
    private packageRepo;
    private bookingItemRepo;
    constructor(repo: Repository<Destination>, packageRepo: Repository<Package>, bookingItemRepo: Repository<BookingItem>);
    findAll(filters?: {
        country?: string;
        featured?: boolean;
        minPriceNgn?: number;
        maxPriceNgn?: number;
    }): Promise<Destination[]>;
    findAllAdmin(): Promise<{
        bookingCount: number;
        id: string;
        name: string;
        country: string;
        description: string;
        heroImageUrl: string;
        priceFromNgn: number;
        priceFromUsd: number;
        isFeatured: boolean;
        isActive: boolean;
        latitude: number | null;
        longitude: number | null;
        packages: Package[];
        galleryImages: import("../gallery/entities/gallery.entity").GalleryImage[];
        createdAt: Date;
    }[]>;
    findOne(id: string, options?: {
        includeInactive?: boolean;
    }): Promise<{
        totalPriceNgn: number;
        totalPriceUsd: number;
        id: string;
        name: string;
        country: string;
        description: string;
        heroImageUrl: string;
        priceFromNgn: number;
        priceFromUsd: number;
        isFeatured: boolean;
        isActive: boolean;
        latitude: number | null;
        longitude: number | null;
        packages: Package[];
        galleryImages: import("../gallery/entities/gallery.entity").GalleryImage[];
        createdAt: Date;
    }>;
    findOneAdmin(id: string): Promise<{
        bookings: BookingItem[];
        totalPriceNgn: number;
        totalPriceUsd: number;
        id: string;
        name: string;
        country: string;
        description: string;
        heroImageUrl: string;
        priceFromNgn: number;
        priceFromUsd: number;
        isFeatured: boolean;
        isActive: boolean;
        latitude: number | null;
        longitude: number | null;
        packages: Package[];
        galleryImages: import("../gallery/entities/gallery.entity").GalleryImage[];
        createdAt: Date;
    }>;
    create(dto: CreateDestinationDto): Promise<Destination>;
    update(id: string, dto: UpdateDestinationDto): Promise<{
        totalPriceNgn: number;
        totalPriceUsd: number;
        id: string;
        name: string;
        country: string;
        description: string;
        heroImageUrl: string;
        priceFromNgn: number;
        priceFromUsd: number;
        isFeatured: boolean;
        isActive: boolean;
        latitude: number | null;
        longitude: number | null;
        packages: Package[];
        galleryImages: import("../gallery/entities/gallery.entity").GalleryImage[];
        createdAt: Date;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    addPackage(id: string, dto: CreatePackageDto): Promise<Package>;
    updatePackage(destinationId: string, packageId: string, dto: Partial<CreatePackageDto>): Promise<Package>;
    removePackage(destinationId: string, packageId: string): Promise<{
        message: string;
    }>;
}
