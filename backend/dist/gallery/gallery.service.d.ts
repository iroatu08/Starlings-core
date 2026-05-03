import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { GalleryImage } from './entities/gallery.entity';
import { UploadImageDto } from './dto/upload-image.dto';
export declare class GalleryService {
    private repo;
    private configService;
    constructor(repo: Repository<GalleryImage>, configService: ConfigService);
    findAll(destinationId?: string, page?: number, limit?: number): Promise<{
        data: GalleryImage[];
        page: number;
        limit: number;
        hasMore: boolean;
    }>;
    uploadImage(file: Express.Multer.File, dto: UploadImageDto): Promise<GalleryImage>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
