import { IsString, IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateDestinationDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() name?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() country?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() heroImageUrl?: string;
  @ApiProperty({ required: false }) @IsOptional() @Type(() => Number) @IsNumber() @Min(0) priceFromNgn?: number;
  @ApiProperty({ required: false }) @IsOptional() @Type(() => Number) @IsNumber() @Min(0) priceFromUsd?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isFeatured?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @Type(() => Number) @IsNumber() latitude?: number;
  @ApiProperty({ required: false }) @IsOptional() @Type(() => Number) @IsNumber() longitude?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isActive?: boolean;
}
