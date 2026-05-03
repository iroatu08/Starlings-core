import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { DestinationsService } from './destinations.service';

@ApiTags('destinations')
@Controller('destinations')
export class DestinationsController {
  constructor(private readonly destinationsService: DestinationsService) {}

  // ─── FIND ALL DESTINATIONS ────────────────────────────────────────────
  @Get()
  @ApiQuery({ name: 'country', required: false })
  @ApiQuery({ name: 'featured', required: false, type: Boolean })
  @ApiQuery({ name: 'minPriceNgn', required: false, type: Number })
  @ApiQuery({ name: 'maxPriceNgn', required: false, type: Number })
  findAll(
    @Query('country') country?: string,
    @Query('featured') featured?: string,
    @Query('minPriceNgn') minPriceNgn?: string,
    @Query('maxPriceNgn') maxPriceNgn?: string,
  ) {
    return this.destinationsService.findAll({
      country,
      featured: featured ? featured === 'true' : undefined,
      minPriceNgn: minPriceNgn ? Number(minPriceNgn) : undefined,
      maxPriceNgn: maxPriceNgn ? Number(maxPriceNgn) : undefined,
    });
  }

  // ─── FIND ONE DESTINATION ────────────────────────────────────────────
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.destinationsService.findOne(id);
  }
}
