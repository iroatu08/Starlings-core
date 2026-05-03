import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { BookingTravelerDto } from './booking-traveler.dto';

export class CreateBookingDto {
  @ApiPropertyOptional({ type: [BookingTravelerDto] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(30)
  @ValidateNested({ each: true })
  @Type(() => BookingTravelerDto)
  travelers?: BookingTravelerDto[];
}
