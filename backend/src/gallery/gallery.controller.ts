import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { GalleryService } from './gallery.service';

@ApiTags('gallery')
@Controller('gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Get()
  @ApiQuery({ name: 'destinationId', required: false })
  findAll(@Query('destinationId') destinationId?: string) {
    return this.galleryService.findAll(destinationId);
  }
}
