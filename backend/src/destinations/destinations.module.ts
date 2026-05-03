import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DestinationsController } from './destinations.controller';
import { DestinationsService } from './destinations.service';
import { Destination } from './entities/destination.entity';
import { Package } from '../packages/entities/package.entity';
import { BookingItem } from '../bookings/entities/booking-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Destination, Package, BookingItem])],
  controllers: [DestinationsController],
  providers: [DestinationsService],
  exports: [DestinationsService],
})
export class DestinationsModule {}
