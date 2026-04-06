import { IsString, IsOptional, IsUUID, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadImageDto {
  @ApiProperty({ required: false }) @IsOptional() @IsUUID() destinationId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() altText?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isFeatured?: boolean;
}
