import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { GalleryService } from './gallery.service';

@ApiTags('gallery')
@Controller('gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Get()
  @ApiQuery({ name: 'destinationId', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(
    @Query('destinationId') destinationId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.galleryService.findAll(destinationId, page, limit);
  }
}
