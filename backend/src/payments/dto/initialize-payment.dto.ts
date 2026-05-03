import { IsUUID, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class InitializePaymentDto {
  @ApiProperty() @IsUUID() bookingId: string;
  @ApiProperty() @IsString() email: string;
  @ApiProperty({ required: false, description: 'Kobo; must match booking total if sent (server uses booking amount).' })
  @IsOptional() @Type(() => Number) @IsNumber() @Min(1) amount?: number;
  @ApiProperty({ default: 'NGN' }) @IsOptional() @IsString() currency?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() callbackUrl?: string;
}
