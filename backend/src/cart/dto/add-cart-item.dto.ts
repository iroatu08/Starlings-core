import { IsUUID, IsNumber, IsOptional, Min, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AddCartItemDto {
  @ApiProperty({ required: false }) @IsOptional() @IsUUID() packageId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsUUID() destinationId?: string;
  @ApiProperty({ required: false, type: [String] }) @IsOptional() @IsArray() @IsUUID('4', { each: true }) keptPackageIds?: string[];
  @ApiProperty({ required: false, type: [String] }) @IsOptional() @IsArray() @IsUUID('4', { each: true }) removedPackageIds?: string[];
  @ApiProperty({ default: 1, required: false }) @IsOptional() @Type(() => Number) @IsNumber() @Min(1) quantity?: number;
}
