import { IsString, IsNumber, IsOptional, IsBoolean, IsUUID, Min, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PackageType } from '../entities/package.entity';

export class CreatePackageDto {
  @ApiProperty({ required: false }) @IsOptional() @IsUUID() destinationId?: string;
  @ApiProperty() @IsString() name: string;
  @ApiProperty({ enum: PackageType }) @IsEnum(PackageType) type: PackageType;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
  @ApiProperty({ default: true }) @IsOptional() @IsBoolean() isRemovable?: boolean;
  @ApiProperty({ default: false }) @IsOptional() @IsBoolean() includesVisa?: boolean;
  @ApiProperty({ default: false }) @IsOptional() @IsBoolean() includesFlight?: boolean;
  @ApiProperty({ default: false }) @IsOptional() @IsBoolean() includesHotel?: boolean;
  @ApiProperty({ default: false }) @IsOptional() @IsBoolean() includesActivities?: boolean;
  @ApiProperty() @Type(() => Number) @IsNumber() @Min(0) priceNgn: number;
  @ApiProperty() @Type(() => Number) @IsNumber() @Min(0) priceUsd: number;
  @ApiProperty({ required: false, default: 1 }) @IsOptional() @Type(() => Number) @IsNumber() @Min(1) durationDays?: number;
  @ApiProperty({ default: 20 }) @IsOptional() @Type(() => Number) @IsNumber() maxCapacity?: number;
}
