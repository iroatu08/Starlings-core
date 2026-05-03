import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class AdminSendEmailDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  toEmail?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  broadcastToAll?: boolean;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  subject: string;

  @ApiProperty({ description: 'HTML body' })
  @IsString()
  @MinLength(1)
  htmlBody: string;
}
