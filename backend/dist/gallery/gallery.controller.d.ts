import { GalleryService } from './gallery.service';
export declare class GalleryController {
    private readonly galleryService;
    constructor(galleryService: GalleryService);
    findAll(destinationId?: string, page?: number, limit?: number): Promise<{
        data: import("./entities/gallery.entity").GalleryImage[];
        page: number;
        limit: number;
        hasMore: boolean;
    }>;
}
