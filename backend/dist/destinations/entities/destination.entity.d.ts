import { Package } from '../../packages/entities/package.entity';
import { GalleryImage } from '../../gallery/entities/gallery.entity';
export declare class Destination {
    id: string;
    name: string;
    country: string;
    description: string;
    heroImageUrl: string;
    priceFromNgn: number;
    priceFromUsd: number;
    isFeatured: boolean;
    packages: Package[];
    galleryImages: GalleryImage[];
    createdAt: Date;
}
