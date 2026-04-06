import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { DestinationsService } from './destinations.service';

@ApiTags('destinations')
@Controller('destinations')
export class DestinationsController {
  constructor(private readonly destinationsService: DestinationsService) {}

  @Get()
  @ApiQuery({ name: 'country', required: false })
  @ApiQuery({ name: 'featured', required: false, type: Boolean })
  findAll(@Query('country') country?: string, @Query('featured') featured?: string) {
    return this.destinationsService.findAll({
      country,
      featured: featured ? featured === 'true' : undefined,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.destinationsService.findOne(id);
  }
}
