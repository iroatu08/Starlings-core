import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as cloudinary from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { GalleryImage } from './entities/gallery.entity';
import { UploadImageDto } from './dto/upload-image.dto';

@Injectable()
export class GalleryService {
  constructor(
    @InjectRepository(GalleryImage) private repo: Repository<GalleryImage>,
    private configService: ConfigService,
  ) {
    cloudinary.v2.config({
      cloud_name: configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: configService.get('CLOUDINARY_API_KEY'),
      api_secret: configService.get('CLOUDINARY_API_SECRET'),
    });
  }

  findAll(destinationId?: string) {
    const qb = this.repo.createQueryBuilder('img').leftJoinAndSelect('img.destination', 'dest');
    if (destinationId) qb.where('img.destinationId = :destinationId', { destinationId });
    return qb.orderBy('img.createdAt', 'DESC').getMany();
  }

  async uploadImage(file: Express.Multer.File, dto: UploadImageDto) {
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.v2.uploader.upload_stream(
        { folder: 'starlings', resource_type: 'image' },
        (error, result) => { error ? reject(error) : resolve(result); },
      ).end(file.buffer);
    });

    const image = this.repo.create({
      destinationId: dto.destinationId,
      cloudinaryPublicId: result.public_id,
      url: result.secure_url,
      altText: dto.altText,
      width: result.width,
      height: result.height,
      isFeatured: dto.isFeatured || false,
    });

    return this.repo.save(image);
  }

  async remove(id: string) {
    const image = await this.repo.findOne({ where: { id } });
    if (!image) throw new NotFoundException('Image not found');

    await cloudinary.v2.uploader.destroy(image.cloudinaryPublicId);
    await this.repo.delete(id);
    return { message: 'Image deleted' };
  }
}
