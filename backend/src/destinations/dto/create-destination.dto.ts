import { IsString, IsNumber, IsOptional, IsBoolean, Min, ValidateNested, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreatePackageDto } from '../../packages/dto/create-package.dto';

export class CreateDestinationDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsString() country: string;
  @ApiProperty() @IsString() description: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() heroImageUrl?: string;
  @ApiProperty() @Type(() => Number) @IsNumber() @Min(0) priceFromNgn: number;
  @ApiProperty() @Type(() => Number) @IsNumber() @Min(0) priceFromUsd: number;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isFeatured?: boolean;
  @ApiProperty({ required: false }) @IsOptional() @Type(() => Number) @IsNumber() latitude?: number;
  @ApiProperty({ required: false }) @IsOptional() @Type(() => Number) @IsNumber() longitude?: number;
  @ApiProperty({ type: [CreatePackageDto] })
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreatePackageDto)
  packages: CreatePackageDto[];
}
