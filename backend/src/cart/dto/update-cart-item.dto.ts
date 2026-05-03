import { IsNumber, Min, IsOptional, IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateCartItemDto {
  @ApiProperty({ required: false }) @IsOptional() @Type(() => Number) @IsNumber() @Min(1) quantity?: number;
  @ApiProperty({ required: false, type: [String] }) @IsOptional() @IsArray() @IsUUID('4', { each: true }) keptPackageIds?: string[];
  @ApiProperty({ required: false, type: [String] }) @IsOptional() @IsArray() @IsUUID('4', { each: true }) removedPackageIds?: string[];
}
