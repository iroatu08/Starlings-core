import { DestinationsService } from './destinations.service';
export declare class DestinationsController {
    private readonly destinationsService;
    constructor(destinationsService: DestinationsService);
    findAll(country?: string, featured?: string, minPriceNgn?: string, maxPriceNgn?: string): Promise<import("./entities/destination.entity").Destination[]>;
    findOne(id: string): Promise<{
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
        packages: import("../packages/entities/package.entity").Package[];
        galleryImages: import("../gallery/entities/gallery.entity").GalleryImage[];
        createdAt: Date;
    }>;
}
