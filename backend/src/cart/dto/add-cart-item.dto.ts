import { IsUUID, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AddCartItemDto {
  @ApiProperty() @IsUUID() packageId: string;
  @ApiProperty({ default: 1 }) @IsOptional() @Type(() => Number) @IsNumber() @Min(1) quantity?: number;
}
