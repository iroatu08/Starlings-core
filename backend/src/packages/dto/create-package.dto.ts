import { IsString, IsNumber, IsOptional, IsBoolean, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreatePackageDto {
  @ApiProperty() @IsUUID() destinationId: string;
  @ApiProperty() @IsString() title: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
  @ApiProperty({ default: false }) @IsOptional() @IsBoolean() includesVisa?: boolean;
  @ApiProperty({ default: false }) @IsOptional() @IsBoolean() includesFlight?: boolean;
  @ApiProperty({ default: false }) @IsOptional() @IsBoolean() includesHotel?: boolean;
  @ApiProperty({ default: false }) @IsOptional() @IsBoolean() includesActivities?: boolean;
  @ApiProperty() @Type(() => Number) @IsNumber() @Min(0) priceNgn: number;
  @ApiProperty() @Type(() => Number) @IsNumber() @Min(0) priceUsd: number;
  @ApiProperty() @Type(() => Number) @IsNumber() @Min(1) durationDays: number;
  @ApiProperty({ default: 20 }) @IsOptional() @Type(() => Number) @IsNumber() maxCapacity?: number;
}
