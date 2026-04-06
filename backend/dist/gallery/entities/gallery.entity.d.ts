import { Destination } from '../../destinations/entities/destination.entity';
export declare class GalleryImage {
    id: string;
    destinationId: string;
    destination: Destination;
    cloudinaryPublicId: string;
    url: string;
    altText: string;
    width: number;
    height: number;
    isFeatured: boolean;
    createdAt: Date;
}
