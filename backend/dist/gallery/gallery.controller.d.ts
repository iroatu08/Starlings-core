import { GalleryService } from './gallery.service';
export declare class GalleryController {
    private readonly galleryService;
    constructor(galleryService: GalleryService);
    findAll(destinationId?: string): Promise<import("./entities/gallery.entity").GalleryImage[]>;
}
