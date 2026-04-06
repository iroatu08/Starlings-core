import { IsString, IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateDestinationDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsString() country: string;
  @ApiProperty() @IsString() description: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() heroImageUrl?: string;
  @ApiProperty() @Type(() => Number) @IsNumber() @Min(0) priceFromNgn: number;
  @ApiProperty() @Type(() => Number) @IsNumber() @Min(0) priceFromUsd: number;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isFeatured?: boolean;
}
